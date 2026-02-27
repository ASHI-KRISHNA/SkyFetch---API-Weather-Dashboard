function WeatherApp(apiKey) {
    this.apiKey = apiKey;
    this.apiUrl = 'https://api.openweathermap.org/data/2.5/weather';
    this.forecastUrl = 'https://api.openweathermap.org/data/2.5/forecast';

    this.searchBtn = document.getElementById('search-btn');
    this.cityInput = document.getElementById('city-input');
    this.weatherDisplay = document.getElementById('weather-display');

    this.init();
}

WeatherApp.prototype.init = function () {
    this.searchBtn.addEventListener('click', this.handleSearch.bind(this));

    this.cityInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') this.handleSearch();
    });

    this.showWelcome();
};

WeatherApp.prototype.showWelcome = function () {
    this.weatherDisplay.innerHTML = `
        <div class="welcome-message">
            <div class="welcome-icon">🌤️</div>
            <h2>Welcome to WeatherApp</h2>
            <p>
                Enter a city name above to get the latest weather updates.
                Temperature, conditions, and vibes — all in one place.
            </p>
        </div>
    `;
};

WeatherApp.prototype.handleSearch = function () {
    const city = this.cityInput.value.trim();

    if (!city || city.length < 2) {
        this.showError('City not found. Please check the spelling and try again.');
        return;
    }

    this.getWeather(city);
    this.cityInput.value = '';
};

WeatherApp.prototype.getWeather = async function (city) {
    this.showLoading();
    this.toggleSearch(false);

    const currentWeatherUrl =
        `${this.apiUrl}?q=${city}&appid=${this.apiKey}&units=metric`;

    try {
        const [currentWeather, forecastData] = await Promise.all([
            axios.get(currentWeatherUrl),
            this.getForecast(city)
        ]);

        this.displayWeather(currentWeather.data);
        this.displayForecast(forecastData);

    } catch (error) {
        console.error(error);
        this.showError(
            error.response?.status === 404
                ? 'City not found. Please check spelling.'
                : 'Something went wrong. Please try again.'
        );
    } finally {
        this.toggleSearch(true);
    }
};

WeatherApp.prototype.toggleSearch = function (enabled) {
    this.searchBtn.disabled = !enabled;
    this.searchBtn.textContent = enabled ? 'Search' : 'Searching...';
};

WeatherApp.prototype.showError = function (message) {
    this.weatherDisplay.innerHTML = `
        <div class="error-message">
            <h3>⚠️ Oops!</h3>
            <p>${message}</p>
        </div>
    `;
};

WeatherApp.prototype.showLoading = function () {
    this.weatherDisplay.innerHTML = `
        <div class="loading-container">
            <div class="spinner"></div>
            <p>Loading weather...</p>
        </div>
    `;
};

WeatherApp.prototype.displayWeather = function (data) {
    const { name } = data;
    const temp = Math.round(data.main.temp);
    const { description, icon } = data.weather[0];

    this.weatherDisplay.innerHTML = `
        <div class="weather-info">
            <h2 class="city-name">${name}</h2>
            <img class="weather-icon"
                 src="https://openweathermap.org/img/wn/${icon}@2x.png"
                 alt="${description}" />
            <div class="temperature">${temp}°C</div>
            <p class="description">${description}</p>
        </div>
    `;

    this.cityInput.focus();
};

WeatherApp.prototype.getForecast = async function (city) {
    const url =
        `${this.forecastUrl}?q=${city}&appid=${this.apiKey}&units=metric`;

    const response = await axios.get(url);
    return response.data;
};

WeatherApp.prototype.processForecastData = function (data) {
    return data.list
        .filter(item => item.dt_txt.includes('12:00:00'))
        .slice(0, 5);
};

WeatherApp.prototype.displayForecast = function (data) {
    const cards = this.processForecastData(data)
        .map(day => {
            const date = new Date(day.dt * 1000);
            const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
            const temp = Math.round(day.main.temp);
            const { description, icon } = day.weather[0];

            return `
                <div class="forecast-card">
                    <div class="forecast-day">${dayName}</div>
                    <img class="forecast-icon"
                         src="https://openweathermap.org/img/wn/${icon}@2x.png"
                         alt="${description}" />
                    <div class="forecast-temp">${temp}°C</div>
                    <div class="forecast-desc">${description}</div>
                </div>
            `;
        })
        .join('');

    this.weatherDisplay.innerHTML += `
        <div class="forecast-section">
            <h3 class="forecast-title">5-Day Forecast</h3>
            <div class="forecast-container">${cards}</div>
        </div>
    `;
};

const app = new WeatherApp('00e62a9846c6fe6976d4c8f79a075de7');