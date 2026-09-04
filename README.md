# Weather app

A simple page that shows the **current weather** for a city (or your current
location). Built with plain HTML/CSS/JS and one small Netlify serverless
function that keeps the API key secret.

---

## How it works (short version)

Your browser never calls WeatherAPI.com directly. It calls a small function on
your own site (`/api/weather`), and that function adds the secret key and makes
the real call. That way visitors can't see or steal your key.

```
browser  →  /api/weather?q=London  →  your Netlify function  →  WeatherAPI.com
```

---

## 1. Get an API key

1. Sign up (free) at <https://www.weatherapi.com/>.
2. Copy your key from <https://www.weatherapi.com/my/>.

## 2. Set up the key locally

1. Make a copy of `.env.example` and name the copy `.env`.
2. Put your key in it:

   ```
   WEATHER_API_KEY=your_real_key_here
   ```

`.env` is git-ignored — it will **not** be committed. Good.

## 3. Run it on your computer

You need [Node.js](https://nodejs.org/) (version 18 or newer) installed. Then, in
this folder:

```bash
npx netlify-cli dev
```

The first time, it may ask to install `netlify-cli` — say yes. It will print a
local address (usually <http://localhost:8888>). Open it in your browser.

Try:
- Type `London` → Search.
- Click **Use my location** and allow the browser prompt.
- Type nonsense like `asdfasdf` → you should see a friendly error, not a crash.

> Opening `index.html` by double-clicking will **not** work — the `/api/weather`
> part needs the function, which only runs via `netlify dev` or on Netlify.

## 4. Push your code to GitHub

The repo is already connected. When you're ready:

```bash
git add .
git commit -m "Add weather app"
git push
```

## 5. Deploy on Netlify

1. Go to <https://app.netlify.com/> and log in (you can log in with GitHub).
2. **Add new site → Import an existing project → GitHub → pick `new-w_api`**.
3. Netlify reads `netlify.toml` automatically, so leave the build command empty
   and the publish directory as is. Click **Deploy**.
4. After the first deploy, go to **Site configuration → Environment variables →
   Add a variable**:
   - Key: `WEATHER_API_KEY`
   - Value: your real key
5. Go to **Deploys → Trigger deploy → Deploy site** so the new variable takes
   effect.
6. Open your live URL and test it the same way as step 3.

That's it. Every time you `git push`, Netlify redeploys automatically.

---

## What's next

Forecast, a °C/°F toggle, dark mode, and small animations — see `CLAUDE.md`.
