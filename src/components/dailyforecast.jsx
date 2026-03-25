import { getWeatherIcon } from "./weathercard";

export default function DailyForecast({ days }) {
  return (
    <section className="forecast-block">
      <div className="section-heading">
        <h2>Daily forecast</h2>
      </div>

      <div className="daily-grid">
        {days.map((day) => (
          <article className="daily-card" key={day.day}>
            <p className="daily-card__day">{day.day}</p>
            <img
              src={getWeatherIcon(day.icon)}
              alt={day.label}
              className="daily-card__icon"
            />
            <div className="daily-card__temps">
              <span>{day.high}</span>
              <span>{day.low}</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
