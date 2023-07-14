// API key
const apiKey = 'f35b49c8476fafd10de20e1503685381';

// DOM elements
const cityInput = document.getElementById('city-input');
const searchForm = document.getElementById('search-form');
const cityList = document.getElementById('city-list');
const cityName = document.getElementById('city-name');
const dateElement = document.getElementById('date');
const temperatureElement = document.getElementById('temperature');
const humidityElement = document.getElementById('humidity');
const windSpeedElement = document.getElementById('wind-speed');
const weatherIcon = document.getElementById('weather-icon');
const forecastContainer = document.getElementById('forecast-container');

// Event listener for form submission
searchForm.addEventListener('submit', function (event) {
    event.preventDefault();
    const city = cityInput.value.trim();
    if (city) {
        getWeather(city);
        cityInput.value = '';
    }
});

// Event listener for search history list
cityList.addEventListener('click', function (event) {
    if (event.target.tagName === 'LI') {
        const city = event.target.textContent;
        getWeather(city);
    }
});

// Fetch weather data from the API
function getWeather(city) {
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`;

    fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('City not found. Please try again.');
            }
            return response.json();
        })
        .then(data => {
            // Display current weather
            cityName.textContent = `${data.name}, ${data.sys.country}`;
            dateElement.textContent = formatDate(data.dt);
            temperatureElement.textContent = `Temperature: ${formatTemperature(data.main.temp)}°C`;
            humidityElement.textContent = `Humidity: ${data.main.humidity}%`;
            windSpeedElement.textContent = `Wind Speed: ${formatSpeed(data.wind.speed)} m/s`;
            weatherIcon.src = getWeatherIconUrl(data.weather[0].icon);

            // Fetch 5-day forecast data
            const { coord } = data;
            const forecastApiUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${coord.lat}&lon=${coord.lon}&appid=${apiKey}`;
            return fetch(forecastApiUrl);
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Error fetching forecast data.');
            }
            return response.json();
        })
        .then(data => {
            // Display forecast
            forecastContainer.innerHTML = '';
            const forecastList = data.list;
            for (let i = 0; i < forecastList.length; i += 8) {
                const forecast = forecastList[i];
                const forecastItem = document.createElement('div');
                forecastItem.classList.add('forecast-item');
                forecastItem.innerHTML = `
          <h3>${formatDate(forecast.dt)}</h3>
          <img src="${getWeatherIconUrl(forecast.weather[0].icon)}" alt="Weather Icon">
          <p>Temperature: ${formatTemperature(forecast.main.temp)}°C</p>
          <p>Humidity: ${forecast.main.humidity}%</p>
          <p>Wind Speed: ${formatSpeed(forecast.wind.speed)} m/s</p>
        `;
                forecastContainer.appendChild(forecastItem);
            }

            // Update search history
            saveCityToLocalStorage(city);
            displaySearchHistory();
        })
        .catch(error => {
            console.error('Error fetching weather data:', error.message);
            alert(error.message);
        });
}

// Format date in "Month Day, Year" format
function formatDate(timestamp) {
    const date = new Date(timestamp * 1000);
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    return date.toLocaleDateString(undefined, options);
}

// Format temperature in Celsius
function formatTemperature(temp) {
    return Math.round(temp - 273.15);
}

// Format wind speed in meters per second
function formatSpeed(speed) {
    return Math.round(speed);
}

// Get weather icon URL
function getWeatherIconUrl(icon) {
    return `https://openweathermap.org/img/w/${icon}.png`;
}

// Save city to local storage
function saveCityToLocalStorage(city) {
    let cities = localStorage.getItem('cities') || '[]';
    cities = JSON.parse(cities);
    if (!cities.includes(city)) {
        cities.push(city);
        localStorage.setItem('cities', JSON.stringify(cities));
    }
}

// Display search history
function displaySearchHistory() {
    cityList.innerHTML = '';
    let cities = localStorage.getItem('cities') || '[]';
    cities = JSON.parse(cities);
    for (let i = 0; i < cities.length; i++) {
        const cityItem = document.createElement('li');
        cityItem.textContent = cities[i];
        cityList.appendChild(cityItem);
    }
}

// Initial display of search history
displaySearchHistory();
