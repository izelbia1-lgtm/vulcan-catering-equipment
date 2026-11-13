# Vulcan Equipment Experience

A local React, TypeScript, Vite and Tailwind CSS concept for Vulcan management.

## Run locally

From this folder, with Node.js and pnpm installed:

```powershell
pnpm install
pnpm run dev
```

Open the loopback URL printed by Vite. Use `pnpm run build` for the type-checked production build.

## Kitchen and equipment catalogue

The chef cooks automatically. Double-tap or double-click the chef or his stove, or focus the chef and press Enter. The pan flares and the bubble says “O for food sake!” Cooking resumes after the final pose. Reduced-motion mode uses still poses. Tap the hanging ladle and whisk or the sink to activate their independent effects. On a phone, swipe the illustration sideways to reveal the sink. The chef reaction is silent. The sink and utensils use their existing local sound clips.

The kitchen lives at `/`. The hero wordmark briefly sticks and fades with scrolling. With reduced motion enabled, it scrolls normally. The two equipment links and cards open the separate catalogue views. **Cooking Equipment** shows Coming Soon. **Laundry Equipment** branches into Miele and Sharing, then into each brand's categories and product details. For example, open `/equipment/laundry/miele/washing-machines` directly. Switching brands keeps a shared category, or opens the selected brand's category list when it has no equivalent.

Filters and sorting are stored in the category URL. Valid specification filters carry across brands in a shared category, and changing category starts a new filter set. A filtered product opens with its first matching model selected. Capacity sorting uses the lower bound of published ranges, with unlisted capacities last.

Vite's development and preview servers support deep links. If serving the built app on another static server, configure it to serve `index.html` for catalogue routes.

The catalogue uses PDF pages 5–36 of the supplied Vulcan Laundry Equipment Catalogue, Edition 1. The requested categories contain 32 listings and 55 model configurations. Each listing identifies its PDF page. Where the PDF supplies an image-based specification table, the detail view includes the original table and a model-specific text summary. The separate accessories pages 37–39 sit outside the requested navigation.

Each product offers a validated demonstration quote form. The form binds the current product and model and displays a local confirmation. There is no delivery or quotation backend.

## Files

- `src/main.tsx` renders the kitchen and main navigation.
- `src/Catalogue.tsx` renders catalogue navigation, product cards and details, and the quotation form.
- `src/catalogue-filters.ts` defines catalogue-backed filters and model matching.
- `src/laundry.ts` defines the division, brand and category hierarchy.
- `src/laundry-products.json` stores model names, specifications and source-page references.
- `public/catalogue/` contains product photos and technical tables extracted from the supplied PDF.
- `src/KitchenInteractions.tsx`, `src/kitchen-effects.ts` and `src/kitchen-sound.ts` handle the masked utensil and sink effects and local sound playback.
- `src/animation.ts` and `src/flare.ts` handle chef animation and the pan flare. `public/artwork/` contains the original project assets.
- `src/style.css` contains the base styles. `src/premium.css` defines the industrial colour palette, layered hero, division cards and responsive catalogue presentation.





