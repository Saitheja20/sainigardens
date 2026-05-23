# Saini Gardens — Event Venue Website

A production-ready, fully responsive wedding garden / function hall website built with **HTML5, CSS3, vanilla JavaScript, and Bootstrap 5** only. Designed with an editorial luxury aesthetic — deep midnight navy, champagne gold, and ivory white.

## ✨ Features

- **Sticky navigation** with scroll effects and active-link highlighting
- **Cinematic hero** with layered gradients, grain texture, and animated zoom
- **Editorial typography** — Cormorant Garamond (display) + Jost (body)
- **Interactive booking calendar**
  - Monthly grid with prev/next navigation
  - Past dates disabled, today highlighted, booked dates marked red with "Booked" label
  - Click any available date → opens the Bootstrap booking modal with the date pre-filled
- **Booking form modal** with client-side validation, loading spinner, success message, and `localStorage` persistence
- **Video tour section** with modal player (YouTube embed — swap for venue footage)
- **Gallery** with responsive masonry layout + keyboard-accessible lightbox (←/→/ESC)
- **Testimonials** powered by Bootstrap carousel with custom controls
- **Contact section** with embedded Google Maps
- **Floating mobile book-now button**
- **Reveal-on-scroll** animations via IntersectionObserver
- **Reduced-motion friendly** and cross-browser compatible

## 📁 Structure

```
saini-gardens/
├── index.html          # Full semantic markup
├── css/
│   └── style.css       # All styling (uses CSS variables for theme)
├── js/
│   └── script.js       # Calendar, booking, lightbox, scroll effects
├── images/             # Drop venue photos here (see swap guide below)
└── README.md
```

## 🚀 Run Locally

Open `index.html` directly in any modern browser — no build step required. For best results (Bootstrap's collapse, smooth font loading), serve via a local server:

```bash
# Python 3
python3 -m http.server 8080

# Node
npx serve .
```

Then visit `http://localhost:8080`.

## 🎨 Swapping Placeholder Imagery

All imagery is currently painted with layered CSS gradients (zero external image dependencies, instant load). To replace with real photographs:

1. Drop your images into `/images/` (use `.webp` or optimized `.jpg`).
2. In `css/style.css`, find the gradient rules below and replace with `background: url('../images/your-photo.jpg') center / cover no-repeat;`
   - `.hero__image` — main hero aerial
   - `.about__image--main`, `.about__image--accent` — about section
   - `.video-frame__thumb` — video thumbnail
   - `.event-card__image--wedding`, `--reception`, `--corporate`
   - `.gallery-image--1` through `--8`
3. Add `loading="lazy"` if you convert to `<img>` tags.

## 📅 Managing Booked Dates

Edit the `bookedDates` array at the top of `js/script.js`:

```js
const bookedDates = [
  '2026-05-10',
  '2026-05-15',
  // add more in 'YYYY-MM-DD' format
];
```

For a backend integration, replace with a `fetch()` that populates this array before `buildCalendar()` runs.

## 📨 Connecting the Booking Form

The form currently saves submissions to `localStorage` under the key `saini_bookings`. To ship real emails, replace the `setTimeout` block in `js/script.js` (inside the `bookingForm.addEventListener('submit', ...)`) with a `fetch` POST to your endpoint:

```js
const res = await fetch('/api/book', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(enquiry),
});
```

## 🌍 Deploy

Drop the folder into **Netlify**, **Vercel**, **GitHub Pages**, or any static host. No build step required.

```bash
# Netlify CLI
netlify deploy --prod --dir=.

# Vercel CLI
vercel --prod
```

## 🎨 Theming

All colors live as CSS variables at the top of `style.css`:

```css
:root {
  --ink-900: #0a1633;     /* deepest navy */
  --ink-800: #0f1f44;     /* primary dark blue */
  --gold-500: #b98628;    /* primary gold */
  --gold-400: #d4a24a;    /* bright gold */
  --ivory: #faf6ee;       /* soft cream bg */
  /* ...etc */
}
```

Swap these to rebrand the entire site in seconds.

## 🧩 Tech

- Bootstrap 5.3.3 (CDN) — navbar collapse, modals, carousel, grid
- Bootstrap Icons 1.11.3 (CDN)
- Google Fonts: Cormorant Garamond + Jost
- No other runtime dependencies

---

Crafted with care · Hanamkonda, Telangana
