// ============================================================================
//  Moons of the Planets — 3D engine & UI
// ----------------------------------------------------------------------------
//  One shared WebGL scene. Choosing a planet rebuilds the scene with that
//  planet at the centre and EVERY known moon — named or provisional — placed on
//  a compressed orbital scale so all of them are visible and reachable by
//  dragging. Every moon is hoverable (tooltip) and listed in the side panel;
//  the notable "main" moons are highlighted with facts and halos.
// ============================================================================

import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

// SYSTEMS   — curated worlds + notable moons (facts, colours, textures) : data.js
// MOONS_FULL— full JPL catalogue of every moon per planet             : moons_full.js
// Both are loaded as classic scripts before this module.
/* global SYSTEMS, MOONS_FULL */

// ---------------------------------------------------------------- constants --
const PLANET_DISPLAY_R = 8.5;      // every planet drawn at this radius (world units)
const ORBIT_MIN = 13;              // nearest moon orbit (kept clear of the planet)
const MOON_MIN = 0.3;              // smallest visible moon radius
const MOON_MAX = 2.8;              // largest moon radius (relative to planet)
// A palette of realistic moon tints (icy grey-white, tan, rock, reddish, bluish)
// so the catalogue moons aren't a uniform grey. Chosen by a stable name hash.
const MOON_TINTS = [
  0xb8b0a3, 0xcdc6ba, 0x9c8f7c, 0xa89684, 0x8a7d6d,
  0x7f8a93, 0xc7bcaa, 0x6f6a63, 0xb0a597, 0x9a8a78,
  0xc2a98c, 0x8d9299,
];
function hashStr(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
function moonTint(name) { return MOON_TINTS[hashStr(name) % MOON_TINTS.length]; }

// The full moon list for a world = JPL catalogue, with curated facts/colour/
// radius/texture overlaid by name. Dwarf planets beyond Pluto aren't in the JPL
// set, so they fall back to their curated moon list.
function moonsFor(sys) {
  const curated = sys.moons || [];
  const full = (typeof MOONS_FULL !== "undefined" && MOONS_FULL[sys.name]) || null;
  if (!full) return curated.map((m) => ({ ...m, curated: true }));

  const byName = new Map(curated.map((m) => [m.name, m]));
  const merged = full.map((fm) => {
    const c = byName.get(fm.name);
    if (c) return { ...c, distance: fm.distance, curated: true };   // curated wins, JPL distance
    return {                                                        // catalogue-only moon
      name: fm.name, radius: fm.r, distance: fm.distance,
      discovered: fm.discovered, by: null, color: moonTint(fm.name),
      famous: false, est: true, curated: false,
    };
  });
  // safety: keep any curated moon the catalogue somehow lacks
  const have = new Set(merged.map((m) => m.name));
  curated.forEach((c) => { if (!have.has(c.name)) merged.push({ ...c, curated: true }); });
  return merged;
}

// ---------------------------------------------------------------- DOM refs ---
const canvas      = document.getElementById("scene");
const loader      = document.getElementById("loader");
const planetNav   = document.getElementById("planetNav");
const homeGrid    = document.getElementById("homeGrid");
const homeSection = document.getElementById("home");
const planetView  = document.getElementById("planetView");
const tooltip     = document.getElementById("tooltip");
const famousList  = document.getElementById("famousList");

// ---------------------------------------------------------------- three core -
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);

const scene  = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 4000);
camera.position.set(0, 14, 46);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.rotateSpeed = 0.6;
controls.minDistance = 9;
controls.maxDistance = 260;
controls.autoRotate = true;
controls.autoRotateSpeed = 0.35;

// Lighting: a soft "sun" plus ambient fill so night sides aren't pure black.
const sun = new THREE.DirectionalLight(0xffffff, 2.4);
sun.position.set(60, 30, 40);
scene.add(sun);
scene.add(new THREE.AmbientLight(0x6a7bbf, 0.55));
scene.add(new THREE.HemisphereLight(0xbcd2ff, 0x141018, 0.35));

// Starfield background.
const texLoader = new THREE.TextureLoader();
texLoader.load("textures/2k_stars_milky_way.jpg", (t) => {
  t.colorSpace = THREE.SRGBColorSpace;
  t.mapping = THREE.EquirectangularReflectionMapping;
  scene.background = t;
}, undefined, () => { scene.background = new THREE.Color(0x05070f); });

// ---------------------------------------------------------------- scaling ----
// Compress the huge real orbital range onto [ORBIT_MIN, ORBIT_MAX] using ranked
// spacing (so crowded inner moons still separate) blended with a log of the
// true distance (so relative order & rough spacing read true).
function computeOrbitRadii(moons, outerR) {
  const n = moons.length;
  const dists = moons.map((m) => m.distance);
  const logMin = Math.log10(Math.min(...dists));
  const logMax = Math.log10(Math.max(...dists));
  const span = Math.max(logMax - logMin, 0.0001);
  // rank by true distance
  const order = moons.map((m, i) => i).sort((a, b) => dists[a] - dists[b]);
  const rankOf = new Array(n);
  order.forEach((idx, rank) => { rankOf[idx] = rank; });
  return moons.map((m, i) => {
    const logT = n > 1 ? (Math.log10(m.distance) - logMin) / span : 0;   // 0..1 by distance
    const rankT = n > 1 ? rankOf[i] / (n - 1) : 0;                       // 0..1 by rank
    const t = 0.45 * logT + 0.55 * rankT;                                // blend
    return ORBIT_MIN + t * (outerR - ORBIT_MIN);
  });
}

// crowded systems (Jupiter 115, Saturn 291) need a wider shell to stay legible,
// but not so wide the moons shrink to sub-pixel dots lost among the stars.
function outerRadiusFor(n) {
  return Math.min(46 + Math.max(0, n - 20) * 0.14, 72);
}

// Moon display radius: sqrt scale between the system's own min/max real radii.
function computeMoonRadius(r, rMin, rMax) {
  if (rMax <= rMin) return (MOON_MIN + MOON_MAX) / 2 * 0.4;
  const t = (Math.sqrt(r) - Math.sqrt(rMin)) / (Math.sqrt(rMax) - Math.sqrt(rMin));
  return MOON_MIN + t * (MOON_MAX - MOON_MIN);
}

// ---------------------------------------------------------------- state ------
let current = null;          // active system
let currentMoons = [];       // merged moon list for the active system (shared)
let systemDrift = true;      // gentle rotation of the whole moon system (paused on focus)
let focusedMesh = null;      // moon the camera flew to via a side-panel click
const hoverables = [];       // meshes that respond to hover (moons)
let planetGroup = null;      // group holding planet + moons, rotates gently
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let hovered = null;
const sharedGeo = new THREE.SphereGeometry(1, 48, 48);

// ---------------------------------------------------------------- build view -
function clearScene() {
  if (planetGroup) {
    scene.remove(planetGroup);
    planetGroup.traverse((o) => {
      if (o.geometry && o.geometry !== sharedGeo) o.geometry.dispose();
      if (o.material) {
        const mats = Array.isArray(o.material) ? o.material : [o.material];
        mats.forEach((m) => { if (m.map) m.map.dispose(); m.dispose(); });
      }
    });
  }
  planetGroup = null;
  hoverables.length = 0;
  hovered = null;
  focusedMesh = null;
  tooltip.hidden = true;
}

function makeBody(radius, color, texturePath, extra = {}) {
  const mat = new THREE.MeshStandardMaterial({
    color: texturePath ? 0xffffff : color,
    roughness: 0.92,
    metalness: 0.02,
    ...extra,
  });
  if (texturePath) {
    texLoader.load(
      texturePath,
      (t) => { t.colorSpace = THREE.SRGBColorSpace; mat.map = t; mat.color.set(0xffffff); mat.needsUpdate = true; },
      undefined,
      () => { mat.color.set(color); }   // fallback to flat color on error
    );
  }
  const mesh = new THREE.Mesh(sharedGeo, mat);
  mesh.scale.setScalar(radius);
  return mesh;
}

// -------------------------------------------------- procedural moon surfaces --
// A handful of shared GREYSCALE detail textures (craters, mottling, speckle).
// Each moon uses one as both colour map and bump map; the material's colour
// tints it, so one texture serves many moons cheaply. Built once, on demand.
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function drawCrater(ctx, x, y, r) {
  const g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, 0, x, y, r);
  g.addColorStop(0, "rgba(60,60,60,0.55)");         // shadowed floor
  g.addColorStop(0.72, "rgba(95,95,95,0.32)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill();
  ctx.strokeStyle = "rgba(238,238,238,0.42)";       // bright rim
  ctx.lineWidth = Math.max(0.5, r * 0.16);
  ctx.beginPath(); ctx.arc(x, y, r * 0.94, 0, 7); ctx.stroke();
}
function makeMoonDetail(seed) {
  const S = 256, c = document.createElement("canvas");
  c.width = S; c.height = S;
  const ctx = c.getContext("2d"), rnd = mulberry32(seed);
  ctx.fillStyle = "#cbcbcb"; ctx.fillRect(0, 0, S, S);         // bright base (keeps colours vivid)
  for (let i = 0; i < 14; i++) {                               // large-scale mottling
    const x = rnd() * S, y = rnd() * S, r = 40 + rnd() * 90;
    const v = 150 + Math.floor(rnd() * 95), a = 0.08 + rnd() * 0.14;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, `rgba(${v},${v},${v},${a})`);
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill();
  }
  const craters = 55 + Math.floor(rnd() * 55);
  for (let i = 0; i < craters; i++) {
    const r = 1.5 + rnd() * rnd() * 15, x = rnd() * S, y = rnd() * S;
    drawCrater(ctx, x, y, r);
    if (x < r * 2) drawCrater(ctx, x + S, y, r);              // wrap across the seam
    if (x > S - r * 2) drawCrater(ctx, x - S, y, r);
  }
  const img = ctx.getImageData(0, 0, S, S), d = img.data;      // fine speckle
  for (let i = 0; i < d.length; i += 4) {
    const n = (rnd() - 0.5) * 26;
    d[i] += n; d[i + 1] += n; d[i + 2] += n;
  }
  ctx.putImageData(img, 0, 0);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.anisotropy = 4;
  return tex;
}
let moonDetails = null;
function moonDetailFor(name) {
  if (!moonDetails) moonDetails = [1, 2, 3, 4, 5, 6].map(makeMoonDetail);
  return moonDetails[hashStr(name) % moonDetails.length];
}

function buildSystem(sys) {
  clearScene();
  current = sys;
  systemDrift = true;                 // resume gentle drift for the new system
  planetGroup = new THREE.Group();
  scene.add(planetGroup);

  // --- planet -------------------------------------------------------------
  const planet = makeBody(PLANET_DISPLAY_R, sys.color, sys.texture);
  planetGroup.add(planet);

  // Saturn / ringed bodies get a ring.
  if (sys.ring) {
    const ringGeo = new THREE.RingGeometry(PLANET_DISPLAY_R * 1.25, PLANET_DISPLAY_R * 2.2, 96);
    // remap UVs so the ring texture runs radially
    const pos = ringGeo.attributes.position;
    const uv = ringGeo.attributes.uv;
    const v3 = new THREE.Vector3();
    const midR = (PLANET_DISPLAY_R * 1.25 + PLANET_DISPLAY_R * 2.2) / 2;
    for (let i = 0; i < pos.count; i++) {
      v3.fromBufferAttribute(pos, i);
      uv.setXY(i, v3.length() < midR ? 0 : 1, 1);
    }
    const ringMat = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide, transparent: true, opacity: 0.9 });
    texLoader.load(sys.ring, (t) => { t.colorSpace = THREE.SRGBColorSpace; ringMat.map = t; ringMat.needsUpdate = true; });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2.1;
    planetGroup.add(ring);
  }

  // subtle atmosphere glow
  const glow = new THREE.Mesh(
    sharedGeo,
    new THREE.MeshBasicMaterial({ color: sys.color, transparent: true, opacity: 0.12, side: THREE.BackSide })
  );
  glow.scale.setScalar(PLANET_DISPLAY_R * 1.06);
  planetGroup.add(glow);

  // --- moons --------------------------------------------------------------
  const moons = currentMoons;                       // merged list (set in goToPlanet)
  const outerR = outerRadiusFor(moons.length);
  const radii = computeOrbitRadii(moons, outerR);
  const rMin = Math.min(...moons.map((m) => m.radius));
  const rMax = Math.max(...moons.map((m) => m.radius));

  moons.forEach((moon, i) => {
    const orbitR = radii[i];
    // stable pseudo-random angle & inclination from index
    const ang = (i * 2.399963) % (Math.PI * 2);              // golden-angle spread
    const inc = ((i * 137.5) % 40 - 20) * (Math.PI / 180);   // ±20° tilt
    const x = Math.cos(ang) * orbitR;
    const z = Math.sin(ang) * orbitR;
    const y = Math.sin(inc) * orbitR * 0.5;

    const mR = computeMoonRadius(moon.radius, rMin, rMax);
    // faint self-illumination lifts the night side so tiny moons stay readable
    // against the starfield from any angle (a touch brighter for the small ones)
    const glint = moon.est ? 0x2a2820 : 0x14140f;
    let extra = {};
    if (!moon.texture) {
      const detail = moonDetailFor(moon.name);          // procedural craters + relief
      extra = { map: detail, bumpMap: detail, bumpScale: 0.4, roughness: 0.95, emissive: glint };
    }
    const mesh = makeBody(mR, moon.color, moon.texture, extra);
    mesh.position.set(x, y, z);
    mesh.userData = { moon, emissiveBase: moon.texture ? 0x000000 : glint };
    planetGroup.add(mesh);
    hoverables.push(mesh);
    moon._mesh = mesh;                              // back-reference for fast lookup

    // Orbit rings only for the curated / notable moons — drawing one for every
    // catalogue moon (up to 291) would bury the view in clutter.
    if (moon.curated) {
      const ringGeo = new THREE.RingGeometry(orbitR - 0.02, orbitR + 0.02, 96);
      const ring = new THREE.Mesh(ringGeo, new THREE.MeshBasicMaterial({
        color: moon.famous ? 0xffd27f : 0x5566aa,
        transparent: true, opacity: moon.famous ? 0.30 : 0.12, side: THREE.DoubleSide,
      }));
      ring.rotation.x = Math.PI / 2 - inc;
      planetGroup.add(ring);
    }

    // a bright halo for famous ("main") moons so they're easy to spot
    if (moon.famous) {
      const halo = new THREE.Mesh(sharedGeo, new THREE.MeshBasicMaterial({
        color: 0xffd27f, transparent: true, opacity: 0.16, side: THREE.BackSide,
      }));
      halo.scale.setScalar(Math.max(mR * 1.7, 0.5));
      halo.position.copy(mesh.position);
      mesh.userData.halo = halo;
      planetGroup.add(halo);
    }
  });

  // frame the camera
  controls.target.set(0, 0, 0);
  camera.position.set(0, outerR * 0.38, outerR * 1.02);
  controls.minDistance = PLANET_DISPLAY_R + 3;   // don't let zoom pass into the planet
  controls.maxDistance = outerR * 3.2;
  controls.update();
}

// ---------------------------------------------------------------- side panel -
function fmtSize(moon) {
  const d = moon.radius * 2;
  const val = d >= 10 ? Math.round(d).toLocaleString()
            : d >= 1  ? d.toFixed(0)
            : d.toFixed(1);
  return moon.est ? `≈ ${val} km across (est.)` : `${val} km across`;
}
function fmtDistance(km) {
  return km >= 1e6 ? `${(km / 1e6).toFixed(2)} M km out` : `${Math.round(km).toLocaleString()} km out`;
}
function fmtDiscovery(moon) {
  const when = (moon.discovered === "ancient") ? "in antiquity"
             : (moon.discovered === "?" || moon.discovered == null) ? null
             : moon.discovered;
  if (when && moon.by) return `Discovered ${when} · ${moon.by}`;
  if (when)            return `Discovered ${when}`;
  return "Discovery details not catalogued";
}
function hex(c) { return "#" + c.toString(16).padStart(6, "0"); }

function renderSidePanel(sys) {
  document.getElementById("planetName").textContent = sys.name;
  const tagEl = document.getElementById("planetTag");
  tagEl.textContent = sys.dwarf ? "Dwarf planet" : "Planet";
  tagEl.className = "tag" + (sys.dwarf ? " dwarf" : "");
  document.getElementById("planetBlurb").textContent = sys.blurb;

  const moons = currentMoons;
  const famous = moons.filter((m) => m.famous);
  document.getElementById("moonCount").textContent =
    `${moons.length} known moon${moons.length > 1 ? "s" : ""} · ${famous.length} highlighted`;

  famousList.innerHTML = "";

  // --- main / famous moons (with facts) -----------------------------------
  famous.forEach((moon) => {
    const card = document.createElement("div");
    card.className = "moon-card";
    card.innerHTML = `
      <div class="mc-head">
        <span class="mc-dot" style="background:${hex(moon.color)}"></span>
        <span class="mc-name">${moon.name}</span>
        <span class="mc-sub">${fmtSize(moon)}</span>
      </div>
      <p class="mc-fact">${moon.fact || ""}</p>`;
    wireMoonCard(card, moon);
    famousList.appendChild(card);
  });

  // --- every moon (compact rows) ------------------------------------------
  const others = moons.filter((m) => !m.famous)
                      .sort((a, b) => a.distance - b.distance);
  if (others.length) {
    const h = document.createElement("h3");
    h.className = "side-title all-title";
    h.textContent = `All ${moons.length} moons`;
    famousList.appendChild(h);

    const list = document.createElement("div");
    list.className = "all-moons";
    others.forEach((moon) => {
      const row = document.createElement("button");
      row.className = "moon-row";
      row.innerHTML = `
        <span class="mr-dot" style="background:${hex(moon.color)}"></span>
        <span class="mr-name">${moon.name}</span>
        <span class="mr-sub">${fmtSize(moon)}</span>`;
      wireMoonCard(row, moon);
      list.appendChild(row);
    });
    famousList.appendChild(list);
  }
  famousList.parentElement.scrollTop = 0;
}

function wireMoonCard(el, moon) {
  el.addEventListener("click", () => focusMoon(moon, el));
  el.addEventListener("mouseenter", () => highlightMesh(moon, true));
  el.addEventListener("mouseleave", () => highlightMesh(moon, false));
}

function meshForMoon(moon) {
  return moon._mesh || hoverables.find((m) => m.userData.moon === moon);
}

// briefly emphasise a moon's halo when hovering its side card
function highlightMesh(moon, on) {
  const mesh = meshForMoon(moon);
  if (!mesh) return;
  if (mesh.userData.halo) mesh.userData.halo.material.opacity = on ? 0.5 : 0.16;
  mesh.material.emissive?.setHex(on ? 0x333044 : (mesh.userData.emissiveBase ?? 0x000000));
}

// fly the camera to look at a moon
function focusMoon(moon, card) {
  const mesh = meshForMoon(moon);
  if (!mesh) return;
  document.querySelectorAll(".focused").forEach((c) => c.classList.remove("focused"));
  if (card) card.classList.add("focused");
  controls.autoRotate = false;
  systemDrift = false;                       // freeze the swarm so the moon stays centred
  focusedMesh = mesh;                        // keep the tooltip glued to it during the fly-in

  // The moon is a child of the slowly-rotating planetGroup, so aim at its true
  // WORLD position (its local position is un-rotated and would land off-target).
  planetGroup.updateMatrixWorld(true);
  const target = mesh.getWorldPosition(new THREE.Vector3());
  const dist = Math.max(4, mesh.scale.x * 9);
  const dir = target.clone().normalize();
  const camGoal = target.clone().add(dir.multiplyScalar(dist)).add(new THREE.Vector3(0, dist * 0.35, 0));
  animateCamera(camGoal, target);
  showTooltipForMesh(mesh, worldToScreen(target));
}

// smooth camera tween — time-based so it completes in a fixed duration
// regardless of frame rate (slow devices just get fewer, larger steps).
let camTween = null;
function animateCamera(posGoal, targetGoal) {
  camTween = {
    from: camera.position.clone(), to: posGoal,
    tf: controls.target.clone(), tt: targetGoal,
    start: performance.now(), dur: 700,
  };
}

// ---------------------------------------------------------------- hover ------
function worldToScreen(v) {
  const p = v.clone().project(camera);
  return { x: (p.x * 0.5 + 0.5) * window.innerWidth, y: (-p.y * 0.5 + 0.5) * window.innerHeight };
}

function showTooltipForMesh(mesh, screen) {
  const moon = mesh.userData.moon;
  const note = moon.fact
    ? `<p class="tt-fact">${moon.fact}</p>`
    : (moon.est ? `<p class="tt-fact tt-dim">A small outer moon; no detailed measurements or story recorded yet. Its size here is an estimate.</p>` : "");
  tooltip.innerHTML = `
    <div class="tt-name">${moon.name}${moon.famous ? '<span class="tt-badge">Main moon</span>' : ""}</div>
    <div class="tt-stats">
      <span>${fmtSize(moon)}</span>
      <span>${fmtDistance(moon.distance)}</span>
    </div>
    ${note}
    <div class="tt-disc">${fmtDiscovery(moon)}</div>`;
  tooltip.style.left = screen.x + "px";
  tooltip.style.top = screen.y + "px";
  tooltip.hidden = false;
}

function onPointerMove(e) {
  pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
  if (!current) return;
  raycaster.setFromCamera(pointer, camera);
  const hits = raycaster.intersectObjects(hoverables, false);
  const hit = hits.length ? hits[0].object : null;

  if (hit !== hovered) {
    if (hovered) hovered.material.emissive?.setHex(hovered.userData.emissiveBase ?? 0x000000);
    hovered = hit;
    if (hovered) {
      hovered.material.emissive?.setHex(0x333044);
      canvas.style.cursor = "pointer";
    } else {
      canvas.style.cursor = "grab";
      // fall back to the flown-to moon's tooltip instead of hiding it
      if (focusedMesh) showTooltipForMesh(focusedMesh, worldToScreen(focusedMesh.getWorldPosition(new THREE.Vector3())));
      else tooltip.hidden = true;
    }
  }
  if (hovered) showTooltipForMesh(hovered, { x: e.clientX, y: e.clientY });
}

function onClick() {
  if (hovered) focusMoon(hovered.userData.moon, null);
}

canvas.addEventListener("pointermove", onPointerMove);
canvas.addEventListener("click", onClick);

// dragging the scene dismisses a flown-to moon's pinned tooltip
controls.addEventListener("start", () => {
  if (!focusedMesh) return;
  focusedMesh = null;
  document.querySelectorAll(".focused").forEach((c) => c.classList.remove("focused"));
  if (!hovered) tooltip.hidden = true;
});

// ---------------------------------------------------------------- nav / home -
function buildNav() {
  SYSTEMS.forEach((sys) => {
    const b = document.createElement("button");
    b.className = "nav-btn" + (sys.dwarf ? " dwarf" : "");
    b.textContent = sys.name;
    b.dataset.system = sys.name;
    b.addEventListener("click", () => goToPlanet(sys.name));
    planetNav.appendChild(b);
  });

  SYSTEMS.forEach((sys) => {
    const card = document.createElement("div");
    card.className = "planet-card";
    const orbStyle = sys.texture
      ? `background-image:url('${sys.texture}')`
      : `background:radial-gradient(circle at 38% 32%, ${hex(sys.color)}, #05070f)`;
    const n = moonsFor(sys).length;                  // full catalogue count
    card.innerHTML = `
      ${sys.dwarf ? '<span class="pc-dwarf">Dwarf</span>' : ""}
      <div class="planet-orb" style="${orbStyle}"></div>
      <h3>${sys.name}</h3>
      <p class="pc-meta">${n} moon${n > 1 ? "s" : ""}</p>`;
    card.addEventListener("click", () => goToPlanet(sys.name));
    homeGrid.appendChild(card);
  });
}

function setActiveNav(name) {
  document.querySelectorAll(".nav-btn").forEach((b) =>
    b.classList.toggle("active", b.dataset.system === name));
}

function goToPlanet(name) {
  const sys = SYSTEMS.find((s) => s.name === name);
  if (!sys) return;
  currentMoons = moonsFor(sys);      // build merged list once; scene + panel share it
  buildSystem(sys);
  renderSidePanel(sys);
  setActiveNav(name);
  controls.autoRotate = true;
  homeSection.style.display = "none";
  planetView.hidden = false;
  applyViewOffset();
  history.replaceState(null, "", "#" + name.toLowerCase());
}

function goHome() {
  clearScene();
  current = null;
  homeSection.style.display = "";
  planetView.hidden = true;
  applyViewOffset();
  setActiveNav(null);
  // idle: slowly show Earth's system behind the home overlay for ambience
  currentMoons = moonsFor(SYSTEMS[0]);
  buildSystem(SYSTEMS[0]);
  history.replaceState(null, "", "#home");
}

document.querySelectorAll("[data-goto='home']").forEach((el) =>
  el.addEventListener("click", goHome));

// keep the view in sync with the URL hash (deep links, back/forward button)
window.addEventListener("hashchange", () => {
  const h = decodeURIComponent(location.hash.replace("#", ""));
  const match = SYSTEMS.find((s) => s.name.toLowerCase() === h.toLowerCase());
  if (match && match !== current) goToPlanet(match.name);
  else if ((!h || h === "home") && current) goHome();
});

// ---------------------------------------------------------------- loop -------
function animate() {
  requestAnimationFrame(animate);
  if (planetGroup && systemDrift) planetGroup.rotation.y += 0.0006;   // gentle system drift

  if (camTween) {
    const t = Math.min(1, (performance.now() - camTween.start) / camTween.dur);
    const e = 1 - Math.pow(1 - t, 3);                   // ease-out cubic
    camera.position.lerpVectors(camTween.from, camTween.to, e);
    controls.target.lerpVectors(camTween.tf, camTween.tt, e);
    if (t >= 1) camTween = null;
  }

  // keep tooltip glued to the hovered or flown-to moon (tracks the fly-in and drift)
  const anchor = hovered || focusedMesh;
  if (anchor && !tooltip.hidden) {
    const s = worldToScreen(anchor.getWorldPosition(new THREE.Vector3()));
    tooltip.style.left = s.x + "px";
    tooltip.style.top = s.y + "px";
  }

  controls.update();
  renderer.render(scene, camera);
}

// ---------------------------------------------------------------- view offset -
// The side panel (left on desktop, bottom on mobile) covers part of the canvas.
// Shift the rendered frustum so the planet + moons sit in the *visible* area
// instead of behind the panel. Raycasting stays correct because the offset lives
// in the camera's projection matrix.
function applyViewOffset() {
  const W = window.innerWidth, H = window.innerHeight;
  if (planetView.hidden) { camera.clearViewOffset(); return; }
  if (W > 720) {
    const side = parseFloat(
      getComputedStyle(document.documentElement).getPropertyValue("--side-w")) || 340;
    camera.setViewOffset(W, H, -side / 2, 0, W, H);   // negative x → content shifts right
  } else {
    const panelH = H * 0.46;                          // bottom panel height (46vh)
    camera.setViewOffset(W, H, 0, panelH / 2, W, H);  // positive y → content shifts up
  }
}

// ---------------------------------------------------------------- resize -----
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  applyViewOffset();
});

// ---------------------------------------------------------------- boot -------
buildNav();
animate();

// hide loader once the star texture (or a short timeout) is ready
let booted = false;
function boot() {
  if (booted) return; booted = true;
  loader.classList.add("hidden");
  setTimeout(() => (loader.style.display = "none"), 700);
  // deep link support (#mars etc.)
  const hash = decodeURIComponent(location.hash.replace("#", ""));
  const match = SYSTEMS.find((s) => s.name.toLowerCase() === hash.toLowerCase());
  if (match) goToPlanet(match.name);
  else goHome();
}
texLoader.load("textures/2k_stars_milky_way.jpg", boot, undefined, boot);
setTimeout(boot, 2500);   // safety net
