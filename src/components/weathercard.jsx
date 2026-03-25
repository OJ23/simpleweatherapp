import LargeBackdrop from "../assets/images/bg-today-large.svg";
import WeatherIcon from "../assets/images/icon-sunny.webp";
import RainIcon from "../assets/images/icon-rain.webp";
import OvercastIcon from "../assets/images/icon-overcast.webp";
import PartlyCloudyIcon from "../assets/images/icon-partly-cloudy.webp";
import FogIcon from "../assets/images/icon-fog.webp";
import DrizzleIcon from "../assets/images/icon-drizzle.webp";
import SnowIcon from "../assets/images/icon-snow.webp";
import StormIcon from "../assets/images/icon-storm.webp";

const iconMap = {
  sunny: WeatherIcon,
  rain: RainIcon,
  overcast: OvercastIcon,
  "partly-cloudy": PartlyCloudyIcon,
  fog: FogIcon,
  drizzle: DrizzleIcon,
  snow: SnowIcon,
  storm: StormIcon,
};

export function getWeatherIcon(iconName) {
  return iconMap[iconName] || WeatherIcon;
}

export default function Weathercard({ current, location }) {
  const highlights = [
    { label: "Feels Like", value: current.feelsLike },
    { label: "Humidity", value: current.humidity },
    { label: "Wind", value: current.wind },
    { label: "Precipitation", value: current.precipitation },
  ];

  return (
    <section className="weather-summary">
      <article className="today-card">
        <img
          src={LargeBackdrop}
          alt=""
          aria-hidden="true"
          className="today-card__background"
        />

        <div className="today-card__content">
          <div>
            <p className="today-card__location">
              {location.city}, {location.country}
            </p>
            <p className="today-card__date">
              {location.admin1 ? `${location.admin1} | ` : ""}
              {location.source} | {location.latitude.toFixed(2)}, {location.longitude.toFixed(2)}
            </p>
            <p className="today-card__date">{current.date}</p>
          </div>

          <div className="today-card__temperature">
            <img src={getWeatherIcon(current.icon)} alt={current.description} />
            <span>{current.temperature}</span>
          </div>
        </div>
      </article>

      <div className="highlight-grid">
        {highlights.map((item) => (
          <article className="highlight-card" key={item.label}>
            <p>{item.label}</p>
            <h2>{item.value}</h2>
          </article>
        ))}
      </div>
    </section>
  );
}