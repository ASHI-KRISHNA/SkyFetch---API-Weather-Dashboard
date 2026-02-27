// ===============================
// OpenWeatherMap Configuration
// ===============================

// Your OpenWeatherMap API Key
// ⚠️ In real projects, NEVER expose API keys in frontend code
const API_KEY = '00e62a9846c6fe6976d4c8f79a075de7';
const API_URL = 'https://api.openweathermap.org/data/2.5/weather';


// ===============================
// Function: Fetch Weather Data
// ===============================

async function getWeather(city) {
    // Show loading UI immediately
    showLoading();

    // Disable search button to prevent multiple requests
    searchBtn.disabled = true;
    searchBtn.textContent = 'Searching...';

    // Build API request URL
    const url = `${API_URL}?q=${city}&appid=${API_KEY}&units=metric`;

    try {
        // Call OpenWeatherMap API
        const response = await axios.get(url);

        // Display weather data on success
        displayWeather(response.data);

    } catch (error) {
        // Handle specific error cases
        if (error.response && error.response.status === 404) {
            showError('City not found. Please check the spelling and try again.');
        } else {
            showError('Something went wrong. Please try again later.');
        }

    } finally {
        // Re-enable search button (runs no matter what)
        searchBtn.disabled = false;
        searchBtn.textContent = 'Search';
    }
}


// ===============================
// Function: Show Error Message
// ===============================

function showError(message) {
    const weatherDisplay = document.getElementById("weather-display");

    // Error UI HTML
    const errorHTML = `
        <div class="error-message">
            <h3>⚠️ Oops!</h3>
            <p>${message}</p>
        </div>
    `;

    // Replace existing content with error message
    weatherDisplay.innerHTML = errorHTML;

    // Focus input so user can retry quickly
    cityInput.focus();
}


// ===============================
// Function: Display Weather Data
// ===============================

function displayWeather(data) {
    // Extract required data from API response
    const cityName = data.name;
    const temperature = Math.round(data.main.temp);
    const description = data.weather[0].description;
    const icon = data.weather[0].icon;

    // Weather icon URL
    const iconUrl = `https://openweathermap.org/img/wn/${icon}@2x.png`;

    // Weather UI HTML
    const weatherHTML = `
        <div class="weather-info">
            <h2 class="city-name">${cityName}</h2>
            <img src="${iconUrl}" alt="${description}" class="weather-icon">
            <div class="temperature">${temperature}°C</div>
            <p class="description">${description}</p>
        </div>
    `;

    // Update UI with weather information
    document.getElementById('weather-display').innerHTML = weatherHTML;
}


// ===============================
// DOM Elements
// ===============================

const searchBtn = document.getElementById("search-btn");
const cityInput = document.getElementById("city-input");


// ===============================
// Search Button Click Handler
// ===============================

searchBtn.addEventListener('click', function () {
    const city = cityInput.value.trim();

    // Validate empty input
    if (!city) {
        showError("Please enter a city name");
        return;
    }

    // Validate minimum city name length
    if (city.length < 2) {
        showError("City name too short");
        return;
    }

    // Proceed with weather search
    getWeather(city);
});


// ===============================
// Enter Key Support for Input
// ===============================

cityInput.addEventListener('keypress', function (event) {
    if (event.key === 'Enter') {
        const city = cityInput.value.trim();

        if (city !== "") {
            getWeather(city);
        }
    }
});


// ===============================
// Function: Show Loading State
// ===============================

function showLoading() {
    // Loading UI HTML
    const loadingHTML = `
        <div class="loading-container">
            <div class="spinner"></div>
            <p>Loading weather...</p>
        </div>
    `;

    // Replace weather display with loading UI
    const weather_display = document.getElementById("weather-display");
    weather_display.innerHTML = loadingHTML;
}


// ===============================
// Initial Welcome Message
// ===============================

document.getElementById('weather-display').innerHTML = `
    <div class="welcome-message">
        <p>Welcome to Weather Aboard 🌤️</p>
        <p>Example: Enter a city name to get started!</p>
    </div>
`;