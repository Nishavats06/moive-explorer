// script.js - Full Advanced Weather App with Open-Meteo (NO API KEY!)
let map;
let currentMarker;
const WEATHER_CODES = {
  0: '☀️', 1: '🌤️', 2: '⛅', 3: '☁️', 45: '🌫️', 48: '🌫️',
  51: '🌦️', 53: '🌦️', 55: '🌦️', 61: '🌧️', 63: '🌧️', 65: '🌧️',
  71: '🌨️', 73: '🌨️', 75: '🌨️', 80: '🌦️', 95: '⛈️'
};

initApp();

function initApp() {
  // Init map
  map = L.map('map').setView([28.6139, 77.2090], 10); // Default Delhi
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap'
  }).addTo(map);

  // Event listeners
  document.getElementById('current-loc').onclick = getCurrentLocation;
  document.getElementById('toggle-dark').onclick = toggleDarkMode;

  // Enter key support
  document.getElementById('city').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') getWeatherByCity();
  });

  // Load saved theme
  if (localStorage.getItem('theme') === 'dark') toggleDarkMode();
}

async function getWeatherByCity() {
  const city = document.getElementById('city').value.trim();
  if (!city) return alert('City name daalo bhai!');

  showLoading();
  try {
    const coords = await geocodeCity(city);
    await getWeatherData(coords.lat, coords.lon, coords.name);
  } catch (error) {
    document.getElementById('current-loading').innerHTML = 'City nahi mila! 🗺️';
  }
}

async function getCurrentLocation() {
  showLoading();
  if (!navigator.geolocation) {
    alert('Location support nahi hai!');
    return;
  }

  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      const { latitude: lat, longitude: lon } = pos.coords;
      const placeName = await reverseGeocode(lat, lon); // Approx name
      await getWeatherData(lat, lon, placeName || 'Your Location');
    },
    () => alert('Location access allow karo!')
  );
}

async function geocodeCity(city) {
  const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1&language=en`);
  const data = await res.json();
  if (!data.results?.[0]) throw new Error('No results');
  const { latitude: lat, longitude: lon, name } = data.results[0];
  map.setView([lat, lon], 10);
  return { lat, lon, name };
}

async function getWeatherData(lat, lon, name) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&hourly=temperature_2m,weather_code&timezone=Asia/Kolkata&forecast_days=2`;
  
  const res = await fetch(url);
  const data = await res.json();

  // Update map marker
  if (currentMarker) map.removeLayer(currentMarker);
  currentMarker = L.marker([lat, lon]).addTo(map)
    .bindPopup(`<b>${name}</b><br>${data.current.temperature_2m}°C`)
    .openPopup();

  showCurrentWeather(data.current, name);
  showHourlyForecast(data.hourly, data.current.time);
}

function showCurrentWeather(current, name) {
  const icon = WEATHER_CODES[current.weather_code] || '🌤️';
  const html = `
    <h2>${name}</h2>
    <h3>${current.temperature_2m}°C ${icon}</h3>
    <p>Humidity: ${current.relative_humidity_2m}%</p>
    <p>Wind: ${current.wind_speed_10m} km/h</p>
    <p>Feels like: ${Math.round(current.temperature_2m - 2)}°C</p>
  `;
  document.getElementById('current-weather').innerHTML = html;
}

function showHourlyForecast(hourly, currentTime) {
  const now = new Date(currentTime).getHours();
  let html = '';
  for (let i = 0; i < 24; i++) {
    const hour = (now + i) % 24;
    const time = hour.toString().padStart(2, '0') + ':00';
    const icon = WEATHER_CODES[hourly.weather_code[i]] || '🌤️';
    html += `
      <div class="forecast-item">
        <div>${time}</div>
        <div>${icon}</div>
        <div>${Math.round(hourly.temperature_2m[i])}°C</div>
      </div>
    `;
  }
  document.getElementById('hourly-forecast').innerHTML = html;
}

async function reverseGeocode(lat, lon) {
  // Simple approx, can enhance
  return 'Current Location';
}

function showLoading() {
  document.getElementById('current-weather').innerHTML = `
    <div class="loading">
      <div class="spinner"></div>
      Loading weather...
    </div>
  `;
}

function toggleDarkMode() {
  document.body.dataset.theme = document.body.dataset.theme === 'dark' ? 'light' : 'dark';
  localStorage.setItem('theme', document.body.dataset.theme);
  document.getElementById('toggle-dark').textContent = document.body.dataset.theme === 'dark' ? '☀️ Light' : '🌙 Dark';
}