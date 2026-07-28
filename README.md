# Moons of the Planets

An interactive 3D guide to every planet and dwarf planet in the Solar System that
has a **named** moon. Pick a world, then **drag to orbit**, **scroll to zoom** and
**hover any moon** to read about it. Each world's page also lists its famous moons
in a side panel so you can learn about the headline moons without hunting for them.

Mercury and Venus are left out on purpose — they have no moons.

## What's included

- **13 worlds:** Earth, Mars, Jupiter, Saturn, Uranus, Neptune, plus the dwarf
  planets Pluto, Eris, Haumea, Makemake, Orcus, Quaoar and Gonggong.
- **Every known moon** of each world — named *and* provisional (e.g. Saturn's 291,
  Jupiter's 115) — each placed in the 3D scene on a compressed orbital scale so
  all of them stay visible and reachable by dragging.
- **Every moon is hoverable**, with a tooltip giving size, distance and discovery
  details; the notable "main" moons add an interesting fact. Tiny moons with no
  measured size show an estimate (clearly marked "est.").
- **Side panel** lists *every* moon: the main moons at the top with facts, then a
  compact, scrollable list of all the rest. Click any moon to fly the camera to it.
- **Main moons are highlighted** in the 3D view with gold orbit rings and halos.
- **Real textures** for the planets and Earth's Moon; the smaller moons use
  characteristic colours (a 2 km moon has no texture map).
- Deep links: `index.html#jupiter`, `#saturn`, `#pluto`, etc.

## Running it

It's a static site — no build step. Serve the folder over HTTP (needed because it
uses ES modules):

```bash
python3 -m http.server 8777
```

Then open <http://127.0.0.1:8777>. Opening `index.html` directly via `file://`
will not work because browsers block module and texture loading there.

### GitHub Pages

Push to GitHub and enable Pages (Settings → Pages → deploy from `main`, root).
three.js is loaded from a CDN via an import map, so no bundling is required.

## Project layout

```
index.html        page structure, import map, loading order
css/styles.css    all styling (dark space theme, responsive)
js/data.js        curated worlds + notable "main" moons (facts, colours, textures)
js/moons_full.js  full JPL catalogue of every moon (real names + distances)
js/main.js        three.js scene, orbit controls, raycast hover, view switching
textures/         planet + Moon textures (JPG) and Saturn's ring (PNG)
```

At load time `main.js` merges the two data layers: it takes the full JPL
catalogue for each planet and overlays the curated facts/colours/sizes by name,
so the notable moons are rich while every other moon still appears with real
orbital data.

## Data notes

Names and distances (semi-major axis, km) for the planets' moons come from
**NASA/JPL Solar System Dynamics**. The 3D view compresses the enormous true
range — inner moonlets orbit a few thousand km out while outer irregular moons
sit tens of millions of km away — onto a viewable scale, so on-screen spacing is
representative, not literal. Most small provisional moons have no measured radius;
their sizes are estimates shown as "est." Dwarf-planet moons beyond Pluto aren't
in the JPL satellite set, so those come from the curated list.

## Credits

- Planet and Moon textures: [Solar System Scope](https://www.solarsystemscope.com/textures/),
  licensed **CC BY 4.0**.
- Moon names, orbits and counts: [NASA/JPL Solar System Dynamics](https://ssd.jpl.nasa.gov/sats/elem/).
- 3D rendering: [three.js](https://threejs.org).
