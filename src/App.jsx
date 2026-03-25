import "./styles/App.css";
import { useEffect, useRef, useState } from "react";
import Searcher from "./components/searchbar";
import Weathercard from "./components/weathercard";
import DailyForecast from "./components/dailyforecast";
import HourlyForecast from "./components/hourlyforecast";
import Logo from "./assets/images/logo.svg";
import UnitsIcon from "./assets/images/icon-units.svg";
import CheckIcon from "./assets/images/icon-checkmark.svg";
import DropdownIcon from "./assets/images/icon-dropdown.svg";
import getWeatherData from "./scripts/call";

function toFahrenheit(value) {
  return (value * 9) / 5 + 32;
}

function toMilesPerHour(value) {
  return value / 1.60934;
}

function toInches(value) {
  return value / 25.4;
}

function formatTemperature(value, unit) {
  const normalizedValue = unit === "fahrenheit" ? toFahrenheit(value) : value;
  const suffix = unit === "fahrenheit" ? "F" : "C";

  return `${Math.round(normalizedValue)}\u00B0${suffix}`;
}

function formatWind(value, unit) {
  if (unit === "mph") {
    return `${Math.round(toMilesPerHour(value))} mph`;
  }

  return `${Math.round(value)} km/h`;
}

function formatPrecipitation(value, unit) {
  if (unit === "in") {
    return `${Number(toInches(value)).toFixed(value > 0 ? 1 : 0)} in`;
  }

  return `${Number(value).toFixed(value > 0 ? 1 : 0)} mm`;
}

function createDisplayWeather(weather, units) {
  if (!weather) {
    return null;
  }

  return {
    ...weather,
    current: {
      ...weather.current,
      temperature: formatTemperature(weather.current.temperatureValue, units.temperature),
      feelsLike: formatTemperature(weather.current.feelsLikeValue, units.temperature),
      wind: formatWind(weather.current.windSpeedValue, units.windSpeed),
      precipitation: formatPrecipitation(weather.current.precipitationValue, units.precipitation),
    },
    daily: weather.daily.map((day) => ({
      ...day,
      high: formatTemperature(day.highValue, units.temperature),
      low: formatTemperature(day.lowValue, units.temperature),
    })),
    hourly: weather.hourly.map((item) => ({
      ...item,
      temperature: formatTemperature(item.temperatureValue, units.temperature),
    })),
  };
}

const unitGroups = [
  {
    label: "Temperature",
    key: "temperature",
    options: [
      { value: "celsius", label: "Celsius (\u00B0C)" },
      { value: "fahrenheit", label: "Fahrenheit (\u00B0F)" },
    ],
  },
  {
    label: "Wind Speed",
    key: "windSpeed",
    options: [
      { value: "kmh", label: "km/h" },
      { value: "mph", label: "mph" },
    ],
  },
  {
    label: "Precipitation",
    key: "precipitation",
    options: [
      { value: "mm", label: "Millimeters (mm)" },
      { value: "in", label: "Inches (in)" },
    ],
  },
];

function App() {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [units, setUnits] = useState({
    temperature: "celsius",
    windSpeed: "kmh",
    precipitation: "mm",
  });
  const [unitsMenuOpen, setUnitsMenuOpen] = useState(false);
  const unitsMenuRef = useRef(null);

  const loadWeather = async (city) => {
    try {
      setLoading(true);
      setError("");
      const data = await getWeatherData(city);
      setWeather(data);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load weather data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWeather("Abuja");
  }, []);

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (!unitsMenuRef.current?.contains(event.target)) {
        setUnitsMenuOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setUnitsMenuOpen(false);
      }
    };

    window.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const displayWeather = createDisplayWeather(weather, units);
  const isImperial =
    units.temperature === "fahrenheit" &&
    units.windSpeed === "mph" &&
    units.precipitation === "in";
  const unitsLabel = isImperial ? "Imperial" : "Units";

  const updateUnitGroup = (groupKey, value) => {
    setUnits((currentUnits) => ({
      ...currentUnits,
      [groupKey]: value,
    }));
  };

  return (
    <main className="app-shell">
      <section className="weather-app">
        <header className="topbar">
          <div className="brand">
            <img src={Logo} alt="Weather Now logo" className="brand__logo" />
            <span>Weather Now</span>
          </div>

          <div className="units-menu" ref={unitsMenuRef}>
            <button
              type="button"
              className="units-button"
              onClick={() => setUnitsMenuOpen((open) => !open)}
              aria-haspopup="true"
              aria-expanded={unitsMenuOpen}
            >
              <img src={UnitsIcon} alt="" aria-hidden="true" />
              <span>{unitsLabel}</span>
              <img
                src={DropdownIcon}
                alt=""
                aria-hidden="true"
                className={`units-button__chevron${unitsMenuOpen ? " units-button__chevron--open" : ""}`}
              />
            </button>

            {unitsMenuOpen ? (
              <div className="units-popover">
                <p className="units-popover__title">
                  Switch to {isImperial ? "metric" : "imperial"}
                </p>

                {unitGroups.map((group) => (
                  <div className="units-group" key={group.key}>
                    <p className="units-group__label">{group.label}</p>
                    <div className="units-options">
                      {group.options.map((option) => {
                        const isSelected = units[group.key] === option.value;

                        return (
                          <button
                            type="button"
                            className={`units-option${isSelected ? " units-option--selected" : ""}`}
                            key={option.value}
                            onClick={() => updateUnitGroup(group.key, option.value)}
                          >
                            <span>{option.label}</span>
                            {isSelected ? <img src={CheckIcon} alt="" aria-hidden="true" /> : null}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </header>

        <section className="hero-copy">
          <h1>How&apos;s the sky looking today?</h1>
          <Searcher onSearch={loadWeather} loading={loading} defaultValue="Abuja" />
          {error ? <p className="status-message status-message--error">{error}</p> : null}
        </section>

        {displayWeather ? (
          <section className="forecast-layout">
            <div className="forecast-main">
              <Weathercard current={displayWeather.current} location={displayWeather.location} />
              <DailyForecast days={displayWeather.daily} />
            </div>

            <HourlyForecast hourlyItems={displayWeather.hourly} />
          </section>
        ) : (
          <p className="status-message">Loading weather dashboard...</p>
        )}
      </section>
    </main>
  );
}

export default App;
