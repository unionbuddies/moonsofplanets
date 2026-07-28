// ============================================================================
//  Moons of the Planets — data
// ----------------------------------------------------------------------------
//  Every planet and dwarf planet in the Solar System that has at least one
//  NAMED moon. Distances (semi-major axis) and radii are real values in km.
//  The 3D view compresses these onto a viewable scale (see main.js) because the
//  true range — from a 128,000 km orbit to a 24,000,000 km orbit — cannot be
//  shown 1:1. Stats for the smallest irregular moons are best-known approximate
//  values.
//
//  Fields per moon:
//    name        display name
//    radius      mean radius, km
//    distance    semi-major axis from the planet, km
//    discovered  year discovered (or "ancient")
//    by          discoverer(s)
//    color       hex used for moons without a real texture
//    texture     (optional) texture file for the few moons with real imagery
//    famous      show in the side "Famous moons" panel
//    fact        short interesting note (always shown for famous moons)
// ============================================================================

const SYSTEMS = [
  // ---------------------------------------------------------------- EARTH ----
  {
    name: "Earth",
    texture: "textures/2k_earth_daymap.jpg",
    radius: 6371,
    color: 0x2a5ca8,
    blurb: "Our home planet has a single, unusually large moon — big enough that Earth–Moon is sometimes called a double planet.",
    moons: [
      { name: "Moon", radius: 1737, distance: 384400, discovered: "ancient", by: "known since prehistory",
        texture: "textures/2k_moon.jpg", color: 0xbdbdb5, famous: true,
        fact: "The fifth-largest moon in the Solar System. It is slowly drifting away from Earth at about 3.8 cm per year, and its gravity is the main driver of ocean tides." },
    ],
  },

  // ----------------------------------------------------------------- MARS ----
  {
    name: "Mars",
    texture: "textures/2k_mars.jpg",
    radius: 3389,
    color: 0xc1440e,
    blurb: "Mars has two tiny, lumpy moons that are probably captured asteroids.",
    moons: [
      { name: "Phobos", radius: 11.3, distance: 9376, discovered: 1877, by: "Asaph Hall", color: 0x8a7a6d, famous: true,
        fact: "Orbits Mars faster than Mars rotates, so it rises in the west and sets in the east — twice a day. It is spiralling inward and will crash into Mars or shatter into a ring in ~50 million years." },
      { name: "Deimos", radius: 6.2, distance: 23463, discovered: 1877, by: "Asaph Hall", color: 0x9a8b7c, famous: true,
        fact: "The smaller, outer moon. Its surface is smoothed over by a thick layer of regolith, giving it a softer look than cratered Phobos." },
    ],
  },

  // -------------------------------------------------------------- JUPITER ----
  {
    name: "Jupiter",
    texture: "textures/2k_jupiter.jpg",
    radius: 69911,
    color: 0xd8ca9d,
    blurb: "The giant of the Solar System commands the largest moon system — including the four Galilean moons Galileo spotted in 1610, the first worlds seen orbiting another planet.",
    moons: [
      // Inner group
      { name: "Metis", radius: 21.5, distance: 128000, discovered: 1979, by: "Voyager 1", color: 0x9c8f80 },
      { name: "Adrastea", radius: 8.2, distance: 129000, discovered: 1979, by: "Voyager 2", color: 0xa39684 },
      { name: "Amalthea", radius: 83.5, distance: 181400, discovered: 1892, by: "E. E. Barnard", color: 0xb23a2e, famous: true,
        fact: "The reddest object in the Solar System — redder than Mars. It radiates more heat than it receives from the Sun, hinting it is warmed by Jupiter's intense radiation." },
      { name: "Thebe", radius: 49, distance: 221900, discovered: 1979, by: "Voyager 1", color: 0xa07a5c },
      // Galilean
      { name: "Io", radius: 1821, distance: 421700, discovered: 1610, by: "Galileo Galilei", color: 0xe8d84b, famous: true,
        fact: "The most volcanically active body in the Solar System — hundreds of active volcanoes throw plumes 500 km high. Its sulfur-coated surface is a lurid palette of yellow, orange and black." },
      { name: "Europa", radius: 1560, distance: 671100, discovered: 1610, by: "Galileo Galilei", color: 0xcdb79a, famous: true,
        fact: "Beneath its cracked, icy crust lies a global saltwater ocean holding perhaps twice as much water as all of Earth's oceans — a prime place to search for life." },
      { name: "Ganymede", radius: 2634, distance: 1070400, discovered: 1610, by: "Galileo Galilei", color: 0x9c9284, famous: true,
        fact: "The largest moon in the Solar System — bigger than the planet Mercury. It is the only moon known to generate its own magnetic field." },
      { name: "Callisto", radius: 2410, distance: 1882700, discovered: 1610, by: "Galileo Galilei", color: 0x6b6258, famous: true,
        fact: "The most heavily cratered object known — its ancient surface has barely changed in 4 billion years. It may hide a subsurface ocean too." },
      // Themisto + Himalia group
      { name: "Themisto", radius: 4, distance: 7284000, discovered: 1975, by: "Kowal & Roemer", color: 0x8b8378 },
      { name: "Leda", radius: 10, distance: 11165000, discovered: 1974, by: "C. Kowal", color: 0x8b8378 },
      { name: "Ersa", radius: 1.5, distance: 11453000, discovered: 2018, by: "S. Sheppard", color: 0x8b8378 },
      { name: "Pandia", radius: 1.5, distance: 11525000, discovered: 2017, by: "S. Sheppard", color: 0x8b8378 },
      { name: "Himalia", radius: 69.8, distance: 11460000, discovered: 1904, by: "C. Perrine", color: 0x9a9086, famous: true,
        fact: "The largest of Jupiter's irregular moons and the brightest member of a family thought to be fragments of a single captured asteroid." },
      { name: "Lysithea", radius: 18, distance: 11720000, discovered: 1938, by: "S. Nicholson", color: 0x8b8378 },
      { name: "Elara", radius: 43, distance: 11740000, discovered: 1905, by: "C. Perrine", color: 0x8b8378 },
      { name: "Dia", radius: 2, distance: 12570000, discovered: 2000, by: "S. Sheppard", color: 0x8b8378 },
      // Carpo & Valetudo
      { name: "Carpo", radius: 1.5, distance: 17058000, discovered: 2003, by: "S. Sheppard", color: 0x8b8378 },
      { name: "Valetudo", radius: 0.5, distance: 18980000, discovered: 2016, by: "S. Sheppard", color: 0x8b8378, famous: true,
        fact: "An oddball that orbits 'the wrong way' among retrograde neighbours, so it is on a collision course with them — the astronomical equivalent of driving down the wrong side of the motorway." },
      // Ananke group (retrograde)
      { name: "Euporie", radius: 1, distance: 19302000, discovered: 2001, by: "S. Sheppard", color: 0x7d766c },
      { name: "Eupheme", radius: 1, distance: 20220000, discovered: 2003, by: "S. Sheppard", color: 0x7d766c },
      { name: "Thelxinoe", radius: 1, distance: 21162000, discovered: 2003, by: "S. Sheppard", color: 0x7d766c },
      { name: "Euanthe", radius: 1.5, distance: 21038000, discovered: 2001, by: "S. Sheppard", color: 0x7d766c },
      { name: "Helike", radius: 2, distance: 21069000, discovered: 2003, by: "S. Sheppard", color: 0x7d766c },
      { name: "Orthosie", radius: 1, distance: 21158000, discovered: 2001, by: "S. Sheppard", color: 0x7d766c },
      { name: "Iocaste", radius: 2.5, distance: 21269000, discovered: 2001, by: "S. Sheppard", color: 0x7d766c },
      { name: "Ananke", radius: 14, distance: 21276000, discovered: 1951, by: "S. Nicholson", color: 0x8b8378 },
      { name: "Praxidike", radius: 3.5, distance: 21147000, discovered: 2001, by: "S. Sheppard", color: 0x7d766c },
      { name: "Harpalyke", radius: 2, distance: 21105000, discovered: 2001, by: "S. Sheppard", color: 0x7d766c },
      { name: "Mneme", radius: 1, distance: 21129000, discovered: 2003, by: "Gladman et al.", color: 0x7d766c },
      { name: "Thyone", radius: 2, distance: 21406000, discovered: 2001, by: "S. Sheppard", color: 0x7d766c },
      { name: "Herse", radius: 1, distance: 22134000, discovered: 2003, by: "Gladman et al.", color: 0x7d766c },
      // Carme group (retrograde)
      { name: "Aitne", radius: 1.5, distance: 22285000, discovered: 2001, by: "S. Sheppard", color: 0x746d63 },
      { name: "Kore", radius: 1, distance: 24011000, discovered: 2003, by: "S. Sheppard", color: 0x746d63 },
      { name: "Eukelade", radius: 2, distance: 23328000, discovered: 2003, by: "S. Sheppard", color: 0x746d63 },
      { name: "Arche", radius: 1.5, distance: 23355000, discovered: 2002, by: "S. Sheppard", color: 0x746d63 },
      { name: "Isonoe", radius: 1.9, distance: 23217000, discovered: 2001, by: "S. Sheppard", color: 0x746d63 },
      { name: "Taygete", radius: 2.5, distance: 23360000, discovered: 2001, by: "S. Sheppard", color: 0x746d63 },
      { name: "Chaldene", radius: 1.9, distance: 23179000, discovered: 2001, by: "S. Sheppard", color: 0x746d63 },
      { name: "Erinome", radius: 1.6, distance: 23279000, discovered: 2001, by: "S. Sheppard", color: 0x746d63 },
      { name: "Kalyke", radius: 2.6, distance: 23583000, discovered: 2001, by: "S. Sheppard", color: 0x746d63 },
      { name: "Kale", radius: 1, distance: 23217000, discovered: 2001, by: "S. Sheppard", color: 0x746d63 },
      { name: "Kallichore", radius: 1, distance: 23288000, discovered: 2003, by: "S. Sheppard", color: 0x746d63 },
      { name: "Carme", radius: 23, distance: 23404000, discovered: 1938, by: "S. Nicholson", color: 0x8b8378 },
      // Pasiphae group (retrograde)
      { name: "Eurydome", radius: 1.5, distance: 22865000, discovered: 2001, by: "S. Sheppard", color: 0x6f685f },
      { name: "Autonoe", radius: 2, distance: 23039000, discovered: 2001, by: "S. Sheppard", color: 0x6f685f },
      { name: "Sponde", radius: 1, distance: 23487000, discovered: 2001, by: "S. Sheppard", color: 0x6f685f },
      { name: "Pasiphae", radius: 30, distance: 23624000, discovered: 1908, by: "P. Melotte", color: 0x8b8378 },
      { name: "Megaclite", radius: 2.7, distance: 23806000, discovered: 2001, by: "S. Sheppard", color: 0x6f685f },
      { name: "Sinope", radius: 19, distance: 23939000, discovered: 1914, by: "S. Nicholson", color: 0x8b8378 },
      { name: "Callirrhoe", radius: 4.3, distance: 24103000, discovered: 1999, by: "Spacewatch", color: 0x6f685f },
      { name: "Cyllene", radius: 1, distance: 24349000, discovered: 2003, by: "S. Sheppard", color: 0x6f685f },
      { name: "Aoede", radius: 2, distance: 23044000, discovered: 2003, by: "S. Sheppard", color: 0x6f685f },
      { name: "Hegemone", radius: 1.5, distance: 23577000, discovered: 2003, by: "S. Sheppard", color: 0x6f685f },
      { name: "Pasithee", radius: 1, distance: 23096000, discovered: 2001, by: "S. Sheppard", color: 0x6f685f },
      { name: "Philophrosyne", radius: 1, distance: 22804000, discovered: 2003, by: "S. Sheppard", color: 0x6f685f },
      { name: "Eirene", radius: 2, distance: 23483000, discovered: 2003, by: "S. Sheppard", color: 0x6f685f },
    ],
  },

  // --------------------------------------------------------------- SATURN ----
  {
    name: "Saturn",
    texture: "textures/2k_saturn.jpg",
    ring: "textures/2k_saturn_ring_alpha.png",
    radius: 58232,
    color: 0xe3d9b0,
    blurb: "The ringed giant has the most moons of any planet — a system of icy worlds ranging from Titan, larger than Mercury, down to moonlets woven into the rings.",
    moons: [
      // Ring shepherds & inner
      { name: "Pan", radius: 14, distance: 133584, discovered: 1990, by: "M. Showalter", color: 0xd8cdb0, famous: true,
        fact: "Shaped like a ravioli or walnut, it orbits inside the Encke Gap in Saturn's rings, sweeping the gap clear and raising waves in the ring edges." },
      { name: "Daphnis", radius: 3.8, distance: 136505, discovered: 2005, by: "Cassini team", color: 0xd8cdb0 },
      { name: "Atlas", radius: 15, distance: 137670, discovered: 1980, by: "Voyager 1", color: 0xd8cdb0, famous: true,
        fact: "Another 'flying saucer' moon with a smooth equatorial ridge of accumulated ring material, giving it a UFO-like profile." },
      { name: "Prometheus", radius: 43, distance: 139380, discovered: 1980, by: "Voyager 1", color: 0xcfc4a6, famous: true,
        fact: "A ring shepherd whose gravity carves dark channels and streamers into Saturn's narrow F ring on every close pass." },
      { name: "Pandora", radius: 40.6, distance: 141720, discovered: 1980, by: "Voyager 1", color: 0xcfc4a6 },
      { name: "Epimetheus", radius: 58, distance: 151410, discovered: 1980, by: "Voyager 1", color: 0xc3b899, famous: true,
        fact: "Shares almost the same orbit as Janus — every four years the two swap places in a gravitational dance without ever colliding." },
      { name: "Janus", radius: 89, distance: 151460, discovered: 1966, by: "A. Dollfus", color: 0xc3b899, famous: true,
        fact: "The co-orbital partner of Epimetheus. Their orbit-swapping 'do-si-do' is unique in the Solar System." },
      { name: "Aegaeon", radius: 0.3, distance: 167500, discovered: 2008, by: "Cassini team", color: 0xc3b899 },
      { name: "Mimas", radius: 198, distance: 185540, discovered: 1789, by: "W. Herschel", color: 0xc8c2b4, famous: true,
        fact: "Its enormous Herschel crater makes it look uncannily like the Death Star. Wobbles in its spin hint at a hidden internal ocean." },
      { name: "Methone", radius: 1.6, distance: 194440, discovered: 2004, by: "Cassini team", color: 0xc3b899 },
      { name: "Anthe", radius: 0.9, distance: 197700, discovered: 2007, by: "Cassini team", color: 0xc3b899 },
      { name: "Pallene", radius: 2.5, distance: 212280, discovered: 2004, by: "Cassini team", color: 0xc3b899 },
      { name: "Enceladus", radius: 252, distance: 237950, discovered: 1789, by: "W. Herschel", color: 0xf2f4f5, famous: true,
        fact: "Geysers of water ice erupt from 'tiger stripe' fractures at its south pole, feeding Saturn's E ring. Its subsurface ocean is one of the best places to search for life." },
      { name: "Tethys", radius: 531, distance: 294660, discovered: 1684, by: "G. Cassini", color: 0xe8e6df, famous: true,
        fact: "Sports Ithaca Chasma, a canyon stretching three-quarters of the way around the moon, and the huge crater Odysseus." },
      { name: "Telesto", radius: 12, distance: 294710, discovered: 1980, by: "Smith et al.", color: 0xdedacb },
      { name: "Calypso", radius: 10.7, distance: 294710, discovered: 1980, by: "Pascu et al.", color: 0xdedacb },
      { name: "Dione", radius: 561, distance: 377400, discovered: 1684, by: "G. Cassini", color: 0xdedad2, famous: true,
        fact: "Wispy bright streaks across its trailing side turned out to be a network of towering ice cliffs when Cassini flew past." },
      { name: "Helene", radius: 18, distance: 377420, discovered: 1980, by: "Laques & Lecacheux", color: 0xdedacb },
      { name: "Polydeuces", radius: 1.3, distance: 377200, discovered: 2004, by: "Cassini team", color: 0xdedacb },
      { name: "Rhea", radius: 764, distance: 527040, discovered: 1672, by: "G. Cassini", color: 0xdcdad3, famous: true,
        fact: "Saturn's second-largest moon. It may once have had — or still have — a faint ring of its own, which would make it the only known ringed moon." },
      { name: "Titan", radius: 2575, distance: 1221870, discovered: 1655, by: "C. Huygens", color: 0xe3a54a, famous: true,
        fact: "Larger than Mercury and the only moon with a thick atmosphere. Rivers, lakes and seas of liquid methane and ethane make it the only other world with stable surface liquid." },
      { name: "Hyperion", radius: 135, distance: 1481010, discovered: 1848, by: "Bond & Lassell", color: 0xb39b73, famous: true,
        fact: "A giant sponge-like body that tumbles chaotically — its rotation is so unpredictable you could never say which way it will face tomorrow." },
      { name: "Iapetus", radius: 734, distance: 3560820, discovered: 1671, by: "G. Cassini", color: 0x8a7b5c, famous: true,
        fact: "The 'yin-yang moon' — one hemisphere is as dark as coal, the other bright as snow. A towering equatorial ridge gives it a walnut shape." },
      { name: "Kiviuq", radius: 8, distance: 11294800, discovered: 2000, by: "Gladman et al.", color: 0x9a8f7d },
      { name: "Ijiraq", radius: 6, distance: 11355300, discovered: 2000, by: "Gladman et al.", color: 0x9a8f7d },
      { name: "Phoebe", radius: 106, distance: 12869700, discovered: 1899, by: "W. Pickering", color: 0x5a5650, famous: true,
        fact: "Orbits Saturn backwards and is likely a captured Kuiper Belt object. Dust eroded from it forms the largest known planetary ring, the vast Phoebe ring." },
      { name: "Paaliaq", radius: 11, distance: 15103400, discovered: 2000, by: "Gladman et al.", color: 0x8f8474 },
      { name: "Skathi", radius: 4, distance: 15672500, discovered: 2000, by: "Gladman et al.", color: 0x8f8474 },
      { name: "Albiorix", radius: 16, distance: 16266700, discovered: 2000, by: "Holman & Spahr", color: 0x8f8474 },
      { name: "Bebhionn", radius: 3, distance: 17153500, discovered: 2004, by: "Sheppard et al.", color: 0x8f8474 },
      { name: "Erriapus", radius: 5, distance: 17343500, discovered: 2000, by: "Gladman et al.", color: 0x8f8474 },
      { name: "Skoll", radius: 3, distance: 17665400, discovered: 2006, by: "Sheppard et al.", color: 0x847a6a },
      { name: "Siarnaq", radius: 20, distance: 18015300, discovered: 2000, by: "Gladman et al.", color: 0x8f8474 },
      { name: "Tarqeq", radius: 3.5, distance: 18009300, discovered: 2007, by: "Sheppard et al.", color: 0x847a6a },
      { name: "Tarvos", radius: 7.5, distance: 18562800, discovered: 2000, by: "Gladman et al.", color: 0x8f8474 },
      { name: "Greip", radius: 3, distance: 18457000, discovered: 2006, by: "Sheppard et al.", color: 0x847a6a },
      { name: "Hyrrokkin", radius: 4, distance: 18437000, discovered: 2006, by: "Sheppard et al.", color: 0x847a6a },
      { name: "Jarnsaxa", radius: 3, distance: 18811000, discovered: 2006, by: "Sheppard et al.", color: 0x847a6a },
      { name: "Mundilfari", radius: 3.5, distance: 18725800, discovered: 2000, by: "Gladman et al.", color: 0x847a6a },
      { name: "Bergelmir", radius: 3, distance: 19104000, discovered: 2004, by: "Sheppard et al.", color: 0x847a6a },
      { name: "Narvi", radius: 3.5, distance: 19395200, discovered: 2003, by: "Sheppard et al.", color: 0x847a6a },
      { name: "Suttungr", radius: 3.5, distance: 19579000, discovered: 2000, by: "Gladman et al.", color: 0x847a6a },
      { name: "Hati", radius: 3, distance: 19856100, discovered: 2004, by: "Sheppard et al.", color: 0x847a6a },
      { name: "Bestla", radius: 3.5, distance: 20192600, discovered: 2004, by: "Sheppard et al.", color: 0x847a6a },
      { name: "Farbauti", radius: 2.5, distance: 20390500, discovered: 2004, by: "Sheppard et al.", color: 0x847a6a },
      { name: "Thrymr", radius: 3.5, distance: 20418900, discovered: 2000, by: "Gladman et al.", color: 0x847a6a },
      { name: "Aegir", radius: 3, distance: 20751000, discovered: 2004, by: "Sheppard et al.", color: 0x847a6a },
      { name: "Kari", radius: 3.5, distance: 22118000, discovered: 2006, by: "Sheppard et al.", color: 0x7c7263 },
      { name: "Fenrir", radius: 2, distance: 22453000, discovered: 2004, by: "Sheppard et al.", color: 0x7c7263 },
      { name: "Surtur", radius: 3, distance: 22707000, discovered: 2006, by: "Sheppard et al.", color: 0x7c7263 },
      { name: "Ymir", radius: 9, distance: 23040000, discovered: 2000, by: "Gladman et al.", color: 0x7c7263 },
      { name: "Loge", radius: 3, distance: 23058000, discovered: 2006, by: "Sheppard et al.", color: 0x7c7263 },
      { name: "Fornjot", radius: 3, distance: 25146000, discovered: 2004, by: "Sheppard et al.", color: 0x7c7263 },
    ],
  },

  // --------------------------------------------------------------- URANUS ----
  {
    name: "Uranus",
    texture: "textures/2k_uranus.jpg",
    radius: 25362,
    color: 0xa8d8e0,
    blurb: "Tipped over on its side, Uranus carries a family of moons named after characters from Shakespeare and Alexander Pope — all 28 of its known moons are named.",
    moons: [
      { name: "Cordelia", radius: 20, distance: 49770, discovered: 1986, by: "Voyager 2", color: 0x9aa7ab },
      { name: "Ophelia", radius: 21, distance: 53790, discovered: 1986, by: "Voyager 2", color: 0x9aa7ab },
      { name: "Bianca", radius: 26, distance: 59170, discovered: 1986, by: "Voyager 2", color: 0x9aa7ab },
      { name: "Cressida", radius: 40, distance: 61780, discovered: 1986, by: "Voyager 2", color: 0x9aa7ab },
      { name: "Desdemona", radius: 32, distance: 62680, discovered: 1986, by: "Voyager 2", color: 0x9aa7ab },
      { name: "Juliet", radius: 47, distance: 64350, discovered: 1986, by: "Voyager 2", color: 0x9aa7ab },
      { name: "Portia", radius: 68, distance: 66090, discovered: 1986, by: "Voyager 2", color: 0x9aa7ab },
      { name: "Rosalind", radius: 36, distance: 69940, discovered: 1986, by: "Voyager 2", color: 0x9aa7ab },
      { name: "Cupid", radius: 9, distance: 74800, discovered: 2003, by: "Showalter & Lissauer", color: 0x9aa7ab },
      { name: "Belinda", radius: 40, distance: 75260, discovered: 1986, by: "Voyager 2", color: 0x9aa7ab },
      { name: "Perdita", radius: 15, distance: 76400, discovered: 1999, by: "Karkoschka", color: 0x9aa7ab },
      { name: "Puck", radius: 81, distance: 86010, discovered: 1985, by: "Voyager 2", color: 0x8f9ca0, famous: true,
        fact: "The largest of Uranus's inner moons and the only one Voyager 2 imaged in any detail — a dark, near-spherical body pocked with craters." },
      { name: "Mab", radius: 12, distance: 97700, discovered: 2003, by: "Showalter & Lissauer", color: 0x9aa7ab },
      { name: "Miranda", radius: 236, distance: 129390, discovered: 1948, by: "G. Kuiper", color: 0xb6c0c4, famous: true,
        fact: "A Frankenstein world of mismatched terrain, including Verona Rupes — a cliff up to 20 km high, the tallest known in the Solar System." },
      { name: "Ariel", radius: 579, distance: 190900, discovered: 1851, by: "W. Lassell", color: 0xc4ccce, famous: true,
        fact: "The brightest of Uranus's moons, with a young surface criss-crossed by canyons that were likely flooded by icy 'lava' in the past." },
      { name: "Umbriel", radius: 585, distance: 266000, discovered: 1851, by: "W. Lassell", color: 0x6f7679, famous: true,
        fact: "The darkest large moon of Uranus, marked by a mysterious bright ring nicknamed 'Wunda' on the floor of a crater." },
      { name: "Titania", radius: 788, distance: 435910, discovered: 1787, by: "W. Herschel", color: 0xbfc4c2, famous: true,
        fact: "Uranus's largest moon, scarred by immense canyons — Messina Chasma runs some 1,500 km across its icy face." },
      { name: "Oberon", radius: 761, distance: 583520, discovered: 1787, by: "W. Herschel", color: 0xa9aeac, famous: true,
        fact: "The outermost large moon, its ancient surface dotted with craters ringed by dark material and a lone mountain rising 11 km high." },
      { name: "Francisco", radius: 11, distance: 4276000, discovered: 2001, by: "Holman et al.", color: 0x7f8689 },
      { name: "Caliban", radius: 36, distance: 7231000, discovered: 1997, by: "Gladman et al.", color: 0x8a7f76, famous: true,
        fact: "The first irregular moon of Uranus found, orbiting backwards far from the planet — a captured object with a reddish, comet-like surface." },
      { name: "Stephano", radius: 16, distance: 8004000, discovered: 1999, by: "Gladman et al.", color: 0x8a7f76 },
      { name: "Trinculo", radius: 9, distance: 8504000, discovered: 2001, by: "Holman et al.", color: 0x8a7f76 },
      { name: "Sycorax", radius: 78, distance: 12179000, discovered: 1997, by: "Nicholson et al.", color: 0x9c6f5c, famous: true,
        fact: "The largest irregular moon of Uranus and distinctly red, a captured world that loops around the planet on a wildly tilted orbit." },
      { name: "Margaret", radius: 10, distance: 14345000, discovered: 2003, by: "Sheppard & Jewitt", color: 0x8a7f76 },
      { name: "Prospero", radius: 25, distance: 16256000, discovered: 1999, by: "Holman et al.", color: 0x8a7f76 },
      { name: "Setebos", radius: 24, distance: 17418000, discovered: 1999, by: "Kavelaars et al.", color: 0x8a7f76 },
      { name: "Ferdinand", radius: 10, distance: 20430000, discovered: 2001, by: "Holman et al.", color: 0x8a7f76 },
    ],
  },

  // -------------------------------------------------------------- NEPTUNE ----
  {
    name: "Neptune",
    texture: "textures/2k_neptune.jpg",
    radius: 24622,
    color: 0x3a6ea5,
    blurb: "The windiest planet holds Triton, a captured world that orbits backwards — evidence it was pulled in from the distant Kuiper Belt.",
    moons: [
      { name: "Naiad", radius: 33, distance: 48227, discovered: 1989, by: "Voyager 2", color: 0x7f97a8 },
      { name: "Thalassa", radius: 41, distance: 50075, discovered: 1989, by: "Voyager 2", color: 0x7f97a8 },
      { name: "Despina", radius: 78, distance: 52526, discovered: 1989, by: "Voyager 2", color: 0x7f97a8 },
      { name: "Galatea", radius: 88, distance: 61953, discovered: 1989, by: "Voyager 2", color: 0x7f97a8 },
      { name: "Larissa", radius: 97, distance: 73548, discovered: 1981, by: "Reitsema et al.", color: 0x7f97a8 },
      { name: "Hippocamp", radius: 17, distance: 105283, discovered: 2013, by: "M. Showalter", color: 0x7f97a8, famous: true,
        fact: "One of the smallest known moons, found in Hubble images in 2013. It may be a chip knocked off neighbouring Proteus by a comet impact." },
      { name: "Proteus", radius: 210, distance: 117646, discovered: 1989, by: "Voyager 2", color: 0x6d6a63, famous: true,
        fact: "About as large as a body can get while staying lumpy rather than round — a dark, boxy moon that escaped notice until Voyager 2 arrived." },
      { name: "Triton", radius: 1353, distance: 354759, discovered: 1846, by: "W. Lassell", color: 0xd6c6b0, famous: true,
        fact: "Orbits Neptune backwards, so it was almost certainly captured from the Kuiper Belt. Nitrogen geysers erupt across its frozen, cantaloupe-textured surface, one of the coldest known at −235 °C." },
      { name: "Nereid", radius: 170, distance: 5513400, discovered: 1949, by: "G. Kuiper", color: 0x9a938a, famous: true,
        fact: "Follows one of the most eccentric orbits of any moon, swinging from 1.4 million to 9.7 million km from Neptune." },
      { name: "Halimede", radius: 31, distance: 16611000, discovered: 2002, by: "Holman et al.", color: 0x82796f },
      { name: "Sao", radius: 22, distance: 22228000, discovered: 2002, by: "Holman et al.", color: 0x82796f },
      { name: "Laomedeia", radius: 21, distance: 23567000, discovered: 2002, by: "Holman et al.", color: 0x82796f },
      { name: "Psamathe", radius: 20, distance: 46695000, discovered: 2003, by: "Sheppard et al.", color: 0x82796f },
      { name: "Neso", radius: 30, distance: 49285000, discovered: 2002, by: "Holman et al.", color: 0x82796f, famous: true,
        fact: "The most distant known moon of any planet — it takes about 27 years to complete a single, enormous orbit of Neptune." },
    ],
  },

  // ---------------------------------------------------- DWARF: PLUTO ---------
  {
    name: "Pluto",
    dwarf: true,
    radius: 1188,
    color: 0xcbb79c,
    blurb: "The most famous dwarf planet and its large moon Charon form a true binary — the two bodies orbit a point in the empty space between them.",
    moons: [
      { name: "Charon", radius: 606, distance: 19591, discovered: 1978, by: "J. Christy", color: 0x9a938c, famous: true,
        fact: "Half the width of Pluto itself. The pair are tidally locked face-to-face, and Charon's north pole is capped with reddish material drifting over from Pluto's atmosphere." },
      { name: "Styx", radius: 5, distance: 42656, discovered: 2012, by: "Showalter et al.", color: 0xb7b0a6 },
      { name: "Nix", radius: 25, distance: 48694, discovered: 2005, by: "Weaver et al.", color: 0xc6bfb4, famous: true,
        fact: "Tumbles chaotically as it orbits the Pluto–Charon binary, so its days and seasons are wildly unpredictable." },
      { name: "Kerberos", radius: 9, distance: 57783, discovered: 2011, by: "Showalter et al.", color: 0xb7b0a6 },
      { name: "Hydra", radius: 25, distance: 64738, discovered: 2005, by: "Weaver et al.", color: 0xc6bfb4, famous: true,
        fact: "The outermost of Pluto's moons, with a highly reflective, water-ice surface and, like Nix, a chaotic tumble." },
    ],
  },

  // ---------------------------------------------------- DWARF: ERIS ----------
  {
    name: "Eris",
    dwarf: true,
    radius: 1163,
    color: 0xd7d4cc,
    blurb: "The dwarf planet whose discovery got Pluto demoted. Its moon Dysnomia let astronomers weigh Eris and confirm it is nearly Pluto's twin in size.",
    moons: [
      { name: "Dysnomia", radius: 350, distance: 37273, discovered: 2005, by: "Brown et al.", color: 0x6f6a63, famous: true,
        fact: "Named after the Greek daemon of lawlessness — a nod to discoverer Mike Brown's nickname for Eris, 'Xena', whose actress played 'Lucy Lawless'. Tracking it revealed Eris is 27% more massive than Pluto." },
    ],
  },

  // ---------------------------------------------------- DWARF: HAUMEA --------
  {
    name: "Haumea",
    dwarf: true,
    radius: 816,
    color: 0xe6e2da,
    blurb: "An egg-shaped dwarf planet spinning so fast a day lasts under four hours, with two moons and a ring — the first ring found around a distant world.",
    moons: [
      { name: "Hi'iaka", radius: 160, distance: 49880, discovered: 2005, by: "Brown et al.", color: 0xd8d3c9, famous: true,
        fact: "The larger, outer moon of Haumea, covered in nearly pure water ice — a frozen shard likely blasted off Haumea in an ancient collision." },
      { name: "Namaka", radius: 85, distance: 25657, discovered: 2005, by: "Brown et al.", color: 0xcfc9be, famous: true,
        fact: "The smaller inner moon, on a curiously tilted, shifting orbit tugged by its larger sibling Hi'iaka." },
    ],
  },

  // ---------------------------------------------------- DWARF: MAKEMAKE ------
  {
    name: "Makemake",
    dwarf: true,
    radius: 715,
    color: 0xc79a6b,
    blurb: "A bright, reddish dwarf planet of the Kuiper Belt with one dim, dark moon nicknamed MK 2.",
    moons: [
      { name: "MK 2", radius: 87, distance: 21000, discovered: 2016, by: "Parker et al.", color: 0x4a4640, famous: true,
        fact: "Nicknamed MK 2 and still awaiting a formal name. It is charcoal-dark while Makemake is bright, suggesting the little moon cannot hold onto reflective ice." },
    ],
  },

  // ---------------------------------------------------- DWARF: ORCUS --------
  {
    name: "Orcus",
    dwarf: true,
    radius: 458,
    color: 0xb9c4cc,
    blurb: "Sometimes called the 'anti-Pluto' because its orbit mirrors Pluto's, Orcus carries a proportionally huge moon, Vanth.",
    moons: [
      { name: "Vanth", radius: 221, distance: 9000, discovered: 2005, by: "Brown & others", color: 0x7a6f66, famous: true,
        fact: "Remarkably large next to Orcus — nearly half its size — making the pair another near-binary. Its dark, possibly icy surface contrasts sharply with brighter Orcus." },
    ],
  },

  // ---------------------------------------------------- DWARF: QUAOAR ------
  {
    name: "Quaoar",
    dwarf: true,
    radius: 545,
    color: 0xb98d70,
    blurb: "A Kuiper Belt dwarf planet that stunned astronomers with a ring far outside the distance where rings 'should' be able to survive.",
    moons: [
      { name: "Weywot", radius: 100, distance: 13300, discovered: 2007, by: "Brown & Suer", color: 0x7d6f63, famous: true,
        fact: "Named after the sky god son of Quaoar in Tongva mythology. Its gravity helps explain the strange, defiant ring encircling Quaoar." },
    ],
  },

  // ---------------------------------------------------- DWARF: GONGGONG ----
  {
    name: "Gonggong",
    dwarf: true,
    radius: 615,
    color: 0x8f4a3c,
    blurb: "A deep-red, slowly spinning dwarf planet in the far Solar System, named for a Chinese water god, with a single moon Xiangliu.",
    moons: [
      { name: "Xiangliu", radius: 50, distance: 24274, discovered: 2016, by: "Kiss et al.", color: 0x6e5a50, famous: true,
        fact: "Named after the nine-headed serpent minister of the god Gonggong. Its tugging slowed Gonggong's spin to a leisurely 22-hour day." },
    ],
  },
];

if (typeof module !== "undefined") { module.exports = SYSTEMS; }
