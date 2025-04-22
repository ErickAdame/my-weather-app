const weatherbitApiKey = "85a65933d3894f0d9c7194ffa8098565";
const latitude = 40.5870;
const longitude = -73.7376;

async function fetchWeatherData() {
  const currentUrl = `https://api.weatherbit.io/v2.0/current?lat=${latitude}&lon=${longitude}&units=I&key=${weatherbitApiKey}`;
  const dailyUrl = `https://api.weatherbit.io/v2.0/forecast/daily?lat=${latitude}&lon=${longitude}&units=I&key=${weatherbitApiKey}`;
  const hourlyUrl = `https://api.weatherbit.io/v2.0/forecast/hourly?lat=${latitude}&lon=${longitude}&units=I&hours=48&key=${weatherbitApiKey}`;
  console.log(dailyUrl);
  
  try {
    const [currentRes, dailyRes] = await Promise.all([
      fetch(currentUrl),
      fetch(dailyUrl)
    ]);

    const currentData = await currentRes.json();
    const dailyData = await dailyRes.json();

    if (currentData?.data?.length > 0 && dailyData?.data?.length > 0) {
      const current = currentData.data[0];
      const today = dailyData.data[0];

      updateWeatherDisplay(current, today);
      displayTenDayForecast(dailyData.data.slice(0, 10));
    } else {
      console.error("Incomplete weather data received.");
    }
  } catch (error) {
    console.error("Error fetching weather data:", error);
  }
}

function updateWeatherDisplay(current, today) {
  document.getElementById("weatherDetails").style.display = "flex";

  const isDay = current.weather.icon.endsWith("d");

  const description = current.weather.description;
  const adjustedDescription = adjustWeatherDescription(description);

  // Choose icon
  let iconFilename;
  if (adjustedDescription.toLowerCase() === "light rain") {
    iconFilename = "Rain.png";
  } else {
    iconFilename = getIconFilename(adjustedDescription.toLowerCase(), isDay);
  }

  const iconElement = document.getElementById("weatherIcon");
  iconElement.src = `icons/${isDay ? "day" : "night"}/${iconFilename}`;
  iconElement.alt = description;

  document.getElementById("temperature").textContent = `${Math.round(current.temp)}°F`;
  document.getElementById("feels_like").textContent = `Feels Like: ${Math.round(current.app_temp)}°F`;
  document.getElementById("maxTemp").textContent = `Hi: ${Math.round(today.max_temp)}°F`;
  document.getElementById("minTemp").textContent = `Lo: ${Math.round(today.min_temp)}°F`;
  document.getElementById("weatherDescription").textContent = adjustedDescription;

  // Add wind info
  const windDir = current.wind_cdir || "";
  const windSpeed = Math.round(current.wind_spd);
  const windGust = current.wind_gust_spd ? Math.round(current.wind_gust_spd) : null;

  let windText = `Wind: ${windDir} ${windSpeed} MPH`;
  if (windGust) {
    windText += ` G${windGust}`;
  }

  document.getElementById("windInfo").textContent = windText;

  updateContainerBackground(description, isDay);
}


function capitalizeDescription(description) {
  return description.charAt(0).toUpperCase() + description.slice(1);
}

function adjustWeatherDescription(desc) {
  return capitalizeDescription(desc.toLowerCase());
}

function getIconFilename(weatherDescription, isDaytime) {
  const mapping = {
    "sky is clear": isDaytime ? "Sun.png" : "Moon_Stars.png",
    "windy": "Wind.png",
    "fog": "Fog.png",
    "moderate rain": "Rain.png",
    "mist": "Rain.png",
    "light rain": isDaytime ? "Rain_Sun.png" : "Rain.png",
    "overcast clouds": isDaytime ? "Cloud.png" : "Night_Clouds.png",
    "cloudy": isDaytime ? "Cloud.png" : "Night_Clouds.png",
    "scattered clouds": isDaytime ? "Sun_Clouds.png" : "Night_Clouds.png",
    "broken clouds": isDaytime ? "Sun_Clouds.png" : "Night_Clouds.png",
    "few clouds": isDaytime ? "Sun.png" : "Moon_Stars.png",
    "heavy intensity rain": "Rain.png",
    "clear sky": isDaytime ? "Sun.png" : "Moon_Stars.png",
    "partly cloudy": isDaytime ? "Sun_Clouds.png" : "Night_Clouds.png",
    "sunny": isDaytime ? "Sun.png" : "Moon_Stars.png",
    "patchy rain possible": "Rain.png",
    "heavy rain": "Rain.png",
    "scattered thunderstorms": isDaytime ? "Thunderstorm_Sun.png" : "Thunderstorm2.png",
    "thunderstorm with heavy rain": "Thunderstorm_Sun.png",
    "drizzle": "Rain.png",
    "light shower rain": "Rain.png",
    "mix snow/rain": "Snow_Rain.png",
    "light snow": "Snowfall_IV.png",
    "snow": isDaytime ? "Snowfall_III.png" : "Snowfall_III.png",
    "sleet": "Ice3.png",
    "flurries": isDaytime ? "flurries.png" : "Snow_III.png",
    "freezing rain": "Ice3.png",
    "thunderstorms": "Thunderstorm2.png",
    "thunderstorm with rain": "Thunderstorm_Sun.png",
    "thunderstorm": "Thunderstorm2.png",
    "light intensity drizzle": "Rain.png",
    "light rain and snow": "Snow_Rain.png",
    "heavy snow": "Snowfall_III.png",
    "haze": isDaytime ? "SunHaze.png" : "Night_Clouds.png",
    "smoke": "Smoke.png"
  };
  return mapping[weatherDescription] || "Unknown.png";
}

fetchWeatherData();

async function fetchHourlyForecast() {
  const hourlyUrl = `https://api.weatherbit.io/v2.0/forecast/hourly?lat=${latitude}&lon=${longitude}&units=I&hours=48&key=${weatherbitApiKey}`;

  try {
    const res = await fetch(hourlyUrl);
    const data = await res.json();

    if (data?.data?.length > 0) {
      displayHourlyForecast(data.data);
    } else {
      console.error("No hourly forecast data received.");
    }
  } catch (error) {
    console.error("Error fetching hourly forecast:", error);
  }
}

function displayHourlyForecast(hourlyData) {
  const container = document.getElementById("hourlyScrollContainer");
  container.innerHTML = "";
  container.style.display = "flex";

  const labels = [];
  const precipValues = [];
  const windSpeeds = [];
  const windGusts = [];

  hourlyData.slice(0, 24).forEach((hour, index, array) => {
    const hourBlock = document.createElement("div");
    hourBlock.className = "hour-block";

    const isDay = hour.weather.icon.endsWith("d");
    const cleanDesc = adjustWeatherDescription(hour.weather.description);
    const icon = getIconFilename(cleanDesc.toLowerCase(), isDay);

    const date = new Date(hour.timestamp_local);
    const hourText = date.toLocaleTimeString("en-US", { hour: 'numeric', hour12: true });

    const rainChance = hour.pop ? Math.round(hour.pop) : 0;
    const windSpeed = Math.round(hour.wind_spd);
    const windGust = hour.wind_gust && hour.wind_gust > hour.wind_spd ? Math.round(hour.wind_gust) : null;

    // Calculate average wind speed for this hour and next two
    const nextHours = array.slice(index, index + 3);
    const avgWindSpeed = nextHours.reduce((sum, h) => sum + h.wind_spd, 0) / nextHours.length;

    let umbrellaTopText = "Umbrellas";
    let umbrellaBottomText = "";
    let umbrellaIcon = "";

    // Update umbrella logic based on wind gusts and average wind speed
    if (avgWindSpeed > 15 || (windGust && windGust > 18)) {
      umbrellaBottomText = "Down";
      umbrellaIcon = "umbrella-down.png";
    } else if (avgWindSpeed >= 12 || (windGust && windGust >= 14 && windGust <= 18)) {
      umbrellaBottomText = "With Care";
      umbrellaIcon = "umbrella-caution.png";
    } else {
      umbrellaBottomText = "Up";
      umbrellaIcon = "umbrella-up.png";
    }

    // Create the structure for the hour block
    hourBlock.innerHTML = `
      <div class="hour-content">
        <div class="hour-text">${hourText}</div>
        <img src="icons/${isDay ? "day" : "night"}/${icon}" alt="${hour.weather.description}" class="hour-icon">
        <div class="hour-wind">${windSpeed} mph${windGust ? `<div class="gust-text">G${windGust}</div>` : ""}</div>
        <div class="hour-temp">${Math.round(hour.temp)}°</div>
        <div class="rain-info">
          <img src="icons/day/drop.png" alt="Rain Drop" class="rain-icon">
          <span class="rain-amount">${rainChance}%</span>
        </div>
      </div>

      <!-- Separate umbrella block with a white background -->
<div class="umbrella-content">
  <div class="umbrella-box">
    <div class="umbrella-inner">
      <img src="icons/${umbrellaIcon}" alt="${umbrellaBottomText}" class="umbrella-icon">
      <div class="umbrella-text">
        <div>${umbrellaTopText}</div>
        <div>${umbrellaBottomText}</div>
      </div>
    </div>
  </div>
</div>

    `;

    container.appendChild(hourBlock);

    labels.push(hourText);
    precipValues.push(hour.precip);
    windSpeeds.push(hour.wind_spd);
    windGusts.push(windGust || null);
  });

  drawPrecipChart(labels, precipValues);
  drawWindChart(labels.slice(0, 11), windSpeeds.slice(0, 11), windGusts.slice(0, 11));
}




fetchHourlyForecast();

function drawPrecipChart(labels, values) {
  const maxPrecip = Math.max(...values);
  const yAxisMax = maxPrecip * 3 || 1; // fallback to 1 if all values are 0

  const canvas = document.getElementById("precip-hourly-chart");
  const ctx = canvas.getContext("2d");

  // Clear previous chart and canvas
  if (window.precipChart) {
    window.precipChart.destroy();
  }
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  window.precipChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [{
        label: "Precipitation (inches)",
        data: values,
        backgroundColor: "rgba(34, 139, 34, 0.6)",
        borderColor: "rgba(34, 139, 34, 1)",
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: { enabled: false },
        datalabels: {
          color: "black",
          anchor: "end",
          align: "end",
          offset: -1,
          font: {
            weight: 'bold',
            size: 8
          },
          formatter: function(value) {
            if (value > 0) {
              const trimmed = value.toFixed(2).replace(/^0+/, "");
              return trimmed;
            }
            return "";
          }
        }
      },
      scales: {
        x: {
          title: { display: false },
          ticks: { maxRotation: 90, minRotation: 90 }
        },
        y: {
          display: false,
          suggestedMin: 0,
          suggestedMax: yAxisMax
        }
      }
    },
    plugins: [ChartDataLabels]
  });
}


function drawWindChart(labels, windSpeeds, windGusts) {
  const canvas = document.getElementById("wind-hourly-chart");
  const ctx = canvas.getContext("2d");

  if (window.windChart) {
    window.windChart.destroy();
  }

  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  window.windChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Wind Speed (mph)",
          data: windSpeeds,
          borderColor: "rgb(236, 91, 43, 0.9)",
          backgroundColor: "rgb(236, 91, 43, 0.1)",
          fill: false,
          tension: 0.3,
          pointRadius: 3,
          borderWidth: 2
        },
        {
          label: "Wind Gust (mph)",
          data: windGusts,
          borderColor: "rgba(255, 0, 0, 0.8)",
          backgroundColor: "rgba(255, 0, 0, 0.1)",
          fill: false,
          tension: 0.3,
          pointRadius: 3,
          borderWidth: 2,
          spanGaps: false
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: true, labels: { color: "black" } },
        tooltip: { enabled: true }
      },
      scales: {
        x: {
          ticks: { color: "#ccc" },
          grid: { color: "rgba(255,255,255,0.05)" },
          ticks: { maxRotation: 90, minRotation: 90 }
        },
        y: {
          min: 0,
          max: Math.ceil(Math.max(...windSpeeds.concat(windGusts.filter(Boolean))) + 3), // adds buffer of ~3mph
          ticks: { color: "rgba(0, 0, 0, 0.41)" },
          grid: { color: "rgba(255,255,255,0.05)" }
        }
      }
    }
  });
}





function displayTenDayForecast(forecastData) {
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const forecastContainer = document.getElementById("tenDayForecast");
  forecastContainer.innerHTML = "";

  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().slice(0, 10); // Format: YYYY-MM-DD

  for (let i = 0; i < 10; i++) {
    const forecast = forecastData[i];
    const parts = forecast.valid_date.split("-");
    const forecastDate = new Date(parts[0], parts[1] - 1, parts[2]); // Local time
    const forecastDateStr = forecast.valid_date;
    const dayIndex = forecastDate.getDay();
    const formattedDate = `${forecastDate.getMonth() + 1}/${forecastDate.getDate()}`;

    // Determine label (e.g., "Tomorrow" or actual weekday)
    let label = daysOfWeek[dayIndex];
    if (i === 0 && forecastDateStr === tomorrowStr) {
      label = "Tomorrow";
    }

    // Clean and simplify the description
    let description = forecast.weather.description.toLowerCase();
    if (description.includes("thunderstorm")) {
      description = "scattered thunderstorms";
    } else if (description.includes("partly") && description.includes("cloud")) {
      description = "partly cloudy";
    } else if (description.includes("clear")) {
      description = "sunny";
    } else if (description.includes("light shower rain")) {
      description = "light rain";
    }

    const highTemp = Math.round(forecast.high_temp);
    const lowTemp = Math.round(forecast.low_temp);
    const pop = Math.round(forecast.pop);
    const iconFilename = getIconFilename(description, true); // Assume day icons

    const card = document.createElement("div");
    card.classList.add("forecast-card");

    card.innerHTML = `
      <h3>${label}</h3>
      <p style="font-size: 0.8em; margin-top: -10px;">${formattedDate}</p>
      <img src="icons/day/${iconFilename}" alt="${description}" class="forecast-icon">
      <p>${highTemp}° / ${lowTemp}°</p>
      <p>${description}</p>
      <div class="bottom-info">
        <div class="rain-info">
          <img src="icons/day/drop.png" alt="Rain Drop" class="rain-icon">
          <span>${pop}%</span>
        </div>
      </div>
    `;
    forecastContainer.appendChild(card);
  }
}

  
async function getEventWeatherForecasts(lat, lon) {
  const apiKey = weatherbitApiKey;
  const url = `https://api.weatherbit.io/v2.0/forecast/hourly?lat=${lat}&lon=${lon}&units=I&key=${apiKey}&hours=240`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    const forecasts = data.data;

    const events = document.querySelectorAll('.event');
    let visibleEventCount = 0;

    events.forEach(event => {
      const localDateTimeStr = event.getAttribute('data-datetime');
      if (!localDateTimeStr) return;

      const localDate = new Date(localDateTimeStr);
      const now = new Date();

      if (localDate < now) {
        const anchor = event.closest('a');
        if (anchor) anchor.style.display = 'none';
        return;
      }

      const utcISOString = localDate.toISOString().slice(0, 13); // "YYYY-MM-DDTHH"
      const forecast = forecasts.find(f => f.timestamp_utc.startsWith(utcISOString));

      const existingInfo = event.querySelector('.forecast-info');
      if (existingInfo) existingInfo.remove();

      if (forecast) {
        visibleEventCount++;

        const description = forecast.weather.description;
        const temp = Math.round(forecast.temp);
        const precip = forecast.pop;
        const isDay = forecast.weather.icon.endsWith("d");

        const cleanDesc = adjustWeatherDescription(description);
        const capitalizedDescription = cleanDesc.replace(/\b\w/g, char => char.toUpperCase());
        const icon = getIconFilename(cleanDesc.toLowerCase(), isDay);
        const iconPath = `icons/${isDay ? "day" : "night"}/${icon}`;

        const output = `
          <div class="forecast-info">
            <img src="${iconPath}" alt="${description}" />
            <p class="temp">${temp}°</p>
            <p class="description">${capitalizedDescription}</p>
            <p class="precip">Precip: ${precip}%</p>
          </div>
        `;

        event.insertAdjacentHTML('beforeend', output);
      } else {
        event.insertAdjacentHTML('beforeend', `<p>No forecast found for that time.</p>`);
      }
    });

    if (visibleEventCount === 0) {
      const container = document.getElementById('event-container');
      if (container) {
        container.innerHTML = `<p style="color: white; font-style: italic;">More events coming soon!</p>`;
      }
    }

  } catch (err) {
    console.error("Error fetching Weatherbit forecast:", err);
  }
}


getEventWeatherForecasts(latitude,longitude);

function updateContainerBackground(description, isDay) {
  const container = document.querySelector('.container');
  const defaultBackground = "rain.png";
  const specificWeatherConditions = [
    "sky is clear", "windy", "scattered clouds", "broken clouds",
    "few clouds", "clear sky", "haze", "partly cloudy", "sunny", "scattered thunderstorms"
  ];

  let backgroundImage;
  const desc = description.toLowerCase();

  if (desc === "overcast clouds" || desc === "smoke") {
    backgroundImage = "cloudy.png";
    container.style.backgroundColor = "#636363";
  } else if (["snow", "flurries", "light snow", "heavy snow"].includes(desc)) {
    backgroundImage = "snow.png";
    container.style.backgroundColor = "#010038";
  } else if (specificWeatherConditions.includes(desc)) {
    backgroundImage = isDay ? "daytime.png" : "nighttime.png";
    container.style.backgroundColor = isDay ? "#95CBFA" : "#161616";
  } else {
    backgroundImage = defaultBackground;
    container.style.backgroundColor = "#1D3536";
  }

  container.style.backgroundImage = `url('icons/background/${backgroundImage}')`;

  // Add subtle zoom effect
  container.classList.add('background-scale');
  container.addEventListener('transitionend', () => {
    container.classList.remove('background-scale');
  }, { once: true });
}

const showWindButton = document.getElementById('show-wind');
const showPrecipitationButton = document.getElementById('show-precipitation');
const windChartContainer = document.getElementById('wind-chart-container');
const precipChartContainer = document.getElementById('precipitation-chart-container');
const windBanner = document.getElementById('wind-banner');
const precipBanner = document.getElementById('precipitation-banner');

// Show the wind chart by default
windChartContainer.style.display = 'block';
precipChartContainer.style.display = 'none';
windBanner.style.display = 'block';
precipBanner.style.display = 'none';

showWindButton.addEventListener('click', () => {
  windChartContainer.style.display = 'block';
  precipChartContainer.style.display = 'none';
  windBanner.style.display = 'block';
  precipBanner.style.display = 'none';
  
  showWindButton.classList.add('active');
  showPrecipitationButton.classList.remove('active');
});

showPrecipitationButton.addEventListener('click', () => {
  windChartContainer.style.display = 'none';
  precipChartContainer.style.display = 'block';
  windBanner.style.display = 'none';
  precipBanner.style.display = 'block';
  
  showPrecipitationButton.classList.add('active');
  showWindButton.classList.remove('active');
});


