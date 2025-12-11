# JSAssignments

En enkel väderapp där man kan söka efter städer i Sverige och se:

Nuvarande väder (temperatur, känns som, vind, luftfuktighet, sikt, molnighet, lufttryck)
Timprognos för kommande timmar
5-dagars prognos
Felmeddelande om man skriver stavar fel på stad
Senaste sökningar (sparas i webbläsarens 'localStorage')

Appen använder **OpenWeatherMap API** och är byggd med HTML, CSS och JavaScript

## API-nyckel (måste läggas in lokalt)
Appen använder Open Weather Map API, vilket kräver en egen API-nyckel. 
Av säkerhetsskäl finns ingen nyckel i detta repo.

### Skapa skaffar du en API-nyckel
1. Gå till: https://home.openweathermap.org/api_keys
2. Skapa ett konto (gratis) och hämta din API-nyckel. 
3. Skapa filen js/config.js
4. I projektets mapp, lägg till en fil med följande innehåll: window.WEATHER_API_KEY = "DIN_WEATHER_API_NYCKEL_HÄR";
5. Kör projektet
6. Öppna index.html i webbläsaren eller via en lokal server.
Notera: config.js är exkluderad via .gitignore och ska inte läggas upp i repot.
