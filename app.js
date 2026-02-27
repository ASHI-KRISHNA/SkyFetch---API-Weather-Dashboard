function WeatherApp(apiKey) {
    this.apiKey = apiKey;
    this.apiUrl = 'https://api.openweathermap.org/data/2.5/weather';
    this.forecastUrl = 'https://api.openweathermap.org/data/2.5/forecast';

    this.searchBtn = document.getElementById('search-btn');
    this.cityInput = document.getElementById('city-input');
    this.weatherDisplay = document.getElementById('weather-display');

    this.recentSearchesSection = document.getElementById('recent-searches-section');
    this.recentSearchesContainer = document.getElementById('recent-searches-container');

    this.recentSearches = [];
    this.maxRecentSearches = 5;

    this.init();
}

WeatherApp.prototype.init = function () {
    this.searchBtn.addEventListener('click', this.handleSearch.bind(this));

    this.cityInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') this.handleSearch();
    });

    const clearBtn = document.getElementById('clear-history-btn');
    if (clearBtn) {
        clearBtn.addEventListener('click', this.clearHistory.bind(this));
    }

    this.loadRecentSearches();
    this.loadLastCity();
};

WeatherApp.prototype.showWelcome = function () {
    this.weatherDisplay.innerHTML = `
        <div class="welcome-message">
            <div class="welcome-icon">🌤️</div>
            <h2>Welcome to WeatherApp</h2>
            <p>Search for a city to get started.</p>
            <p class="welcome-examples">
                Try: <span>London</span>, <span>Paris</span>, <span>Tokyo</span>
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
    this.searchBtn.disabled = true;
    this.searchBtn.textContent = 'Searching...';

    const currentUrl = `${this.apiUrl}?q=${city}&appid=${this.apiKey}&units=metric`;

    try {
        const [currentWeather, forecastData] = await Promise.all([
            axios.get(currentUrl),
            this.getForecast(city)
        ]);

        this.displayWeather(currentWeather.data);
        this.displayForecast(forecastData);

        this.saveRecentSearch(city);
        localStorage.setItem('lastCity', city);
    } catch (error) {
        if (error.response && error.response.status === 404) {
            this.showError('City not found. Please check spelling and try again.');
        } else {
            this.showError('Something went wrong. Please try again later.');
        }
    } finally {
        this.searchBtn.disabled = false;
        this.searchBtn.textContent = 'Search';
    }
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
    const temp = Math.round(data.main.temp);
    const { description, icon } = data.weather[0];

    this.weatherDisplay.innerHTML = `
        <div class="weather-info">
            <h2 class="city-name">${data.name}</h2>
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
    const url = `${this.forecastUrl}?q=${city}&appid=${this.apiKey}&units=metric`;
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

WeatherApp.prototype.loadRecentSearches = function () {
    const saved = localStorage.getItem('recentSearches');
    if (saved) this.recentSearches = JSON.parse(saved);
    this.displayRecentSearches();
};

WeatherApp.prototype.saveRecentSearch = function (city) {
    const cityName = city
        .toLowerCase()
        .split(' ')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');

    const index = this.recentSearches.indexOf(cityName);
    if (index > -1) this.recentSearches.splice(index, 1);

    this.recentSearches.unshift(cityName);
    if (this.recentSearches.length > this.maxRecentSearches) {
        this.recentSearches.pop();
    }

    localStorage.setItem('recentSearches', JSON.stringify(this.recentSearches));
    this.displayRecentSearches();
};

WeatherApp.prototype.displayRecentSearches = function () {
    this.recentSearchesContainer.innerHTML = '';

    if (this.recentSearches.length === 0) {
        this.recentSearchesSection.style.display = 'none';
        return;
    }

    this.recentSearchesSection.style.display = 'block';

    this.recentSearches.forEach(city => {
        const btn = document.createElement('button');
        btn.className = 'recent-search-btn';
        btn.textContent = city;
        btn.addEventListener('click', () => this.getWeather(city));
        this.recentSearchesContainer.appendChild(btn);
    });
};

WeatherApp.prototype.loadLastCity = function () {
    const lastCity = localStorage.getItem('lastCity');
    lastCity ? this.getWeather(lastCity) : this.showWelcome();
};

WeatherApp.prototype.clearHistory = function () {
    if (confirm('Clear all recent searches?')) {
        this.recentSearches = [];
        localStorage.removeItem('recentSearches');
        this.displayRecentSearches();
    }
};

const app = new WeatherApp('00e62a9846c6fe6976d4c8f79a075de7');