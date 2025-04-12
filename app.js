function getWeather(city) {
  const api_key = '3c4f432b9f5093530910142360f29711';
  const unit = document.getElementById('unit-toggle').value; // Get selected unit
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${api_key}&units=${unit}`;

  fetch(url)
    .then(response => {
      if (!response.ok) throw new Error('City not found');
      return response.json();
    })
    .then(data => {
      // Ensure elements exist before updating them
      const errorMessageElement = document.getElementById('error-message');
      const locationElement = document.getElementById('location');
      const temperatureElement = document.getElementById('temperature');
      const descriptionElement = document.getElementById('description');
      const humidityElement = document.getElementById('humidity');
      const pressureElement = document.getElementById('pressure');
      const windElement = document.getElementById('wind');
      const sunriseElement = document.getElementById('sunrise');
      const sunsetElement = document.getElementById('sunset');
      
      if (errorMessageElement) errorMessageElement.innerText = '';
      if (locationElement) locationElement.innerHTML = `${data.name}, ${data.sys.country}`;
      if (temperatureElement) temperatureElement.innerHTML = `Temperature: ${data.main.temp} &#176;${unit === 'metric' ? 'C' : 'F'}`;
      if (descriptionElement) descriptionElement.innerHTML = `Description: ${data.weather[0].description}`;
      if (humidityElement) humidityElement.innerHTML = `Humidity: ${data.main.humidity} %`;
      if (pressureElement) pressureElement.innerHTML = `Pressure: ${data.main.pressure} hPa`;

      // Wind speed
      if (windElement) windElement.innerHTML = `Wind: ${data.wind.speed} ${unit === 'metric' ? 'm/s' : 'mph'}`;

      // Sunrise and Sunset (convert from UTC to local time)
      if (sunriseElement) {
        const sunriseTime = new Date(data.sys.sunrise * 1000).toLocaleTimeString();
        sunriseElement.innerHTML = `Sunrise: ${sunriseTime}`;
      }

      if (sunsetElement) {
        const sunsetTime = new Date(data.sys.sunset * 1000).toLocaleTimeString();
        sunsetElement.innerHTML = `Sunset: ${sunsetTime}`;
      }

      // Fetch the lat and lon from the city data
      const { lat, lon } = data.coord;

      // Update background based on weather
      updateBackground(data.weather[0].main);

      // Fetch the 5-day forecast using lat/lon
      getFiveDayForecast(lat, lon, unit);

      updateRecentCities(data.name);
    })
    .catch(error => {
      const errorMessageElement = document.getElementById('error-message');
      if (errorMessageElement) errorMessageElement.innerText = error.message;
    });
}

function updateBackground(weatherCondition) {
  const body = document.body;
  const overlay = document.createElement('div');
  overlay.classList.add('background-overlay');
  
  // Remove previous overlay if it exists
  const previousOverlay = document.querySelector('.background-overlay');
  if (previousOverlay) {
    previousOverlay.remove();
  }

  switch (weatherCondition.toLowerCase()) {
    case 'clear':
    case 'clear sky':
      body.style.background = "url('./graphics/clearskies.gif') no-repeat center center fixed";
      break;
    case 'clouds':
      body.style.background = "url('./graphics/cloudskies.gif') no-repeat center center fixed";
      break;
    case 'rain':
      body.style.background = "url('./graphics/rain.gif') no-repeat center center fixed";
      break;
    case 'snow':
      body.style.background = "url('./graphics/snowskies.gif') no-repeat center center fixed";
      break;
    case 'thunderstorm':
      body.style.background = "url('./graphics/stormyskies.gif') no-repeat center center fixed";
      break;
    case 'mist':
      body.style.background = "url('./graphics/mistyskies.gif') no-repeat center center fixed";
      break;
  }

  // Add the overlay for dark mode
  if (body.classList.contains('dark-mode')) {
    body.appendChild(overlay);
  }
  
  body.style.backgroundSize = 'cover'; // Ensure the background image covers the entire page
}

function updateRecentCities(city) {
  let recentCities = JSON.parse(localStorage.getItem('recentCities')) || [];
  if (!recentCities.includes(city)) {
    recentCities.unshift(city);
    if (recentCities.length > 5) recentCities.pop();
    localStorage.setItem('recentCities', JSON.stringify(recentCities));
  }
  renderRecentCities();
}

function renderRecentCities() {
  const container = document.getElementById('recent-cities');
  const recentCities = JSON.parse(localStorage.getItem('recentCities')) || [];
  container.innerHTML = '<h3>Recent Cities</h3>';
  recentCities.forEach(city => {
    const button = document.createElement('button');
    button.innerText = city;
    button.classList.add('recent-button');
    button.onclick = () => getWeather(city);
    container.appendChild(button);
  });
}

function getWeatherByGeo() {
  if (!navigator.geolocation) {
    alert('Geolocation not supported by your browser');
    return;
  }
  navigator.geolocation.getCurrentPosition(position => {
    const { latitude, longitude } = position.coords;
    const api_key = '3c4f432b9f5093530910142360f29711';
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${api_key}&units=metric`;
    fetch(url)
      .then(response => response.json())
      .then(data => getWeather(data.name));
  }, (error) => {
    alert('Unable to retrieve your location: ' + error.message);
  });  
}

function getFiveDayForecast(lat, lon, unit) {
  const api_key = '3c4f432b9f5093530910142360f29711';
  const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${api_key}&units=${unit}`;
  
  fetch(url)
    .then(response => response.json())
    .then(data => {
      let forecastHTML = '<h3>5-Day Forecast</h3>';
      
      // Group the forecasts by day
      const groupedForecast = groupForecastByDay(data.list);

      Object.keys(groupedForecast).forEach(day => {
        const forecast = groupedForecast[day][0]; // Take the first forecast of each day (3-hour interval)
        const date = new Date(forecast.dt * 1000);
        const dayOfWeek = date.toLocaleString('en-us', { weekday: 'short' });
        const temperature = forecast.main.temp;
        const description = forecast.weather[0].description;
        const icon = getWeatherIcon(forecast.weather[0].main);

        forecastHTML += `
          <div class="forecast-day">
            <div class="day">${dayOfWeek}</div>
            <div class="icon">${icon}</div>
            <div class="temperature">${temperature} &#176;${unit === 'metric' ? 'C' : 'F'}</div>
            <div class="description">${description}</div>
          </div>
        `;
      });

      document.getElementById('daily-forecast').innerHTML = forecastHTML; // Update element ID
    })
    .catch(error => {
      document.getElementById('daily-forecast').innerHTML = 'Error fetching 5-day forecast.'; // Update element ID
    });
}

// Group forecasts by day
function groupForecastByDay(forecasts) {
  const grouped = {};
  forecasts.forEach(forecast => {
    const date = new Date(forecast.dt * 1000);
    const day = date.toLocaleDateString();
    if (!grouped[day]) {
      grouped[day] = [];
    }
    grouped[day].push(forecast);
  });
  return grouped;
}

// Get weather icon based on condition
function getWeatherIcon(condition) {
  switch (condition.toLowerCase()) {
    case 'clear':
      return '☀️'; // Sunny
    case 'clouds':
      return '☁️'; // Cloudy
    case 'rain':
      return '🌧️'; // Rainy
    case 'snow':
      return '❄️'; // Snowy
    case 'thunderstorm':
      return '⛈️'; // Thunderstorm
    case 'drizzle':
      return '🌦️'; // Drizzle
    case 'mist':
      return '🌫️'; // Mist
    default:
      return '🌤️'; // Default icon
  }
}

document.getElementById('get-weather-button').addEventListener('click', () => {
  const city = document.getElementById('city').value;
  if (city) getWeather(city);
});

document.getElementById('geo-button').addEventListener('click', getWeatherByGeo);

document.getElementById('unit-toggle').addEventListener('change', () => {
  const city = document.getElementById('city').value;
  if (city) {
    getWeather(city); // Fetch weather for the city with the selected units
  }
});

// Dark mode toggle button
const darkModeToggle = document.getElementById('dark-mode-toggle');

// Check if dark mode is already saved in localStorage
if (localStorage.getItem('dark-mode') === 'enabled') {
  document.body.classList.add('dark-mode');
}

// Add event listener to the dark mode toggle button
darkModeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
  
  // Save dark mode preference to localStorage
  if (document.body.classList.contains('dark-mode')) {
    localStorage.setItem('dark-mode', 'enabled');
    darkModeToggle.innerText = '🌙';
  } else {
    localStorage.setItem('dark-mode', 'disabled');
    darkModeToggle.innerText = '🌞';
  }
});
