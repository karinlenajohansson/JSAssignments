# JSAssignments

## API-nyckel (måste skapas lokalt)
Appen använder Open Weather Map API, vilket kräver en egen API-nyckel. 
Av säkerhetsskäl finns ingen nyckel i detta repo.

### Skapa en API-nyckel
1. Gå till: https://home.openweathermap.org/api_keys
2. Registrera dig och hämta din gratis nyckel.
3. Skapa filen js/config.js
4. I projektets mapp, lägg till en fil med följande innehåll: window.WEATHER_API_KEY = "DIN_WEATHER_API_NYCKEL_HÄR";
5. Kör projektet
6. Öppna index.html i webbläsaren eller via en lokal server.
Notera: config.js är exkluderad via .gitignore och ska inte läggas upp i repot.
