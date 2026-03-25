import DropdownIcon from "../assets/images/icon-dropdown.svg";
import { getWeatherIcon } from "./weathercard";

export default function HourlyForecast({ hourlyItems }) {
  return (
    <aside className="hourly-panel">
      <div className="section-heading section-heading--split">
        <h2>Hourly forecast</h2>
        <button type="button" className="day-filter">
          <span>Today</span>
          <img src={DropdownIcon} alt="" aria-hidden="true" />
        </button>
      </div>

      <div className="hourly-list">
        {hourlyItems.map((item) => (
          <article className="hourly-row" key={item.time}>
            <div className="hourly-row__meta">
              <img src={getWeatherIcon(item.icon)} alt={item.label} />
              <span>{item.time}</span>
            </div>
            <span className="hourly-row__temp">{item.temperature}</span>
          </article>
        ))}
      </div>
    </aside>
  );
}
