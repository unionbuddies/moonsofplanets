# Moons of the Planets

An interactive 3D guide to every planet and dwarf planet in the Solar System that
has a **named** moon. Pick a world, then **drag to orbit**, **scroll to zoom** and
**hover any moon** to read about it. Each world's page also lists its famous moons
in a side panel so you can learn about the headline moons without hunting for them.

Mercury and Venus are left out on purpose — they have no moons.

## What's included

- **13 worlds:** Earth, Mars, Jupiter, Saturn, Uranus, Neptune, plus the dwarf
  planets Pluto, Eris, Haumea, Makemake, Orcus, Quaoar and Gonggong.
- **Every named moon** of each world (~180 in total), each placed in the 3D scene
  on a compressed orbital scale so all of them stay visible and reachable.
- **Hover tooltips** with size, distance, discovery year/discoverer and — for the
  notable moons — an interesting fact.
- **Side panel** of famous moons per world; click one to fly the camera to it.
- **Real textures** for the planets and Earth's Moon; the many small named moons
  use characteristic colours (a 2 km moon has no texture map).
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
js/data.js        the moon/planet dataset (real km values + facts)
js/main.js        three.js scene, orbit controls, raycast hover, view switching
textures/         planet + Moon textures (JPG) and Saturn's ring (PNG)
```

## Data notes

Distances (semi-major axis) and radii are real values in kilometres. The 3D view
compresses the enormous true range — inner moonlets orbit a few thousand km out
while outer irregular moons sit tens of millions of km away — onto a viewable
scale, so on-screen spacing is representative, not literal. Stats for the smallest
irregular moons are best-known approximate values.

## Credits

- Planet and Moon textures: [Solar System Scope](https://www.solarsystemscope.com/textures/),
  licensed **CC BY 4.0**.
- 3D rendering: [three.js](https://threejs.org).
