# 07 - Styling

## Colors

Tokens live at the top of `src/app/globals.css` in `@theme`. Change them there to re-theme the app.

| Token | Use |
| --- | --- |
| `brand-50` to `brand-950` | Blue: text, borders, tints (`text-brand-700`, `bg-brand-50`) |
| `grape-50` to `grape-950` | Purple: chips, accents, the second half of gradients |
| `amber-*` (Tailwind) | Highlights: offers, headlights, "Book Now" on dark cards |
| `emerald` / `amber` / `rose` | Status: available or confirmed, RAC, waitlist or late |

Gradient utilities (defined with `@utility`, so variants like `hover:` and `disabled:` work):

| Class | Looks like | Used for |
| --- | --- | --- |
| `bg-brand-gradient` | blue-600 to purple-600 | primary buttons, chat bubbles, active tabs |
| `bg-brand-gradient-dark` | deep blue to purple | page headers, chat CTA |
| `bg-brand-gradient-soft` | pale blue to pale purple | hero and search page backgrounds |
| `text-brand-gradient` | gradient text | "RailBook" in the logo and hero |

A gradient is a `background-image`, so `disabled:bg-gray-300` alone won't hide it. Add `disabled:bg-none`,
as the hero search button does.

The shadcn-style variables (`--primary`, `--border`...) in `:root` are kept for future shadcn components and
point at the same blue.

## Fonts

`src/app/layout.tsx` imports `@fontsource-variable/plus-jakarta-sans` and
`@fontsource-variable/jetbrains-mono`. The font files are bundled at build time. Nothing is downloaded from
Google Fonts, which is what failed before behind a TLS-intercepting proxy. `--font-sans` and `--font-mono`
in `@theme` name them. Use `font-mono` for PNRs and train numbers.

## Hero train animation

`src/components/home/TrainTrack.tsx` draws a side view of an electrified line inside an 80px box at the
bottom of the hero.

- **Static scenery** (one SVG, viewBox 4000 wide with `xMinYMax slice`, so it is drawn 1:1 and only
  clipped):
  - masts with cantilever arms
  - catenary: messenger wire at y=6, contact wire at y=12, droppers between them
  - ballast, sleepers, and the rail top at y=64
- **The train** (a second SVG that moves): 15 LHB-style coaches and an English Electric style electric
  locomotive.
  - Each coach has a roof, tinted windows, end doors, the livery band, an underframe, two bogies and
    gangway bellows. The rear one is a generator car with louvres.
  - The locomotive has a raked front cab, louvres, an "EE" plate, a lowered rear pantograph and a raised
    front one touching the contact wire, plus two three-axle bogies.
  - The train SVG starts 10px down the box, so the wheel bottoms (y=54) sit on the rail.

CSS in `globals.css`:

- `.train-run` moves the train from -1760px to `100vw` over 32s.
- `.rb-wheel` turns each wheel once every 0.22s, which matches the ground speed.
- Both stop under `prefers-reduced-motion`.

If you change `COACHES` or `COACH_L`, update the `-1760px` start offset too, or the train will pop in.

## Layout conventions

- Cards: `rounded-2xl border border-gray-200 bg-white shadow-sm`.
- Page width: `max-w-5xl` for flows, `max-w-6xl` / `max-w-7xl` for the home page and admin.
- The chat launcher is fixed at the bottom right. The footer has extra bottom padding on mobile so the
  launcher never covers its links.
