# SAINT YN

Campaign + shop site for SAINT YN, Collection Nº 01.

```bash
npm install
npm run dev      # local dev server
npm run build    # production build in dist/
```

## How the hero works

`src/components/HeroSequence.jsx` pins a 1000vh section and drives a canvas from scroll:

1. **Film** — scrubs `public/frames/` (every 2nd frame of the campaign video) as the trunk opens.
2. **Exhibition** — switches to the hi-res still `public/img/trunk-still.jpg` and moves a camera
   to each painting in `PAINTINGS` (`src/data.js`), with a museum placard per stop. The last stop,
   FALLIN' YN, dissolves into the hi-res artwork.
3. **Rack** — pulls back and scrubs the rest of the film (racks roll in, neon logo), then hands off
   to the shop.

Timeline breakpoints are the constants at the top of `HeroSequence.jsx`.

## Placeholders to replace before launch

- Painting titles marked "Untitled (…)" in `src/data.js`.
- Product prices in `src/data.js` ($185 is a placeholder).
- Checkout button (`src/components/Bag.jsx`) — connect Shopify / Stripe.
- Email signup (`src/App.jsx`) — connect your email provider.
