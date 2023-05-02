function getWeather() {
  const city = document.getElementById('city').value;
  const api_key = '3c4f432b9f5093530910142360f29711';
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${api_key}&units=metric`;

  fetch(url)
    .then(response => response.json())
    .then(data => {
      const location = document.getElementById('location');
      location.innerHTML = `${data.name}, ${data.sys.country}`;

      const temperature = document.getElementById('temperature');
      temperature.innerHTML = `Temperature: ${data.main.temp} &#8451;`;

      const description = document.getElementById('description');
      description.innerHTML = `Description: ${data.weather[0].description}`;

      const humidity = document.getElementById('humidity');
      humidity.innerHTML = `Humidity: ${data.main.humidity} %`;

      const pressure = document.getElementById('pressure');
      pressure.innerHTML = `Pressure: ${data.main.pressure} hPa`;

      const wind = document.getElementById('wind');
      wind.innerHTML = `Wind: ${data.wind.speed} m/s`;

      const sunrise = document.getElementById('sunrise');
      sunrise.innerHTML = `Sunrise: ${new Date(data.sys.sunrise * 1000).toLocaleTimeString()}`;

      const sunset = document.getElementById('sunset');
      sunset.innerHTML = `Sunset: ${new Date(data.sys.sunset * 1000).toLocaleTimeString()}`;
    })
    .catch(error => {
      const weather = document.getElementById('weather');
      weather.innerHTML = `Error: ${error}`;
    });
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('get-weather-button').addEventListener('click', getWeather);
});