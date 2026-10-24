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

## Dark and light mode

Light is the default (`DEFAULT_THEME` in `src/lib/theme.ts`). The sun/moon button in the navbar
(`components/layout/ThemeToggle.tsx`) switches the theme and saves it in a `theme` cookie (`light` or
`dark`, kept for a year). The root layout reads that cookie on the server and renders `<html class="dark">`
only when it says `dark`. The first paint is always
in the right theme, with no flash. Shared names live in `src/lib/theme.ts`.

Pages use plain classes (`bg-white`, `text-gray-900`, `bg-brand-50`, `text-amber-800`) and almost no
`dark:` variants. The `.dark` block in `globals.css` remaps the palettes those classes use:

| In light | In dark |
| --- | --- |
| `gray-50` to `gray-900` | inverted: `gray-50` is the page background, `gray-900` near-white text |
| `bg-white` | the card color (unlayered `.dark .bg-white` rules, plus `/70`, `/80`, `/90`) |
| `brand`, `grape`, `amber`, `emerald`, `rose` tints (50 to 300) | dark tints of the same hue |
| their text shades (600 to 900) | lighter shades that read on dark |
| `--background`, `--card`, `--border` | navy surfaces |

Some things must look the same in both themes, so they use the fixed `--rb-*` shades instead of the
remapped palette:

- `bg-brand-gradient` and `bg-brand-gradient-dark`, which carry white text
- the train body and livery
- amber buttons, which use `text-slate-900` rather than `text-gray-900`

The track scenery has its own `--track-*` colors for each theme.

When you add UI:

- Keep using the normal classes. They adapt on their own.
- Use `text-slate-*` only for text that sits on a fixed-color background.
- Use `dark:` only when a remap is not enough.

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

## Responsive layout

The app is laid out mobile first and checked at 390px (phone), 820px (tablet) and 1280px (desktop).

| Area | Phone | Tablet (`sm`/`md`) | Desktop (`lg`) |
| --- | --- | --- | --- |
| Navbar | logo, theme, avatar, hamburger menu | inline links from `md` (768px) | same |
| Hero search card | stacked; swap button floats between From and To | From / To, then Date / Search | one row |
| Quick services | 2 columns, chat card full width | 3 columns | 5 columns |
| Booking pages (passenger details, summary, ticket) | one column | one column | two columns: details left, sticky summary or actions right |
| Tables (schedule, PNR, admin, ticket passengers) | scroll sideways inside their card | same | full width |

Rules that keep it from breaking:

- The two-column pages use `grid-cols-1 lg:grid-cols-[minmax(0,1fr)_380px]`. The explicit `grid-cols-1`
  matters: without it, a wide table inside a card stretches the whole page on phones.
- Wide content goes inside an `overflow-x-auto` wrapper. Never put `overflow-hidden` on a section that
  contains a dropdown. The hero section has no overflow clipping, so the station list and calendar can
  extend below it. Only the train track clips itself.
- The floating chat launcher sits bottom right. The footer has extra bottom padding on phones so the
  launcher never covers its links.

To re-check after layout changes, emulate real device widths. Headless browsers have a minimum window
width of about 500px, so use DevTools device mode or the Chrome DevTools Protocol
(`Emulation.setDeviceMetricsOverride`). Then confirm `document.documentElement.scrollWidth` equals the
viewport width on every page.

## Scrollbars, calendar and other details

- **Scrollbars.** They are thin (8px) and rounded, with gray-300 thumbs in theme colors. Both
  `scrollbar-width`/`scrollbar-color` and `::-webkit-scrollbar` rules are in `globals.css`.
- **Date picker.** react-calendar's own stylesheet loads after ours, so every override is scoped to
  `.react-calendar.rb-calendar` (the `className` passed in `TravelDatePicker`). It uses the app font,
  no border, brand hover, purple weekends and the gradient for the selected day, in both themes.
- **Focus.** Inputs show a brand-blue border on focus.

## Layout conventions

- Cards: `rounded-2xl border border-gray-200 bg-white shadow-sm`.
- Page width: `max-w-5xl` for flows, `max-w-6xl` / `max-w-7xl` for the home page and admin.
- The chat launcher is fixed at the bottom right. The footer has extra bottom padding on mobile so the
  launcher never covers its links.
