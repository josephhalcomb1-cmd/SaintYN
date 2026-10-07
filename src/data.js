// Video frame sequence (every 2nd frame of the campaign film, 133 frames).
export const FRAME_COUNT = 133
// The high-res still is source frame 106 = sequence frame 54 (1-based).
export const STILL_FRAME = 54
export const STILL = { src: '/img/trunk-still.jpg', w: 1920, h: 1080 }

export const frameSrc = (i, size) =>
  `/frames/${size}/${String(i).padStart(3, '0')}.webp`

// Painting positions inside the trunk still (pixels in the 1920×1080 frame).
// Titles marked "Untitled" are placeholders — rename them to the real works.
export const PAINTINGS = [
  {
    id: 'creation',
    title: 'Untitled (Creation)',
    box: [690, 710, 1025, 950],
    note: 'The masked figure reaches back. Classical ceiling, curbside gallery.',
  },
  {
    id: 'rider',
    title: 'Untitled (Rider)',
    box: [480, 520, 905, 865],
    note: 'Armor as uniform. The horse never stops moving.',
  },
  {
    id: 'knight',
    title: 'Untitled (Knight)',
    box: [725, 335, 1140, 665],
    note: 'Protection, status, and the weight of being watched.',
  },
  {
    id: 'prayer',
    title: 'Untitled (Prayer)',
    box: [1035, 550, 1425, 940],
    note: 'Hands folded in the dark. Faith kept private.',
  },
  {
    id: 'fallin',
    title: "FALLIN' YN",
    box: [1165, 395, 1430, 550],
    price: '$50,000,000',
    note:
      'The suspended instant between composure and collapse. A single exposed eye confronts the viewer with an emotion he cannot fully contain.',
    hires: '/img/fallin-yn.jpg',
  },
]

// Prices are placeholders — set the real ones before launch.
export const PRODUCTS = [
  {
    id: 'fallin-hoodie-grey',
    name: "FALLIN' YN Hoodie",
    color: 'Heather Grey',
    price: 185,
    front: '/img/hoodie-grey-front.webp',
    back: '/img/hoodie-grey-back.webp',
    swatch: '#b6b6be',
  },
  {
    id: 'fallin-hoodie-green',
    name: "FALLIN' YN Hoodie",
    color: 'Forest Green',
    price: 185,
    front: '/img/hoodie-green-front.webp',
    back: '/img/hoodie-green-back.webp',
    swatch: '#1c2a24',
  },
]

export const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL']
