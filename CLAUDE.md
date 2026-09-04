# CLAUDE.md

Notes for future Claude Code sessions working on this project.

## What this is

A beginner's first weather app. Shows **current conditions plus a 7-day
forecast** for a place (searched by city name, or via the browser's
geolocation), with light/dark mode and small fade-in animations. Data from
**WeatherAPI.com**. Hosted on **Netlify**, connected to the GitHub repo
`mhmatinyan-ship-it/new-w_api`.

The user is new to coding — keep explanations plain, prefer small readable
vanilla code over abstractions, and confirm anything non-obvious before doing it.

## Stack

- Plain HTML / CSS / JS. **No build step, no framework, no bundler.**
- One Netlify serverless function (Node 18+, built-in `fetch`, no dependencies).

## How a request flows

```
browser (app.js)
  → GET /api/weather?q=<city or "lat,lon">
  → Netlify rewrites to /.netlify/functions/weather   (netlify.toml)
  → weather.js adds ?key=WEATHER_API_KEY and calls
    https://api.weatherapi.com/v1/forecast.json&days=7
    (forecast.json returns BOTH current conditions and the 7-day forecast
    in one response, so one function call covers both)
  → JSON flows back to the browser; app.js renders the card + forecast row
```

`FORECAST_DAYS` is a constant at the top of `weather.js`. WeatherAPI's free
plan supports fewer forecast days than paid plans — if a deploy starts
returning a plan/quota error, lower that constant.

## The API key

- Env var name: **`WEATHER_API_KEY`**.
- Local dev: in `.env` (git-ignored; see `.env.example`).
- Production: set in Netlify → Site settings → Environment variables.
- **Never** put the key in client-side code or commit it. `.claude/settings.json`
  blocks reading `.env` from Claude Code.

## Run locally

```bash
npx netlify-cli dev
```

Then open the localhost URL it prints (default http://localhost:8888). This runs
the static site *and* the function together. Opening `index.html` directly will
not work because `/api/weather` needs the function.

## Files

| File | Purpose |
|------|---------|
| `index.html` | markup: search box, "use my location" button, result card |
| `styles.css` | minimal light styling; colours are CSS variables at the top |
| `app.js` | fetches `/api/weather`, renders the result, handles errors |
| `netlify/functions/weather.js` | serverless proxy that adds the API key |
| `netlify.toml` | publish dir, functions dir, `/api/weather` rewrite |
| `package.json` | project marker + Node engine; `npm run dev` = `netlify dev` |

## Dark mode

Colours are CSS variables on `:root` (`styles.css`). Dark values are applied
either by `@media (prefers-color-scheme: dark)` (device setting) or by
`:root[data-theme="dark"]` (explicit choice via the toggle button). The
visitor's explicit choice is saved in `localStorage["theme"]` and re-applied
by an inline `<script>` in `index.html`'s `<head>` before first paint, to
avoid a flash of the wrong theme. `app.js`'s `initTheme()` / `effectiveTheme()`
/ `updateToggleIcon()` drive the button.

## Animation

Kept subtle: `.fade-in` (a `fadeInUp` keyframe) plays when the result card is
re-rendered (`playFadeIn()` in `app.js`), and each forecast day card animates
in on its own with a small stagger (`--delay` inline style). Colour/border
transitions make the light/dark switch smooth. All of it is skipped for
visitors with `prefers-reduced-motion: reduce`.

## Planned next steps (not done yet)

1. °C / °F toggle.
2. Hourly forecast view (WeatherAPI's response already includes
   `forecast.forecastday[].hour[]` — not used yet).
