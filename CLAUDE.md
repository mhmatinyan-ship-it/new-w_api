# CLAUDE.md

Notes for future Claude Code sessions working on this project.

## What this is

A beginner's first weather app. Shows **current** conditions for a place
(searched by city name, or via the browser's geolocation). Data from
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
    https://api.weatherapi.com/v1/current.json
  → JSON flows back to the browser, app.js renders the card
```

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

## Planned next steps (not done yet)

1. Forecast (WeatherAPI `/forecast.json`) — multi-day view.
2. °C / °F toggle.
3. Dark mode (colours are already variables — add a `prefers-color-scheme`
   block or a toggle).
4. Light load/transition animations.
