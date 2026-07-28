// ============================================================================
//  Moons of the Planets — 3D engine & UI
// ----------------------------------------------------------------------------
//  One shared WebGL scene. Choosing a planet rebuilds the scene with that
//  planet at the centre and every named moon placed on a compressed orbital
//  scale so all of them are visible and reachable by dragging. Hovering a moon
//  raycasts and shows a tooltip; the side panel lists the famous moons.
// ============================================================================

import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

// SYSTEMS comes from data.js (loaded as a classic script before this module).
/* global SYSTEMS */

// ---------------------------------------------------------------- constants --
const PLANET_DISPLAY_R = 6;        // every planet drawn at this radius (world units)
const ORBIT_MIN = 9;               // nearest moon orbit
const ORBIT_MAX = 46;              // farthest moon orbit
const MOON_MIN = 0.11;             // smallest visible moon radius
const MOON_MAX = 1.7;              // largest moon radius (relative to planet)

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
function computeOrbitRadii(moons) {
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
    return ORBIT_MIN + t * (ORBIT_MAX - ORBIT_MIN);
  });
}

// Moon display radius: sqrt scale between the system's own min/max real radii.
function computeMoonRadius(r, rMin, rMax) {
  if (rMax <= rMin) return (MOON_MIN + MOON_MAX) / 2 * 0.4;
  const t = (Math.sqrt(r) - Math.sqrt(rMin)) / (Math.sqrt(rMax) - Math.sqrt(rMin));
  return MOON_MIN + t * (MOON_MAX - MOON_MIN);
}

// ---------------------------------------------------------------- state ------
let current = null;          // active system
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

function buildSystem(sys) {
  clearScene();
  current = sys;
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
  const radii = computeOrbitRadii(sys.moons);
  const rMin = Math.min(...sys.moons.map((m) => m.radius));
  const rMax = Math.max(...sys.moons.map((m) => m.radius));

  sys.moons.forEach((moon, i) => {
    const orbitR = radii[i];
    // stable pseudo-random angle & inclination from index
    const ang = (i * 2.399963) % (Math.PI * 2);              // golden-angle spread
    const inc = ((i * 137.5) % 34 - 17) * (Math.PI / 180);   // ±17° tilt
    const x = Math.cos(ang) * orbitR;
    const z = Math.sin(ang) * orbitR;
    const y = Math.sin(inc) * orbitR * 0.5;

    const mR = computeMoonRadius(moon.radius, rMin, rMax);
    const mesh = makeBody(mR, moon.color, moon.texture);
    mesh.position.set(x, y, z);
    mesh.userData = { moon, baseColor: moon.color };
    planetGroup.add(mesh);
    hoverables.push(mesh);

    // faint orbit ring
    const ringGeo = new THREE.RingGeometry(orbitR - 0.015, orbitR + 0.015, 96);
    const ring = new THREE.Mesh(ringGeo, new THREE.MeshBasicMaterial({
      color: moon.famous ? 0xffd27f : 0x5566aa,
      transparent: true, opacity: moon.famous ? 0.28 : 0.10, side: THREE.DoubleSide,
    }));
    ring.rotation.x = Math.PI / 2 - inc;
    planetGroup.add(ring);

    // a bright halo for famous moons so they're easy to spot
    if (moon.famous) {
      const halo = new THREE.Mesh(sharedGeo, new THREE.MeshBasicMaterial({
        color: 0xffd27f, transparent: true, opacity: 0.16, side: THREE.BackSide,
      }));
      halo.scale.setScalar(mR * 1.6);
      halo.position.copy(mesh.position);
      mesh.userData.halo = halo;
      planetGroup.add(halo);
    }
  });

  // frame the camera
  controls.target.set(0, 0, 0);
  camera.position.set(0, ORBIT_MAX * 0.42, ORBIT_MAX * 1.35);
  controls.minDistance = 9;
  controls.maxDistance = ORBIT_MAX * 3;
  controls.update();
}

// ---------------------------------------------------------------- side panel -
function fmtRadius(r) {
  const d = r * 2;
  return d >= 1 ? `${Math.round(d).toLocaleString()} km across` : `~${(d).toFixed(1)} km across`;
}
function fmtDistance(km) {
  return km >= 1e6 ? `${(km / 1e6).toFixed(2)} M km out` : `${Math.round(km).toLocaleString()} km out`;
}
function hex(c) { return "#" + c.toString(16).padStart(6, "0"); }

function renderSidePanel(sys) {
  document.getElementById("planetName").textContent = sys.name;
  const tagEl = document.getElementById("planetTag");
  tagEl.textContent = sys.dwarf ? "Dwarf planet" : "Planet";
  tagEl.className = "tag" + (sys.dwarf ? " dwarf" : "");
  document.getElementById("planetBlurb").textContent = sys.blurb;
  const famous = sys.moons.filter((m) => m.famous);
  document.getElementById("moonCount").textContent =
    `${sys.moons.length} named moon${sys.moons.length > 1 ? "s" : ""} · ${famous.length} highlighted`;

  famousList.innerHTML = "";
  famous.forEach((moon) => {
    const card = document.createElement("div");
    card.className = "moon-card";
    card.innerHTML = `
      <div class="mc-head">
        <span class="mc-dot" style="background:${hex(moon.color)}"></span>
        <span class="mc-name">${moon.name}</span>
        <span class="mc-sub">${fmtRadius(moon.radius)}</span>
      </div>
      <p class="mc-fact">${moon.fact || ""}</p>`;
    card.addEventListener("click", () => focusMoon(moon, card));
    card.addEventListener("mouseenter", () => highlightMesh(moon, true));
    card.addEventListener("mouseleave", () => highlightMesh(moon, false));
    famousList.appendChild(card);
  });
  famousList.parentElement.scrollTop = 0;
}

function meshForMoon(moon) {
  return hoverables.find((m) => m.userData.moon === moon);
}

// briefly emphasise a moon's halo when hovering its side card
function highlightMesh(moon, on) {
  const mesh = meshForMoon(moon);
  if (!mesh) return;
  if (mesh.userData.halo) mesh.userData.halo.material.opacity = on ? 0.5 : 0.16;
  mesh.material.emissive?.setHex(on ? 0x333044 : 0x000000);
}

// fly the camera to look at a moon
function focusMoon(moon, card) {
  const mesh = meshForMoon(moon);
  if (!mesh) return;
  document.querySelectorAll(".moon-card.focused").forEach((c) => c.classList.remove("focused"));
  if (card) card.classList.add("focused");
  controls.autoRotate = false;

  const target = mesh.position.clone();
  const dist = Math.max(4, mesh.scale.x * 9);
  const dir = target.clone().normalize();
  const camGoal = target.clone().add(dir.multiplyScalar(dist)).add(new THREE.Vector3(0, dist * 0.35, 0));
  animateCamera(camGoal, target);
  showTooltipForMesh(mesh, worldToScreen(mesh.position));
}

// smooth camera tween
let camTween = null;
function animateCamera(posGoal, targetGoal) {
  camTween = { from: camera.position.clone(), to: posGoal, tf: controls.target.clone(), tt: targetGoal, t: 0 };
}

// ---------------------------------------------------------------- hover ------
function worldToScreen(v) {
  const p = v.clone().project(camera);
  return { x: (p.x * 0.5 + 0.5) * window.innerWidth, y: (-p.y * 0.5 + 0.5) * window.innerHeight };
}

function showTooltipForMesh(mesh, screen) {
  const moon = mesh.userData.moon;
  tooltip.innerHTML = `
    <div class="tt-name">${moon.name}${moon.famous ? '<span class="tt-badge">Famous</span>' : ""}</div>
    <div class="tt-stats">
      <span>${fmtRadius(moon.radius)}</span>
      <span>${fmtDistance(moon.distance)}</span>
    </div>
    ${moon.fact ? `<p class="tt-fact">${moon.fact}</p>` : ""}
    <div class="tt-disc">Discovered ${moon.discovered === "ancient" ? "in antiquity" : moon.discovered} · ${moon.by}</div>`;
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
    if (hovered) hovered.material.emissive?.setHex(0x000000);
    hovered = hit;
    if (hovered) {
      hovered.material.emissive?.setHex(0x333044);
      canvas.style.cursor = "pointer";
    } else {
      canvas.style.cursor = "grab";
      tooltip.hidden = true;
    }
  }
  if (hovered) showTooltipForMesh(hovered, { x: e.clientX, y: e.clientY });
}

function onClick() {
  if (hovered) focusMoon(hovered.userData.moon, null);
}

canvas.addEventListener("pointermove", onPointerMove);
canvas.addEventListener("click", onClick);

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
    card.innerHTML = `
      ${sys.dwarf ? '<span class="pc-dwarf">Dwarf</span>' : ""}
      <div class="planet-orb" style="${orbStyle}"></div>
      <h3>${sys.name}</h3>
      <p class="pc-meta">${sys.moons.length} named moon${sys.moons.length > 1 ? "s" : ""}</p>`;
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
  buildSystem(sys);
  renderSidePanel(sys);
  setActiveNav(name);
  controls.autoRotate = true;
  homeSection.style.display = "none";
  planetView.hidden = false;
  history.replaceState(null, "", "#" + name.toLowerCase());
}

function goHome() {
  clearScene();
  current = null;
  homeSection.style.display = "";
  planetView.hidden = true;
  setActiveNav(null);
  // idle: slowly show Earth's system behind the home overlay for ambience
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
  if (planetGroup) planetGroup.rotation.y += 0.0006;   // gentle system drift

  if (camTween) {
    camTween.t = Math.min(1, camTween.t + 0.045);
    const e = 1 - Math.pow(1 - camTween.t, 3);          // ease-out cubic
    camera.position.lerpVectors(camTween.from, camTween.to, e);
    controls.target.lerpVectors(camTween.tf, camTween.tt, e);
    if (camTween.t >= 1) camTween = null;
  }

  // keep tooltip glued to a focused/hovered mesh as the scene rotates
  if (hovered && !tooltip.hidden) {
    const s = worldToScreen(hovered.getWorldPosition(new THREE.Vector3()));
    tooltip.style.left = s.x + "px";
    tooltip.style.top = s.y + "px";
  }

  controls.update();
  renderer.render(scene, camera);
}

// ---------------------------------------------------------------- resize -----
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
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
