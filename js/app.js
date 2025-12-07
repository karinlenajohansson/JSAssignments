/*
* Väder dashboard
* Hämtar och visar väderdata från OpenWeatherMap API
* Funktioner för svenska städer
* Visar nuvarande temperatur och detaljer
* Timprognos (24 timmar)
* 5-dagarsprognos
* Sparar senaste sökningar i localStorage
*  */

// API_KEY importeras från confis.js (ligger inte på Github)
 // ----- Hämta alla element från DOM ----- //

const API_KEY = window.WEATHER_API_KEY || ""; //

// Sökning
 const cityInput = document.getElementById("city-input");
 const searchBtn = document.getElementById("search-btn");

 // Sidofält: Huvudtemperatur
 const mainTempEl = document.getElementById("main-temp");
 const tempHighEl = document.getElementById("temp-high");
 const tempLowEl = document.getElementById("temp-low");
 const weatherIconEl = document.getElementById("weather-icon");
 const currentTimeEl = document.getElementById("current-time");

 // Väderdata: Vind
 const windSpeedEl = document.getElementById("wind-speed");
 const windDescEl = document.getElementById("wind-desc");

 // Väderdata: Känns som
 const feelsLikeEl = document.getElementById("feels-like");
 const feelsDescEl = document.getElementById("feels-desc");

 // Väderdata: Luftfuktighet
 const humidityEl = document.getElementById("humidity");
 const humidityStatusEl = document.getElementById("humidity-status");

 // Väderdata: Sikt
 const visibilityEl = document.getElementById("visibility");
 const visibilityStatusEl = document.getElementById("visibility-status");

 // Väderdata: Lufttryck
 const pressureEl = document.getElementById("pressure");
 const pressureDescEl = document.getElementById("pressure-desc");

 // Molnighet
 const cloudsEl = document.getElementById("clouds");
 const cloudsStatusEl = document.getElementById("clouds-status");

 // Prognoser
 const hourlyGraphEl = document.getElementById("hourly-graph");
 // 5-dagars
 const dailyListEl = document.getElementById("daily-list");
 // Senaste sökningar
 const searchListEl = document.getElementById("search-list");

 // Senaste sökta städer
 let recentCities = [];
 const MAX_RECENT = 5;  // Max antal sparade städer

 console.log("Väderdashboard-script laddat");

 // ----- Hjälpfunktion: formatera/översätta vädertext ----- //

 function formatDescription(raw) {
   if (!raw) return "";

   const key = raw.toLowerCase();

 // Översättning från engelska till svenska
   const map = {
     "overcast clouds": "Mulet",
     "broken clouds": "Molnigt",
     "scattered clouds": "Spridda moln",
     "few clouds": "Lätt molnighet",
     "clear sky": "Klart",
     "light rain": "Lätt regn",
     "moderate rain": "Regn",
     "heavy intensity rain": "Kraftigt regn",

     // Om API redan skickar svenska beskrivningar:
     "mulet": "Mulet",
     "molnigt": "Molnigt",
     "lätt molnighet": "Lätt molnighet",
     "klar himmel": "Klart"
   };

   const translated = map[key] || raw;
   return translated.charAt(0).toUpperCase() + translated.slice(1);
 }

 // ----- Event listeners ----- //

 // Klick på Sök-knappen
 if (searchBtn) {
   searchBtn.addEventListener("click", () => {
     const city = cityInput.value.trim();
     if (!city) return;
     fetchWeatherForSwedishCity(city);
   });
 }

 // Enter i inputfältet
 if (cityInput) {
   cityInput.addEventListener("keydown", (event) => {
     if (event.key === "Enter") {
       event.preventDefault();
       const city = cityInput.value.trim();
       if (!city) return;
       fetchWeatherForSwedishCity(city);
     }
   });
 }

 // Klick på senaste sökningar
 if (searchListEl) {
   searchListEl.addEventListener("click", (event) => {
     const btn = event.target.closest(".search-item");
     if (!btn) return;

     const city = btn.dataset.city;
     if (!city) return;

     cityInput.value = city;
     fetchWeatherForSwedishCity(city);
   });
 }

 // ----- Hämta nuvarande väder ----- //

 async function fetchWeatherForSwedishCity(city) {
   const url =
     "https://api.openweathermap.org/data/2.5/weather?q=" +
     encodeURIComponent(city) +
     ",SE&units=metric&lang=se&appid=" +
     API_KEY;

   try {
     // Visa laddningsstatus
     if (currentTimeEl) currentTimeEl.textContent = "Hämtar väder...";
     if (mainTempEl) mainTempEl.textContent = "--";
     if (tempHighEl) tempHighEl.textContent = "--";
     if (tempLowEl) tempLowEl.textContent = "--";
     if (weatherIconEl) weatherIconEl.innerHTML = "";
     if (hourlyGraphEl) hourlyGraphEl.innerHTML = "";
     if (dailyListEl) dailyListEl.innerHTML = "";

     const response = await fetch(url);

     // Felhantering Staden finns inte
     if (!response.ok) {
       showError("Staden hittades inte, testa en annan stad i Sverige.");
       return;
     }

     const data = await response.json();

     // Visa nuvarande väder
     renderCurrentWeather(data);

     // Hämta prognos
     const cityName = data.name || city;
     fetchForecast(cityName);

     // Spara sökningen
     addRecentSearch(cityName);
   } catch (error) {
     console.error(error);
     showError("Något gick fel när vädret skulle hämtas.");
   }
 }

 // ----- Render: nuvarande väder ----- //

 function renderCurrentWeather(data) {
   // Extrahera data från API-svar
   const temp = Math.round(data.main.temp);
   const feelsLike = Math.round(data.main.feels_like);
   const tempMax = Math.round(data.main.temp_max);
   const tempMin = Math.round(data.main.temp_min);
   const rawDescription = data.weather[0].description;
   const description = formatDescription(rawDescription);
   const icon = data.weather[0].icon;
   const wind = data.wind.speed;
   const humidity = data.main.humidity;
   const pressure = data.main.pressure;
   const visibilityMeters = data.visibility ?? 0;
   const visibilityKm = (visibilityMeters / 1000).toFixed(1);
   const clouds = data.clouds?.all ?? 0;

   // Uppdatera huvudtemperatur i sidofältet
   if (mainTempEl) mainTempEl.textContent = temp;
   if (tempHighEl) tempHighEl.textContent = tempMax;
   if (tempLowEl) tempLowEl.textContent = tempMin;

   // Visa väderikon
   if (weatherIconEl) {
     weatherIconEl.innerHTML = `
       <img
         src="https://openweathermap.org/img/wn/${icon}@2x.png"
         alt="${description}"
       />
     `;
   }

   // Visar aktuell tid
   if (currentTimeEl) {
     const now = new Date();
     currentTimeEl.textContent = now.toLocaleTimeString("sv-SE", {
       hour: "2-digit",
       minute: "2-digit",
     });
   }

   // Uppdatera vind
   if (windSpeedEl) windSpeedEl.textContent = wind.toFixed(1);
   if (windDescEl) windDescEl.textContent = description;

   // Uppdatera känns som
   if (feelsLikeEl) feelsLikeEl.textContent = feelsLike;
   if (feelsDescEl) feelsDescEl.textContent = `Känns som ${feelsLike}°C`;

   // Uppdatera luftfuktighet med status
   if (humidityEl) humidityEl.textContent = humidity;
   if (humidityStatusEl) {
     if (humidity < 40) {
       humidityStatusEl.textContent = "Torr luft";
     } else if (humidity < 70) {
       humidityStatusEl.textContent = "Behaglig luftfuktighet";
     } else {
       humidityStatusEl.textContent = "Fuktigt";
     }
   }

   // Uppdatera sikt med satus
   if (visibilityEl) visibilityEl.textContent = visibilityKm;
   if (visibilityStatusEl) {
     if (visibilityKm >= 10) {
       visibilityStatusEl.textContent = "Mycket god sikt";
     } else if (visibilityKm >= 5) {
       visibilityStatusEl.textContent = "God sikt";
     } else {
       visibilityStatusEl.textContent = "Begränsad sikt";
     }
   }

   // Uppdatea lufttryck med beskrivning
   if (pressureEl) pressureEl.textContent = pressure;
   if (pressureDescEl) {
     if (pressure < 1000) {
       pressureDescEl.textContent = "Lågt tryck (ofta ostadigt väder)";
     } else if (pressure > 1020) {
       pressureDescEl.textContent = "Högt tryck (ofta stabilt väder)";
     } else {
       pressureDescEl.textContent = "Normalt lufttryck";
     }
   }

   // Uppdatera med molninghet med status
   if (cloudsEl) cloudsEl.textContent = clouds;
   if (cloudsStatusEl) {
     if (clouds < 20) {
       cloudsStatusEl.textContent = "Klart";
     } else if (clouds < 60) {
       cloudsStatusEl.textContent = "Växlande molnighet";
     } else {
       cloudsStatusEl.textContent = "Mycket moln";
     }
   }
 }

 // ----- Forecast (timvis + 5 dagar) ----- //

 async function fetchForecast(city) {
   if (!hourlyGraphEl && !dailyListEl) return;

   const url =
     "https://api.openweathermap.org/data/2.5/forecast?q=" +
     encodeURIComponent(city) +
     ",SE&units=metric&lang=se&appid=" +
     API_KEY;

   try {
     const response = await fetch(url);

     if (!response.ok) {
       console.error("Kunde inte hämta forecast.");
       return;
     }

     const data = await response.json();

     // Rendera båda prognoserna
     renderHourlyForecast(data);
     renderDailyForecast(data);
   } catch (error) {
     console.error(error);
     if (hourlyGraphEl) {
       hourlyGraphEl.innerHTML = "<p>Kunde inte ladda kommande timmar.</p>";
     }
     if (dailyListEl) {
       dailyListEl.innerHTML = "<p>Kunde inte ladda 5-dagarsprognos.</p>";
     }
   }
 }

 // Prognos (kommande timmar) - kort med "NU" på första

 function renderHourlyForecast(data) {
   if (!hourlyGraphEl) return;

   const list = data.list || [];
   const nextItems = list.slice(0, 8); // ca 24 timmar fram

   if (!nextItems.length) {
     hourlyGraphEl.innerHTML = "<p>Ingen timprognos tillgänglig.</p>";
     return;
   }

   // Skapa HTML för vajre timkort
   const html = nextItems
     .map((item, index) => {
       const dt = new Date(item.dt * 1000);

       // Första kortet visar "NU" istället för tid
       const timeLabel =
         index === 0
           ? "NU"
           : dt.toLocaleTimeString("sv-SE", {
               hour: "2-digit",
               minute: "2-digit",
             });

       const temp = Math.round(item.main.temp);
       const icon = item.weather[0].icon;
       const rawDesc = item.weather[0].description;
       const description = formatDescription(rawDesc);

       return `
         <div class="hour-card">
           <div class="hour-time">${timeLabel}</div>
           <div class="hour-icon">
             <img
               src="https://openweathermap.org/img/wn/${icon}.png"
               alt="${description}"
             />
           </div>
           <div class="hour-temp">${temp}°C</div>
         </div>
       `;
     })
     .join("");

   hourlyGraphEl.innerHTML = html;
 }

 // 5-dagarsprognos

 function renderDailyForecast(data) {
   if (!dailyListEl) return;

   const list = data.list || [];
   const daysMap = {};

   // Grupperar prognoser per dag
   list.forEach((item) => {
     const d = new Date(item.dt * 1000);
     const dateKey = d.toISOString().slice(0, 10); // YYYY-MM-DD

     if (!daysMap[dateKey]) {
       daysMap[dateKey] = [];
     }
     daysMap[dateKey].push(item);
   });

   // Ta första 5 dagarna
   const allDates = Object.keys(daysMap).sort();
   const nextFive = allDates.slice(0, 5);

   // Skapa HTML för varje dag
   const html = nextFive
     .map((dateKey) => {
       const items = daysMap[dateKey];

       // Hitta min och max temperatur för dagen
       const temps = items.map((it) => it.main.temp);
       const min = Math.round(Math.min(...temps));
       const max = Math.round(Math.max(...temps));

       // Välj ikon från mitten av dagen för representativ bild
       const middleItem = items[Math.floor(items.length / 2)];
       const icon = middleItem.weather[0].icon;
       const rawDesc = middleItem.weather[0].description;
       const description = formatDescription(rawDesc);

       // Formatera datumlaber (t.ex. "mån 9 dec"
       const d = new Date(items[0].dt * 1000);
       const dayLabel = d.toLocaleDateString("sv-SE", {
         weekday: "short",
         day: "numeric",
         month: "short",
       });

       return `
         <div class="day-card">
           <div class="day-name">${dayLabel}</div>
           <div class="day-icon">
             <img
               src="https://openweathermap.org/img/wn/${icon}.png"
               alt="${description}"
             />
           </div>
           <div class="day-temps">
             <span class="day-temp-max">${max}°C max</span>
             <span class="day-temp-min">${min}°C min</span>
           </div>
         </div>
       `;
     })
     .join("");

   dailyListEl.innerHTML = html;
 }

 // ----- LOCALSTORAGE: Senaste sökningar ----- //

 function loadRecentSearches() {
   try {
     const saved = localStorage.getItem("recentCities");
     if (!saved) return;
     recentCities = JSON.parse(saved);
     renderRecentSearches();
   } catch (e) {
     console.error("Kunde inte läsa recentCities från localStorage", e);
   }
 }

 // Sparar senaste sökningar till localStorage
 function saveRecentSearches() {
   try {
     localStorage.setItem("recentCities", JSON.stringify(recentCities));
   } catch (e) {
     console.error("Kunde inte spara recentCities till localStorage", e);
   }
 }

 // Lägger till en stad i senaste sökningar
 function addRecentSearch(city) {
   const cityName = (city || "").trim();
   if (!cityName) return;

   // Ta bort duplicat om den redan finns
   recentCities = recentCities.filter(
     (c) => c.toLowerCase() !== cityName.toLowerCase()
   );

   // Lägg till först i listan
   recentCities.unshift(cityName);

   // Begräna till MAX_RECENT städer
   if (recentCities.length > MAX_RECENT) {
     recentCities = recentCities.slice(0, MAX_RECENT);
   }

   saveRecentSearches();
   renderRecentSearches();
 }

 // Renderar listan med senaste sökningar
 function renderRecentSearches() {
   if (!searchListEl) return;

   if (!recentCities.length) {
     searchListEl.innerHTML = "<p>Inga senaste sökningar ännu.</p>";
     return;
   }

   // Skapa knappar för varje sparad stad
   searchListEl.innerHTML = recentCities
     .map(
       (city) => `
         <button class="search-item" data-city="${city}">
           ${city}
         </button>
       `
     )
     .join("");
 }

 // ----- Felhantering ----- //

// Visar felmeddelande och återsäller UI
 function showError(message) {
   alert(message);

   // Återställ alla värden till "--"
   if (mainTempEl) mainTempEl.textContent = "--";
   if (tempHighEl) tempHighEl.textContent = "--";
   if (tempLowEl) tempLowEl.textContent = "--";
   if (currentTimeEl) currentTimeEl.textContent = "--:--";

   if (weatherIconEl) weatherIconEl.innerHTML = "";
   if (hourlyGraphEl) hourlyGraphEl.innerHTML = "";
   if (dailyListEl) dailyListEl.innerHTML = "";

   if (windSpeedEl) windSpeedEl.textContent = "--";
   if (windDescEl) windDescEl.textContent = "--";
   if (feelsLikeEl) feelsLikeEl.textContent = "--";
   if (feelsDescEl) feelsDescEl.textContent = "--";
   if (humidityEl) humidityEl.textContent = "--";
   if (humidityStatusEl) humidityStatusEl.textContent = "--";
   if (visibilityEl) visibilityEl.textContent = "--";
   if (visibilityStatusEl) visibilityStatusEl.textContent = "--";
   if (pressureEl) pressureEl.textContent = "--";
   if (pressureDescEl) pressureDescEl.textContent = "--";
   if (cloudsEl) cloudsEl.textContent = "--";
   if (cloudsStatusEl) cloudsStatusEl.textContent = "--";
 }

 // ----- Init ----- //

// Ladda senaste sökningar när sidan laddas
 loadRecentSearches();

