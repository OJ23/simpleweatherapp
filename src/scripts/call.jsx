const weatherCodeMap = {
  0: { label: "Sunny", icon: "sunny" },
  1: { label: "Mainly clear", icon: "sunny" },
  2: { label: "Partly cloudy", icon: "partly-cloudy" },
  3: { label: "Overcast", icon: "overcast" },
  45: { label: "Fog", icon: "fog" },
  48: { label: "Depositing rime fog", icon: "fog" },
  51: { label: "Light drizzle", icon: "drizzle" },
  53: { label: "Drizzle", icon: "drizzle" },
  55: { label: "Dense drizzle", icon: "drizzle" },
  56: { label: "Freezing drizzle", icon: "drizzle" },
  57: { label: "Dense freezing drizzle", icon: "drizzle" },
  61: { label: "Slight rain", icon: "rain" },
  63: { label: "Rain", icon: "rain" },
  65: { label: "Heavy rain", icon: "rain" },
  66: { label: "Freezing rain", icon: "rain" },
  67: { label: "Heavy freezing rain", icon: "rain" },
  71: { label: "Snow", icon: "snow" },
  73: { label: "Snow", icon: "snow" },
  75: { label: "Heavy snow", icon: "snow" },
  77: { label: "Snow grains", icon: "snow" },
  80: { label: "Rain showers", icon: "rain" },
  81: { label: "Rain showers", icon: "rain" },
  82: { label: "Heavy rain showers", icon: "rain" },
  85: { label: "Snow showers", icon: "snow" },
  86: { label: "Heavy snow showers", icon: "snow" },
  95: { label: "Thunderstorm", icon: "storm" },
  96: { label: "Thunderstorm with hail", icon: "storm" },
  99: { label: "Thunderstorm with hail", icon: "storm" },
};

function getWeatherPresentation(code) {
  return weatherCodeMap[code] || { label: "Weather", icon: "partly-cloudy" };
}

function formatDayLabel(dateString) {
  return new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(
    new Date(dateString),
  );
}

function formatReadableDate(dateString, timezone) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: timezone,
  }).format(new Date(dateString));
}

function formatHourLabel(dateString, timezone) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    hour12: true,
    timeZone: timezone,
  }).format(new Date(dateString));
}

function toTemperature(value) {
  return `${Math.round(value)}\u00B0C`;
}

async function geocodeCity(city) {
  const geocodeUrl = new URL("https://geocoding-api.open-meteo.com/v1/search");
  geocodeUrl.searchParams.set("name", city);
  geocodeUrl.searchParams.set("count", "1");
  geocodeUrl.searchParams.set("language", "en");
  geocodeUrl.searchParams.set("format", "json");

  const response = await fetch(geocodeUrl);
  if (!response.ok) {
    throw new Error("Unable to look up that city right now.");
  }

  const data = await response.json();
  const place = data?.results?.[0];

  if (!place) {
    throw new Error("City not found. Try a more specific search.");
  }

  return place;
}

async function fetchForecast(latitude, longitude, timezone) {
  const forecastUrl = new URL("https://api.open-meteo.com/v1/forecast");
  forecastUrl.searchParams.set("latitude", String(latitude));
  forecastUrl.searchParams.set("longitude", String(longitude));
  forecastUrl.searchParams.set(
    "current",
    [
      "temperature_2m",
      "relative_humidity_2m",
      "precipitation",
      "weather_code",
      "wind_speed_10m",
      "apparent_temperature",
    ].join(","),
  );
  forecastUrl.searchParams.set(
    "hourly",
    [
      "temperature_2m",
      "relative_humidity_2m",
      "precipitation_probability",
      "weather_code",
      "wind_speed_10m",
    ].join(","),
  );
  forecastUrl.searchParams.set(
    "daily",
    [
      "weather_code",
      "temperature_2m_max",
      "temperature_2m_min",
      "precipitation_sum",
    ].join(","),
  );
  forecastUrl.searchParams.set("forecast_days", "7");
  forecastUrl.searchParams.set("timezone", timezone || "auto");

  const response = await fetch(forecastUrl);
  if (!response.ok) {
    throw new Error("Unable to load forecast data right now.");
  }

  return response.json();
}

export default async function getWeatherData(city = "Abuja") {
  const place = await geocodeCity(city);
  const forecast = await fetchForecast(place.latitude, place.longitude, place.timezone);
  const timezone = forecast.timezone || place.timezone || "UTC";
  const currentPresentation = getWeatherPresentation(forecast.current.weather_code);
  const currentHourIndex = Math.max(
    0,
    forecast.hourly.time.findIndex((time) => time === forecast.current.time),
  );
  const hourlyTimes = forecast.hourly.time.slice(currentHourIndex, currentHourIndex + 8);

  const hourly = hourlyTimes.map((time, index) => {
    const forecastIndex = currentHourIndex + index;
    const temperatureValue = forecast.hourly.temperature_2m[forecastIndex];
    const presentation = getWeatherPresentation(forecast.hourly.weather_code[forecastIndex]);

    return {
      time: formatHourLabel(time, timezone),
      temperatureValue,
      temperature: toTemperature(temperatureValue),
      icon: presentation.icon,
      label: presentation.label,
    };
  });

  const daily = forecast.daily.time.map((time, index) => {
    const highValue = forecast.daily.temperature_2m_max[index];
    const lowValue = forecast.daily.temperature_2m_min[index];
    const presentation = getWeatherPresentation(forecast.daily.weather_code[index]);

    return {
      day: formatDayLabel(time),
      highValue,
      lowValue,
      high: toTemperature(highValue),
      low: toTemperature(lowValue),
      icon: presentation.icon,
      label: presentation.label,
    };
  });

  return {
    location: {
      city: place.name,
      country: place.country,
      admin1: place.admin1 || "",
      latitude: place.latitude,
      longitude: place.longitude,
      source: "Open-Meteo",
      timezone,
    },
    current: {
      date: formatReadableDate(forecast.current.time, timezone),
      temperatureValue: forecast.current.temperature_2m,
      temperature: toTemperature(forecast.current.temperature_2m),
      description: currentPresentation.label,
      icon: currentPresentation.icon,
      feelsLikeValue: forecast.current.apparent_temperature,
      feelsLike: toTemperature(forecast.current.apparent_temperature),
      humidity: `${Math.round(forecast.current.relative_humidity_2m)}%`,
      windSpeedValue: forecast.current.wind_speed_10m,
      wind: `${Math.round(forecast.current.wind_speed_10m)} km/h`,
      precipitationValue: forecast.current.precipitation,
      precipitation: `${Number(forecast.current.precipitation).toFixed(
        forecast.current.precipitation > 0 ? 1 : 0,
      )} mm`,
    },
    daily,
    hourly,
  };
}
