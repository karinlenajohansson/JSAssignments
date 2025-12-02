

const API_KEY = 'DIN_API_NYCKEL_HÄR'; // byt ut mot din egen

const form = document.getElementById('search-form');
const cityInput = document.getElementById('city-input');
const weatherContainer = document.getElementById('current-weather');

form.addEventListener('submit', (event) => {
  event.preventDefault(); // stoppa sidladdning
  const city = cityInput.value.trim();

  if (!city) return;

  // Endast svenska städer: lägg till ,SE
  fetchWeatherForSwedishCity(city);
});

async function fetchWeatherForSwedishCity(city) {
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
    city
  )},SE&units=metric&lang=se&appid=${API_KEY}`;

  try {
    weatherContainer.innerHTML = '<p>Laddar väder...</p>';

    const response = await fetch(url);

    if (!response.ok) {
      // t.ex. 404 om staden inte finns
      throw new Error('Staden hittades inte, testa en annan stad i Sverige.');
    }

    const data = await response.json();
    renderCurrentWeather(data);
  } catch (error) {
    showError(error.message);
  }
}

function renderCurrentWeather(data) {
  const cityName = data.name;
  const temp = Math.round(data.main.temp);
  const feelsLike = Math.round(data.main.feels_like);
  const description = data.weather[0].description;
  const icon = data.weather[0].icon;
  const wind = data.wind.speed;
  const humidity = data.main.humidity;

  weatherContainer.innerHTML = `
    <article class="weather-card">
      <h2>${cityName}, Sverige</h2>
      <div class="weather-main">
        <img
          src="https://openweathermap.org/img/wn/${icon}@2x.png"
          alt="${description}"
        >
        <p class="temp">${temp}°C</p>
      </div>
      <p class="description">${description}</p>
      <p>Känns som: ${feelsLike}°C</p>
      <p>Vind: ${wind} m/s</p>
      <p>Luftfuktighet: ${humidity}%</p>
    </article>
  `;
}

function showError(message) {
  weatherContainer.innerHTML = `<p class="error">${message}</p>`;
}
