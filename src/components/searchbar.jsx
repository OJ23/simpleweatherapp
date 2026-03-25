import { useState } from "react";
import SearchIcon from "../assets/images/icon-search.svg";

export default function Searcher({ onSearch, loading = false, defaultValue = "Abuja" }) {
  const [city, setCity] = useState(defaultValue);

  const handleSubmit = (event) => {
    event.preventDefault();
    const trimmedCity = city.trim();

    if (!trimmedCity || loading) {
      return;
    }

    onSearch(trimmedCity);
  };

  return (
    <form className="searchbar" onSubmit={handleSubmit}>
      <label className="searchbar__field" htmlFor="city-search">
        <img src={SearchIcon} alt="" aria-hidden="true" />
        <input
          id="city-search"
          name="city"
          type="text"
          placeholder="Search for a place..."
          value={city}
          onChange={(event) => setCity(event.target.value)}
        />
      </label>

      <button type="submit" className="searchbar__button" disabled={loading}>
        {loading ? "Loading..." : "Search"}
      </button>
    </form>
  );
}
