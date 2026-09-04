/* ---------------------------------------------------------------
   Browser code for the weather page.

   It never talks to WeatherAPI.com directly. Instead it calls
   OUR endpoint:  /api/weather?q=<place>
   which is a small serverless function (netlify/functions/weather.js)
   that adds the secret API key and forwards the request.

   "q" can be a city name ("London") OR "latitude,longitude"
   ("51.5,-0.12") — WeatherAPI accepts both.
   --------------------------------------------------------------- */

// Grab the elements we need from the page, once.
const form = document.getElementById("search-form");
const cityInput = document.getElementById("city-input");
const locateBtn = document.getElementById("locate-btn");
const statusEl = document.getElementById("status");
const resultEl = document.getElementById("result");

// --- Event: user typed a city and pressed Search / Enter ---
form.addEventListener("submit", (event) => {
  event.preventDefault(); // stop the browser from reloading the page
  const city = cityInput.value.trim();
  if (!city) {
    showError("Please type a city name.");
    return;
  }
  getWeather(city);
});

// --- Event: user clicked "Use my location" ---
locateBtn.addEventListener("click", () => {
  if (!navigator.geolocation) {
    showError("Your browser does not support location.");
    return;
  }
  setStatus("Getting your location…");
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      getWeather(`${latitude},${longitude}`);
    },
    () => {
      showError("Could not get your location. Try searching by city instead.");
    }
  );
});

/**
 * Ask our serverless function for the weather, then show it.
 * @param {string} query - a city name or "lat,lon"
 */
async function getWeather(query) {
  setStatus("Loading…");
  resultEl.hidden = true;

  try {
    const response = await fetch("/api/weather?q=" + encodeURIComponent(query));
    const data = await response.json();

    // Our function forwards WeatherAPI errors with a non-200 status.
    if (!response.ok) {
      const message =
        (data && data.error && data.error.message) || "Something went wrong.";
      showError(message);
      return;
    }

    render(data);
    setStatus("");
  } catch (err) {
    showError("Network problem. Please check your connection and try again.");
  }
}

/**
 * Build the result card from WeatherAPI's response.
 * See the shape of `data` in the WeatherAPI docs:
 * data.location.{name, region, country}
 * data.current.{temp_c, feelslike_c, humidity, wind_kph, condition:{text, icon}}
 */
function render(data) {
  const loc = data.location;
  const now = data.current;

  const regionBits = [loc.region, loc.country].filter(Boolean).join(", ");

  resultEl.innerHTML = `
    <div class="place">${escapeHtml(loc.name)}</div>
    <div class="region">${escapeHtml(regionBits)}</div>
    <div class="temp">${Math.round(now.temp_c)}°C</div>
    <div class="condition">
      <img src="https:${now.condition.icon}" alt="" width="40" height="40" />
      <span>${escapeHtml(now.condition.text)}</span>
    </div>
    <div class="details">
      <div><span>Feels like</span><br>${Math.round(now.feelslike_c)}°C</div>
      <div><span>Humidity</span><br>${now.humidity}%</div>
      <div><span>Wind</span><br>${Math.round(now.wind_kph)} km/h</div>
      <div><span>Local time</span><br>${escapeHtml(loc.localtime.split(" ")[1] || "")}</div>
    </div>
  `;
  resultEl.hidden = false;
}

// --- Small helpers ---

function setStatus(text) {
  statusEl.textContent = text;
  statusEl.classList.remove("error");
}

function showError(text) {
  statusEl.textContent = text;
  statusEl.classList.add("error");
  resultEl.hidden = true;
}

// Prevent odd place names from injecting HTML into the page.
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
