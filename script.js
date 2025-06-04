const apiKey = "49b8d3be1eee5fa6d71bd21ae26a68f0";

function saveHistory(city) {
  let history = JSON.parse(localStorage.getItem("weatherHistory")) || [];
  if (!history.includes(city)) {
    history.push(city);
    localStorage.setItem("weatherHistory", JSON.stringify(history));
  }
  displayHistory();
}

function displayHistory() {
  const history = JSON.parse(localStorage.getItem("weatherHistory")) || [];
  const historyDiv = document.getElementById("history");
  historyDiv.innerHTML = "";
  history.forEach(city => {
    const btn = document.createElement("button");
    btn.textContent = city;
    btn.onclick = () => getWeather(city);
    historyDiv.appendChild(btn);
  });
}

async function getWeather(cityInput) {
  const city = cityInput || document.getElementById("cityInput").value.trim();
  if (!city) return alert("Please enter a city name.");

  saveHistory(city);

  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.cod !== 200) {
      document.getElementById("weatherResult").innerHTML = `<p>City not found.</p>`;
      return;
    }

    const iconUrl = `http://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;

    const result = `
      <p><strong>City:</strong> ${data.name}</p>
      <p><strong>Temperature:</strong> ${data.main.temp}°C</p>
      <p><strong>Feels Like:</strong> ${data.main.feels_like}°C</p>
      <p><strong>Humidity:</strong> ${data.main.humidity}%</p>
      <p><strong>Wind:</strong> ${data.wind.speed} m/s</p>
      <p><strong>Weather:</strong> ${data.weather[0].description}</p>
      <img src="${iconUrl}" alt="Weather Icon" />
    `;

    document.getElementById("weatherResult").innerHTML = result;

    getForecast(city);
  } catch (err) {
    console.error(err);
    document.getElementById("weatherResult").innerHTML = `<p>Error fetching data.</p>`;
  }
}

async function getForecast(city) {
  const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    let forecastHtml = "<h3>5-Day Forecast</h3>";

    for (let i = 0; i < data.list.length; i += 8) {
      const item = data.list[i];
      const date = new Date(item.dt_txt).toLocaleDateString();
      const icon = item.weather[0].icon;
      const temp = item.main.temp;
      const desc = item.weather[0].description;

      forecastHtml += `
        <div>
          <p><strong>${date}</strong></p>
          <img src="http://openweathermap.org/img/wn/${icon}@2x.png" alt="${desc}" />
          <p>${temp}°C, ${desc}</p>
        </div>
      `;
    }

    document.getElementById("forecast").innerHTML = forecastHtml;
  } catch (err) {
    console.error(err);
    document.getElementById("forecast").innerHTML = `<p>Could not load forecast.</p>`;
  }
}

function getLocationWeather() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(async position => {
      const { latitude, longitude } = position.coords;
      const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`;

      try {
        const response = await fetch(url);
        const data = await response.json();
        document.getElementById("cityInput").value = data.name;
        getWeather(data.name);
      } catch (err) {
        console.error(err);
        document.getElementById("weatherResult").innerHTML = `<p>Location error.</p>`;
      }
    }, () => {
      alert("Geolocation permission denied.");
    });
  } else {
    alert("Geolocation is not supported by your browser.");
  }
}

function toggleTheme() {
  document.body.classList.toggle("dark");
}

displayHistory(); // Load history on page load
