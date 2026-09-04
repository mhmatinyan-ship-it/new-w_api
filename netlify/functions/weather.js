/* ---------------------------------------------------------------
   Serverless function: the "middleman" between the browser and
   WeatherAPI.com.

   Why it exists: the API key must stay secret. It lives in an
   environment variable (WEATHER_API_KEY) that only the server
   can read — never in the browser code.

   The browser calls:   /api/weather?q=London
   Netlify maps that to: /.netlify/functions/weather?q=London
   (see netlify.toml)

   Netlify runs this on Node 18+, which has a built-in `fetch`,
   so there are no dependencies to install.
   --------------------------------------------------------------- */

exports.handler = async (event) => {
  const query = event.queryStringParameters && event.queryStringParameters.q;

  // 1. The browser must tell us WHAT place to look up.
  if (!query) {
    return json(400, { error: { message: "Missing 'q' (a city or lat,lon)." } });
  }

  // 2. The key must be configured (locally in .env, on Netlify in
  //    Site settings → Environment variables).
  const apiKey = process.env.WEATHER_API_KEY;
  if (!apiKey) {
    return json(500, {
      error: { message: "Server is missing WEATHER_API_KEY. Add it and redeploy." },
    });
  }

  // 3. Call WeatherAPI's "current weather" endpoint.
  const url =
    "https://api.weatherapi.com/v1/current.json" +
    "?key=" + encodeURIComponent(apiKey) +
    "&q=" + encodeURIComponent(query) +
    "&aqi=no";

  try {
    const upstream = await fetch(url);
    const data = await upstream.json();

    // Forward WeatherAPI's own error (bad city, quota, etc.) as-is
    // so the page can show a useful message.
    if (!upstream.ok) {
      return json(upstream.status, data);
    }

    return json(200, data);
  } catch (err) {
    // Note: we deliberately do NOT log the URL or key.
    return json(502, { error: { message: "Could not reach the weather service." } });
  }
};

// Helper: build a JSON HTTP response.
function json(statusCode, body) {
  return {
    statusCode,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  };
}
