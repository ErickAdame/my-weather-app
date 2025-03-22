var geoZipcode = 0;
var locZipCode = 0;
var myLat = 0;
var myLong = 0;

document.addEventListener("DOMContentLoaded", () => {
  const toggleInputButton = document.getElementById("toggleInputButton");
  const inputSection = document.getElementById("inputSection");
  const zipcodeInput = document.getElementById("zipcodeInput");
  const getWeatherButton = document.getElementById("getWeatherButton");
  const locationParagraph = document.getElementById("location");
    const hourlyButton = document.getElementById('hourlyButton');
    const dailyButton = document.getElementById('dailyButton');
    const radarButton = document.getElementById('radarButton');
    const homeButton = document.getElementById('homeButton');
    const hourlyForecast = document.getElementById('hourlyForecast');
    const sevenDayForecast = document.getElementById('sevenDayForecast');
    const location2 = document.getElementById('location2');
    const radarContainer = document.querySelector('.iframe-container');
    const sevenDayBarGraphContainer = document.getElementById('sevenDayBarGraphContainer');
  
    // Reset radar visibility state
    let radarVisible = false;
  
    // Function to reset to the initial state
    function resetPage() {
      radarContainer.style.display = 'block'; // Show the radar
      hourlyForecast.style.display = 'table'; // Show hourly forecast
      sevenDayForecast.style.display = 'flex'; // Show daily forecast
      sevenDayBarGraphContainer.style.display = 'block'; // Show bar graph
      location2.style.display = 'none'; // Hide location info
      radarVisible = true; // Set radar as visible
  
      // Smooth scroll to the top
      $('html, body').animate({
        scrollTop: 0
      }, 500);
    }
  
    // Function to hide all containers
    function hideAllContainers() {
      radarContainer.style.display = 'none';
      hourlyForecast.style.display = 'none';
      sevenDayForecast.style.display = 'none';
      sevenDayBarGraphContainer.style.display = 'none';
      location2.style.display = 'none';
      radarVisible = false;
    }
  
    // Event listener for hourly button
    hourlyButton.addEventListener('click', () => {
      hideAllContainers(); // Hide all containers
      hourlyForecast.style.display = 'table'; // Show hourly forecast
  
      // Smooth scroll to the hourly forecast
      $('html, body').animate({
        scrollTop: $(hourlyForecast).offset().top
      }, 500);
    });
  
    // Event listener for daily button
    dailyButton.addEventListener('click', () => {
      hideAllContainers(); // Hide all containers
      sevenDayForecast.style.display = 'flex'; // Show daily forecast
      sevenDayBarGraphContainer.style.display = 'block'; // Show bar graph
      location2.style.display = 'block';
      location2.style.textAlign = 'center';
  
      // Smooth scroll to the daily forecast
      $('html, body').animate({
        scrollTop: $(sevenDayForecast).offset().top
      }, 500);
    });
  
    // Event listener for radar button
    radarButton.addEventListener('click', () => {
      window.open('https://maps.zoomradar.net/?key=ch9SKimlPV0Hfyk', '_blank');
    });
  
    // Event listener for home button
    homeButton.addEventListener('click', resetPage);
  
    // Set the initial state on page load
    resetPage();

  
  try {
    let worked = 0;
    async function ziplookup() {
      await getGeoCoords();
      locZipCode = await getZipCodeFromCoordinates(myLat, myLong);
      await getWeatherByZipCode(locZipCode);
      return locZipCode;
    }
    ziplookup().then((value) => {
      worked = value;
    });
    if (worked < 500) {
      throw new Error('ZIP failed');
    }
  } catch (error) {
    // Try to retrieve the stored ZIP code from localStorage or cookies
    if (myLat === 0) {
      myLat = getCookie("lat");
      myLong = getCookie("lng");
    }
    let storedZipcode = localStorage.getItem("zipcode");
    if (!storedZipcode) {
      storedZipcode = getCookie("zipcode");
    }
    if (storedZipcode) {
      zipcodeInput.value = storedZipcode;
      getWeatherByZipCode(storedZipcode);
    }
  }

  toggleInputButton.addEventListener("click", () => {
    closeInput();
  });

  getWeatherButton.addEventListener("click", () => {
    const zipcode = geoZipcode ? geoZipcode : locZipCode; // Add output from GEOapify
    if (zipcode) {
      getWeatherByZipCode(zipcode);
    } else {
      alert("Please enter a valid US city.");
    }
    closeInput();
  });

  // Call getWeatherByZipCode every 20 minutes
  setInterval(() => {
    if (!locZipCode) {
      const storedZipcode = localStorage.getItem("zipcode") || getCookie("zipcode");
      if (storedZipcode) {
        getWeatherByZipCode(storedZipcode);
      }
    } else {
      getWeatherByZipCode(locZipCode);
    }
  }, 20 * 60 * 1000);

  // Add event listeners for the hourly and daily forecast buttons
  hourlyButton.addEventListener('click', () => {
    if (radarVisible) {
      toggleRadar(); // Hide radar if it's visible
    }
    hourlyForecast.style.display = 'table'; // Show hourly forecast
    sevenDayForecast.style.display = 'none'; // Hide daily forecast
    sevenDayBarGraphContainer.style.display = 'none'; // Hide bar graph
    location2.style.display = 'none';

    $('html, body').animate({
      scrollTop: $(hourlyForecast).offset().top
    }, 500); // Smooth scroll to hourly forecast
  });

  dailyButton.addEventListener('click', () => {
    if (radarVisible) {
      toggleRadar(); // Hide radar if it's visible
    }
    hourlyForecast.style.display = 'none'; // Hide hourly forecast
    sevenDayForecast.style.display = 'flex'; // Show daily forecast
    sevenDayBarGraphContainer.style.display = 'block'; // Show bar graph
    location2.style.display = 'block';
    location2.style.textAlign = 'center';

    $('html, body').animate({
      scrollTop: $(sevenDayForecast).offset().top
    }, 500); // Smooth scroll to daily forecast
  });



  homeButton.addEventListener('click', resetPage);
});


//Get geocoordinates
async function getGeoCoords() {
  let getPositionPromise = new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject);
    });
  let position = await getPositionPromise;
  myLat  = position.coords.latitude;
  myLong = position.coords.longitude;

  if (myLat === 0) {
    myLat  = getCookie("lat");
    myLong = getCookie("lng");
  }
  
}

// Set a cookie
function setCookie(name, value, days) {
    let expires = "";
    if (days) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
}

// Get a cookie
function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}


// Other functions remain the same...

async function getCurrentPosition() {
  return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject);
  });
}

async function getZipCodeFromCoordinates(latitude, longitude) {
  const reverseGeocodingUrl = `https://us1.locationiq.com/v1/reverse.php?key=pk.87d9d78a2ad148636030ff08fe491f91&lat=${latitude}&lon=${longitude}&format=json`;

  try {
      const response = await fetch(reverseGeocodingUrl);
      const data = await response.json();
      const address = data.address;
      return address.postcode;
  } catch (error) {
      console.error("Error fetching location data:", error);
      throw new Error("Error fetching location data");
  }
}

function closeInput() {
    inputSection.style.display = inputSection.style.display === "none" ? "block" : "none";
    toggleInputButton.textContent = inputSection.style.display === "none" ? "Select City" : "DONE";
}




// Get geocoordinates
async function getGeoCoords() {
  let getPositionPromise = new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject);
  });
  let position = await getPositionPromise;

  // Set latitude and longitude
  myLat = position.coords.latitude;
  myLong = position.coords.longitude;

  // Now that we have the coordinates, call the function to fetch rain/snow data
  await getRainSnowData();
}

// Call getGeoCoords when the page loads
document.addEventListener("DOMContentLoaded", () => {
  getGeoCoords(); // Ensure geolocation is fetched before any data is requested
});


// Get geocoordinates
async function getGeoCoords() {
  let getPositionPromise = new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject);
  });
  let position = await getPositionPromise;

  // Set latitude and longitude
  myLat = position.coords.latitude;
  myLong = position.coords.longitude;
}


async function fetchWeatherAlerts(lat, lon) {
  const apiKey = '85a65933d3894f0d9c7194ffa8098565';
  const alertsUrl = `https://api.weatherbit.io/v2.0/alerts?lat=${lat}&lon=${lon}&key=${apiKey}`;
  const forecastUrl = `https://api.weatherbit.io/v2.0/forecast/hourly?lat=${lat}&lon=${lon}&units=I&hours=48&key=${apiKey}`;
  const checklisturl = `https://api.weatherbit.io/v2.0/forecast/daily?lat=${lat}&lon=${lon}&units=I&key=${apiKey}`;


  try {
    // Fetch weather alerts
    const alertsResponse = await fetch(alertsUrl);
    if (!alertsResponse.ok) {
      throw new Error(`HTTP error fetching alerts! status: ${alertsResponse.status}`);
    }
    const alertsData = await alertsResponse.json();
    console.log('Fetched alerts data:', alertsData);

    const alerts = alertsData.alerts;
    const alertMessageElement = document.getElementById('alert-message');
    alertMessageElement.innerHTML = '';

    if (alerts.length === 0) {
      alertMessageElement.classList.remove('alert-present');
      alertMessageElement.classList.add('alert-none');
      alertMessageElement.innerText = "There are no active alerts";
  } else {
      alertMessageElement.classList.remove('alert-none');
      alertMessageElement.classList.add('alert-present');
      alertMessageElement.style.display = 'block';

      const uniqueAlerts = new Map(); // Use a Map to keep only the most recent alert for each title

      alerts.forEach(alert => {
          uniqueAlerts.set(alert.title, alert); // Overwrite older alerts with the same title
      });

      uniqueAlerts.forEach(alert => {
          const alertDetails = document.createElement('p');
          alertDetails.textContent = `${alert.title}`;
          alertDetails.style.color = 'white';
          alertDetails.style.fontWeight = 'normal';
          alertDetails.style.margin = '20px';
          alertDetails.style.cursor = 'pointer';
          alertDetails.style.backgroundColor = 'rgba(225, 0, 0, 0.7)';
          alertDetails.style.paddingTop = '20px';
          alertDetails.style.paddingBottom = '20px';
          alertDetails.style.borderRadius = '8px';

          alertDetails.addEventListener('click', () => {
              showAlertBox(alert.title, alert.description);
          });

          alertMessageElement.appendChild(alertDetails);
      });


      const hideButton = document.createElement('button');
      hideButton.innerText = 'Hide Alerts';
      hideButton.classList.add('hide-alerts-button');
      hideButton.addEventListener('click', () => {
        alertMessageElement.innerHTML = '';
        alertMessageElement.classList.remove('alert-present');
        alertMessageElement.classList.add('alert-none');

        const showButton = document.createElement('button');
        showButton.innerText = 'Active Weather Alerts!';
        showButton.classList.add('active-alerts-button');
        showButton.addEventListener('click', () => {
          showButton.remove();
          alertMessageElement.innerHTML = '';
          alerts.forEach(alert => {
            const alertDetails = document.createElement('p');
            alertDetails.textContent = `${alert.title}`;
            alertDetails.style.color = 'white';
            alertDetails.style.fontWeight = 'normal';
            alertDetails.style.margin = '20px';
            alertDetails.style.cursor = 'pointer';
            alertDetails.style.backgroundColor = 'rgba(225, 0, 0, 0.7)';
            alertDetails.style.paddingTop = '20px';
            alertDetails.style.paddingBottom = '20px';
            alertDetails.style.borderRadius = '8px';

            alertDetails.addEventListener('click', () => {
              showAlertBox(alert.title, alert.description);
            });

            alertMessageElement.appendChild(alertDetails);
          });

          alertMessageElement.appendChild(hideButton);
        });

        alertMessageElement.appendChild(showButton);
      });

      alertMessageElement.appendChild(hideButton);
    }

    // Fetch forecast data
    const forecastResponse = await fetch(forecastUrl);
    if (!forecastResponse.ok) {
      throw new Error(`HTTP error fetching forecast! status: ${forecastResponse.status}`);
    }

    const forecastData = await forecastResponse.json();
    console.log('Fetched forecast data:', forecastData);

    if (forecastData.data && forecastData.data.length > 0) {
      // Function to format time as hour am/pm (e.g., 2pm, 3pm)
      function formatTime(timestamp) {
        const date = new Date(timestamp);
        let hours = date.getHours();
        const ampm = hours >= 12 ? 'pm' : 'am';
        hours = hours % 12;
        hours = hours ? hours : 12; // Handle 0 as 12
        return `${hours}${ampm}`;
      }

      // Collect snow data and local time for the next 24 hours
      const snowData = forecastData.data.slice(0, 24).map(hour => ({
        snow: hour.snow || 0,
        time: formatTime(hour.timestamp_local)
      }));

      // Collect precipitation data and local time for the next 24 hours
      const precipData = forecastData.data.slice(0, 24).map(hour => ({
        precip: hour.precip || 0,
        time: formatTime(hour.timestamp_local)
      }));

      console.log('Hourly Snow Data with Time:', snowData);
      console.log('Hourly Precipitation Data with Time:', precipData);

      // Store the hourly snow and precipitation data in localStorage
      localStorage.setItem('snowForecastData', JSON.stringify(snowData));
      localStorage.setItem('precipForecastData', JSON.stringify(precipData));

      // Optional: To visualize this on the page (bar graph, etc.), you can display it here
      const snowTotalElement = document.getElementById('snowtotal');
      if (snowTotalElement) {
        const totalSnow = snowData.reduce((total, current) => total + current.snow, 0);
        if (totalSnow === 0) {
          snowTotalElement.style.display = 'none'; // Hide container if no snow
        } else {
          snowTotalElement.style.display = 'block'; // Show container if snow exists
          snowTotalElement.innerHTML = `
          <div style="text-align: center; color: white;">
              <p style="margin: 0; font-size: 14px;">--------------------------------</p> <!-- Line at the top -->
              <h3 style="margin: 5px 0; color: white;">Snow is in the Forecast ❄️</h3> <!-- Adjusted spacing -->
              <p style="margin: 2px 0 0; font-size: 14px; color: white;">
                  ${totalSnow.toFixed(1)}" of snow can be expected in the next 24 hours
              </p>
              <p style="margin: 0; font-size: 14px;">------------------------------------------</p
          </div>
      `;
      ;
        }
      }
    }


    try {
      const response = await fetch(checklisturl);
      const data = await response.json();
      const today = data.data[0]; // Get today's forecast
  
      // Extract necessary values from today's forecast
      const { max_temp, precip, snow, weather: { description } } = today;
  
      // Initialize the checklist
      let checklist = {
          truePriority1: [],
          truePriority2: [],
          falsePriority1: [],
          falsePriority2: []
      };
  
      // Umbrella and Jacket logic (always included)
      if (precip >= 0.08) {
          checklist.truePriority1.push('<img src="check.png" alt="✔" style="width: 20px; height: 20px; vertical-align: bottom; margin-right: 2px;">Umbrella');
      } else {
          checklist.falsePriority1.push("❌  Umbrella");
      }
  
      let jacketRecommendation = ""; // Initialize the variable for jacket-related recommendations

      if (max_temp < 30) {
      jacketRecommendation = '<img src="check.png" alt="✔" style="width: 20px; height: 20px; vertical-align: bottom; margin-right: 2px;">Heavy Coat';
     checklist.truePriority1.push(jacketRecommendation);
      } else if (max_temp >= 30 && max_temp < 50) {
      jacketRecommendation = '<img src="check.png" alt="✔" style="width: 20px; height: 20px; vertical-align: bottom; margin-right: 2px;">Jacket';
      checklist.truePriority1.push(jacketRecommendation);
      } else if (max_temp >= 50 && max_temp <= 65) {
      jacketRecommendation = '<img src="check.png" alt="✔" style="width: 20px; height: 20px; vertical-align: bottom; margin-right: 2px;">Light Jacket';
      checklist.truePriority1.push(jacketRecommendation);
      } else {
      jacketRecommendation = "❌ Jacket";
      checklist.falsePriority1.push(jacketRecommendation);
      }

    
  
      // Gloves logic
      if (max_temp < 40) {
          checklist.truePriority1.push('<img src="check.png" alt="✔" style="width: 20px; height: 20px; vertical-align: bottom; margin-right: 2px;">Gloves');
      } else if (max_temp > 60) {
          checklist.falsePriority2.push("❌ Gloves");
      }
  
      // Additional logic for other items
      if (max_temp < 60) {
          checklist.falsePriority2.push("❌ Shorts");
      } else if (max_temp >= 60 && max_temp < 72) {
          checklist.falsePriority1.push("❌ Shorts");
      } else if (max_temp >= 72) {
          checklist.truePriority1.push('<img src="check.png" alt="✔" style="width: 20px; height: 20px; vertical-align: bottom; margin-right: 2px;">Shorts');
          if (max_temp > 90) checklist.truePriority1.push('<img src="check.png" alt="✔" style="width: 20px; height: 20px; vertical-align: bottom; margin-right: 2px;">Bottle of Water');
      }
  
      if (max_temp >= 37 && max_temp < 62) {
          checklist.truePriority1.push('<img src="check.png" alt="✔" style="width: 20px; height: 20px; vertical-align: bottom; margin-right: 2px;">Sweater');
      }
  
      if (snow >= 1.0) {
          checklist.truePriority1.push('<img src="check.png" alt="✔" style="width: 20px; height: 20px; vertical-align: bottom; margin-right: 2px;">Snow Boots');
      }
  
// Ensure the weather description is cleaned up
const cleanedDescription = description.toLowerCase().trim();

// Debugging: Log the actual description for verification
console.log("Weather description:", cleanedDescription);

// Define the sunny-related keywords
const sunnyKeywords = [
    "sky is clear", 
    "few clouds", 
    "scattered clouds", 
    "broken clouds", 
    "sunny", 
    "partly cloudy", 
    "mostly sunny", 
    "clear sky", 
    "clear"
];

// Check if the description contains any of the sunny-related keywords
if (sunnyKeywords.some(word => cleanedDescription.includes(word))) {
    checklist.truePriority1.push('<img src="check.png" alt="✔" style="width: 20px; height: 20px; vertical-align: bottom; margin-right: 2px;">Sunglasses');
} else {
    checklist.falsePriority1.push("❌ Sunglasses");
}

  
// Combine items, ensuring Umbrella and Jacket are always included first
const mandatoryItems = [
  checklist.truePriority1.find(item => item.includes("Umbrella")) || checklist.falsePriority1.find(item => item.includes("Umbrella")),
  checklist.truePriority1.find(item => item === jacketRecommendation) || checklist.falsePriority1.find(item => item === jacketRecommendation)
];

  
      const otherItems = [
          ...checklist.truePriority1,
          ...checklist.truePriority2,
          ...checklist.falsePriority1,
          ...checklist.falsePriority2
      ].filter(item => !mandatoryItems.includes(item)); // Exclude Umbrella and Jacket from shuffling
  
      // Shuffle and select 4 additional items to make a total of 6
      const additionalItems = otherItems.sort(() => 0.5 - Math.random()).slice(0, 4);
  
      // Final checklist with mandatory items + additional items
      const selectedItems = [...mandatoryItems, ...additionalItems];
  
      // Format the items into two columns (3 items per column)
      const column1 = selectedItems.slice(0, 3);
      const column2 = selectedItems.slice(3, 6);
  
      // Display the formatted checklist
      const formattedChecklist = `
          <div style="display: flex; justify-content: center; gap: 20px; margin-top: 20px;">
              <div>
                  ${column1.map(item => `<p>${item}</p>`).join("")}
              </div>
              <div>
                  ${column2.map(item => `<p>${item}</p>`).join("")}
              </div>
          </div>
      `;
  
      // Insert into the DOM (for example, you can replace an element with ID 'checklist')
      document.getElementById("checklist").innerHTML = formattedChecklist;
  
  } catch (error) {
      console.error("Error fetching or processing data:", error);
      document.getElementById("checklist").innerHTML = "<p>Error fetching weather data.</p>";
  }
  
  
  

  } catch (error) {
    console.error('Error fetching data:', error);
    const alertMessageElement = document.getElementById('alert-message');
    alertMessageElement.classList.remove('alert-present', 'alert-none');
    alertMessageElement.innerText = 'Error fetching alerts';
  }
}




function showAlertBox(title, description) {
  // Process the description:
  // 1. Remove standalone \n characters
  // 2. Ensure spacing after each `*` for clarity
  const cleanedDescription = description
    .replace(/\n(?!\*)/g, ' ') // Remove standalone \n
    .replace(/\n\*/g, '\n\n*') // Add blank line before each `*`
    .replace(/(?<!\n)\*/g, '\n*'); // Ensure `*` starts on a new line if not already

  // Create the alert box container
  const alertBox = document.createElement('div');
  alertBox.classList.add('alert-box');

  // Create the title element
  const alertTitle = document.createElement('h2');
  alertTitle.innerText = title;

  // Create the description element
  const alertDescription = document.createElement('p');
  alertDescription.style.whiteSpace = 'pre-wrap'; // Preserve spacing and newlines
  alertDescription.innerText = cleanedDescription.trim(); // Render the cleaned description

  // Add a close button
  const closeButton = document.createElement('button');
  closeButton.innerText = '×';
  closeButton.classList.add('close-button');
  closeButton.addEventListener('click', () => {
    document.body.removeChild(alertBox);
  });

  // Append the title, description, and close button to the alert box
  alertBox.appendChild(alertTitle);
  alertBox.appendChild(alertDescription);
  alertBox.appendChild(closeButton);

  // Append the alert box to the body
  document.body.appendChild(alertBox);
}




// Example function to get latitude and longitude based on ZIP code and fetch weather alerts
async function fetchWeatherData(zipCode) {
  // Use a geocoding API or other method to get lat and lon from zipCode
  const lat = 40.7128; // Example latitude
  const lon = -74.0060; // Example longitude
  fetchWeatherAlerts(lat, lon);
}

document.getElementById('getWeatherButton').addEventListener('click', () => {
  const zipCode = document.getElementById('zipcodeInput').value;
  fetchWeatherData(zipCode);
  fetchRainSnow(zipCode)
});


async function getWeatherByZipCode(zipcode) {
  const openWeatherApiKey = "155db15cf89682a55503d94f25dc4deb";
  const openWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?zip=${zipcode},us&appid=${openWeatherApiKey}&units=imperial`;

  try {
      const response = await fetch(openWeatherUrl);
      const data = await response.json();

      console.log('Fetched weather data:', data);

      if (data.cod === 200) {
          updateWeatherDetails(data);
          fetchHourlyForecast(data.coord.lat, data.coord.lon);
          await fetchWeatherbitForecast(zipcode);
          await fetchWeatherAlerts(data.coord.lat, data.coord.lon);
      } else {
          console.error("Weather data not found for the provided ZIP code.");
      }
  } catch (error) {
      console.error("Error fetching weather data from OpenWeatherMap:", error);
  }

  // Save the zip code to both localStorage and as a cookie
  localStorage.setItem("zipcode", zipcode);
  setCookie("zipcode", zipcode, 365); // Save for 365 days
}



async function fetchWeatherbitForecast(zipcode) {
  const weatherbitApiKey = "85a65933d3894f0d9c7194ffa8098565";
  const weatherbitUrl = `https://api.weatherbit.io/v2.0/forecast/daily?postal_code=${zipcode}&country=US&key=${weatherbitApiKey}`;

  try {
      const response = await fetch(weatherbitUrl);
      const data = await response.json();

      if (data && data.data) {
          const forecastData = data.data[0];
          document.getElementById("maxTemp").textContent = `Hi: ${convertCelsiusToFahrenheit(forecastData.max_temp)}°F`;
          document.getElementById("minTemp").textContent = `Lo: ${convertCelsiusToFahrenheit(forecastData.min_temp)}°F`;
      } else {
          console.error("Forecast data not found for the ZIP code: " + zipcode);
      }
  } catch (error) {
      console.error("Error fetching forecast data from Weatherbit for zip code: " + zipcode, error);
  }
}

async function fetchHourlyForecast(lat, lon) {
  const apiKey = "155db15cf89682a55503d94f25dc4deb";

  // Hourly Forecast API call
  const hourlyUrl = `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&exclude=current,daily,minutely,alerts&appid=${apiKey}&units=imperial`;
  
  // Minutely Forecast API call
  const minutelyUrl = `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&exclude=current,daily,hourly,alerts&appid=${apiKey}&units=imperial`;
  console.log(minutelyUrl);

  // Fetch Hourly Forecast
  const hourlyResponse = await fetch(hourlyUrl);
  const hourlyData = await hourlyResponse.json();

  // Fetch Minutely Forecast
  const minutelyResponse = await fetch(minutelyUrl);
  const minutelyData = await minutelyResponse.json();

  // Store the data in localStorage
  localStorage.setItem('hourlyData', JSON.stringify(hourlyData));
  localStorage.setItem('minutelyData', JSON.stringify(minutelyData));

  // Log the data in console for review
  console.log('Hourly Forecast Data:', hourlyData);
  console.log('Minutely Forecast Data:', minutelyData);

  // Handle Hourly Forecast Display
  const hourlyForecast = document.getElementById("hourlyForecast");
  hourlyForecast.innerHTML = ""; // Clear existing content
  hourlyForecast.style.display = "block";

  const table = document.createElement("table");

  // Add colgroup to define column widths
  table.innerHTML = `
    <colgroup>
      <col>
      <col>
      <col>
      <col style="width: 22%; min-width: 130px;">
      <col>
    </colgroup>
  `;
  hourlyForecast.appendChild(table);

  const limitedForecastData = hourlyData.hourly.slice(0, 36); // Slice for 36 hours forward
  const options = { weekday: 'long', hour: 'numeric', hour12: true, timeZone: hourlyData.timezone };
  const formatter = new Intl.DateTimeFormat('en-US', options);

  let lastDay = null;

  limitedForecastData.forEach((hourData, index) => {
    const forecastTimestamp = new Date(hourData.dt * 1000); // Convert UNIX timestamp to JS date object
    const forecastDay = formatter.format(forecastTimestamp).split(',')[0]; // Get day name without time

    // Check if it's a new day
    if (index === 0 || forecastDay !== lastDay) {
      // Insert a separator row for the new day
      const daySeparatorRow = document.createElement("tr");
      daySeparatorRow.innerHTML = `<td colspan="5" class="day-separator"><strong>${forecastDay}</strong></td>`;
      table.appendChild(daySeparatorRow);
      lastDay = forecastDay;
    }

    const isDaytime = hourData.weather[0].icon.endsWith('d');
    const forecastIcon = getIconFilename(hourData.weather[0].description, isDaytime);

    // Create a regular row for each hour, starting from the first hour
    const row = document.createElement("tr");
    const precipitationChance = Math.round(hourData.pop * 100);
    let precipitationClass = '';

    // Determine the CSS class based on precipitation chance
    if (precipitationChance < 20) {
      precipitationClass = 'transparent-background';
    } else if (precipitationChance >= 20 && precipitationChance < 40) {
      precipitationClass = 'dark-green';
    } else if (precipitationChance >= 40 && precipitationChance <= 80) {
      precipitationClass = 'medium-green';
    } else if (precipitationChance > 80) {
      precipitationClass = 'bright-green';
    }

    row.innerHTML = `
      <td>${formatter.format(forecastTimestamp).split(',')[1]}</td>
      <td><img src="icons/${isDaytime ? 'day' : 'night'}/${forecastIcon}" alt="Weather icon" style="height:50px;"></td>
      <td>${Math.round(hourData.temp)}°</td>
      <td>${getWindDirection(hourData.wind_deg)} ${Math.round(hourData.wind_speed)} mph</td>
      <td class="${precipitationClass}">${precipitationChance}%</td>`;

    table.appendChild(row);
  });

  // Handle Minutely Forecast Display
  const messageContainer = document.getElementById('minutely-forecast'); // Ensure this element exists in your HTML
  const minutelyMessage = getMinutelyForecastMessage(minutelyData.minutely);
  messageContainer.innerText = minutelyMessage;
}

function getMinutelyForecastMessage(minutelyData) {
  if (!minutelyData || !Array.isArray(minutelyData) || minutelyData.length !== 60) {
    return "Minutely forecast data unavailable.";
  }

  let isRainingNow = false;
  let rainEndTime = null;
  let intermittentRain = false;
  let nextRainStart = null;
  let nextRainDuration = 0;
  const now = new Date();

  let consecutiveDryMinutes = 0;
  let consecutiveRainMinutes = 0;

  for (let i = 0; i < minutelyData.length; i++) {
    const minuteData = minutelyData[i];
    const precipitation = minuteData.precipitation;

    // Check if it's raining right now
    if (i === 0 && precipitation > 0) {
      isRainingNow = true;
      consecutiveRainMinutes++; // Start counting rain
    }

    // Detect when rain stops
    if (precipitation === 0) {
      if (consecutiveRainMinutes > 0) {
        // If rain has occurred for 5 or more minutes, check for intermittent rain conditions
        if (consecutiveRainMinutes >= 5) {
          consecutiveDryMinutes++;
          if (consecutiveDryMinutes >= 5 && consecutiveDryMinutes <= 15) {
            intermittentRain = true; // Dry for 5-15 minutes after rain
          }
        }
        // Reset rain count
        consecutiveRainMinutes = 0;
      }
      consecutiveDryMinutes++; // Count consecutive dry minutes
      if (consecutiveDryMinutes >= 5 && rainEndTime === null) {
        rainEndTime = i; // Mark when rain stops
      }
    } else {
      // If it starts raining again
      consecutiveRainMinutes++;
      consecutiveDryMinutes = 0; // Reset dry count
      if (rainEndTime !== null && i - rainEndTime <= 20) {
        intermittentRain = true; // If rain resumes within 20 minutes
      }
    }

    // Track when the next rain will start (after rain stops)
    if (!isRainingNow && nextRainStart === null && precipitation > 0) {
      nextRainStart = i;
      
      // Count how many consecutive minutes of rain follow the start
      for (let j = nextRainStart; j < minutelyData.length; j++) {
        if (minutelyData[j].precipitation > 0) {
          nextRainDuration++;
        } else {
          break; // Stop counting when we hit the first dry minute
        }
      }
    }
  }

  // Output the appropriate message
  if (isRainingNow) {
    if (rainEndTime !== null) {
      const rainDuration = rainEndTime;
      if (intermittentRain) {
        return "Precipitation will continue for at least the next hour and be intermittent.";
      }
      return `Precipitation will stop in ${rainDuration} minutes.`;
    } else {
      return "Precipitation will continue for at least the next hour.";
    }
  } else if (nextRainStart !== null) {
    if (nextRainDuration > 0) {
      // Differentiate between a full hour of rain and limited rain
      const rainTimeMessage = nextRainDuration === 60 - nextRainStart
        ? "and will continue for at least the remainder of the hour."
        : `and will continue for ${nextRainDuration} minutes`;
      const intermittentMessage = intermittentRain ? "and be intermittent." : "";
      return `Precipitation will begin in ${nextRainStart} minutes ${rainTimeMessage} ${intermittentMessage}`.trim();
    } else {
      return `Precipitation will begin in ${nextRainStart} minutes`;
    }
  } else {
    return "No precipitation is expected in the next hour.";
  }
}


// Call the fetchHourlyAndMinutelyForecast function
fetchHourlyForecast(myLat, myLong);

function updateWeatherDetails(data) {
  document.getElementById("location").textContent = data.name;
  document.getElementById("location2").textContent = `${data.name} Extended Forecast`;
  document.getElementById("temperature").textContent = `${Math.round(data.main.temp)}°F`;
  document.getElementById("feels_like").textContent = `Feels Like: ${Math.round(data.main.feels_like)}°F`;
  document.getElementById("weatherDetails").style.display = "block";
  
  // Determine if it's day or night based on the weather icon
  const isDay = data.weather[0].icon.endsWith('d');
  
  const weatherIconElement = document.getElementById("weatherIcon");
  let iconFilename;

  // Check if the weather description is "light rain"
  if (data.weather[0].description.toLowerCase() === "light rain") {
    iconFilename = "Rain.png"; // Use Rain.png for light rain
  } else {
    iconFilename = getIconFilename(data.weather[0].description, isDay); // Use the regular function for other conditions
  }

  weatherIconElement.src = `icons/${isDay ? "day" : "night"}/${iconFilename}`;
  weatherIconElement.alt = "Weather Icon";
  document.getElementById("weatherDescription").textContent = capitalizeDescription(data.weather[0].description);

  let weatherDescription = capitalizeDescription(data.weather[0].description);
  if (weatherDescription.toLowerCase() === "overcast clouds") {
    weatherDescription = "Cloudy";
  }
  if (weatherDescription.toLowerCase() === "heavy intensity rain") {
    weatherDescription = "Heavy Rain";
  }
  if (weatherDescription.toLowerCase() === "light intensity drizzle") {
    weatherDescription = "Drizzle";
  }

  document.getElementById("weatherDescription").textContent = weatherDescription;

  // Set background image and color based on weather description and day/night
  const defaultBackground = "rain.png";
  const specificWeatherConditions = [
    "sky is clear", "windy", "scattered clouds", "broken clouds",
    "few clouds", "clear sky", "haze", "partly cloudy", "sunny", "scattered thunderstorms"
  ];

  let backgroundImage;
  
  if (data.weather[0].description.toLowerCase() === "overcast clouds" || data.weather[0].description.toLowerCase() === "smoke") {
    backgroundImage = "cloudy.png";
    document.body.style.backgroundColor = "#636363";
  } else if (data.weather[0].description.toLowerCase() === "snow" || data.weather[0].description.toLowerCase() === "flurries" || data.weather[0].description.toLowerCase() === "light snow" || data.weather[0].description.toLowerCase() === "heavy snow") {
    backgroundImage = "snow.png";
    document.body.style.backgroundColor = "010038";
  } else if (specificWeatherConditions.includes(data.weather[0].description.toLowerCase())) {
    backgroundImage = isDay ? "daytime.png" : "nighttime.png";
    document.body.style.backgroundColor = isDay ? "#95CBFA" : "#161616";
  } else {
    backgroundImage = defaultBackground;
    document.body.style.backgroundColor = "#1D3536";
  }
  
  // Set background image and apply scaling
  document.body.style.backgroundImage = `url('icons/background/${backgroundImage}')`;
  
  // Add background scaling class
  document.body.classList.add('background-scale');
  
  // Remove scaling class when updating with a new image
  document.body.addEventListener('transitionend', () => {
    document.body.classList.remove('background-scale');
  });

  // Display sunrise and sunset
  const sunriseTime = new Date(data.sys.sunrise * 1000);
  const sunsetTime = new Date(data.sys.sunset * 1000);
  
  const sunriseElement = document.createElement("span");
  sunriseElement.textContent = `Sunrise: ${formatTime(sunriseTime)}, `;
  const sunsetElement = document.createElement("span");
  sunsetElement.textContent = `Sunset: ${formatTime(sunsetTime)}`;
  
  const sunriseSunsetContainer = document.getElementById("sunriseSunset");
  sunriseSunsetContainer.innerHTML = "";
  sunriseSunsetContainer.appendChild(sunriseElement);
  sunriseSunsetContainer.appendChild(sunsetElement);
}



function formatTime(time) {
  let hours = time.getHours();
  let minutes = time.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // Handle midnight (0 hours)
  minutes = minutes < 10 ? '0' + minutes : minutes; // Add leading zero if minutes < 10
  return hours + ':' + minutes + ' ' + ampm;
}

function convertCelsiusToFahrenheit(celsius) {
  return Math.round(celsius * 9 / 5 + 32);
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
      "scattered clouds": isDaytime ? "Sun_Clouds.png" : "Night_Clouds.png",
      "broken clouds": isDaytime ? "Sun_Clouds.png" : "Night_Clouds.png",
      "few clouds": isDaytime ? "Sun.png" : "Moon_Stars.png",
      "heavy intensity rain": "Rain.png",
      "clear sky": isDaytime ? "Sun.png" : "Moon_Stars.png",
      "partly cloudy": isDaytime ? "Sun_Clouds.png" : "Night_Clouds.png",
      "sunny": isDaytime ? "Sun.png" : "Moon_Stars.png",
      "patchy rain possible": "Rain.png",
      "heavy rain": "Rain.png",
      "scattered thunderstorms": isDaytime
          ? "Thunderstorm_Sun.png"
          : "Thunderstorm2.png",
      "thunderstorm with heavy rain": "Thunderstorm_Sun.png",
      drizzle: "Rain.png",
      "light shower rain": "Rain.png",
      "mix snow/rain": "Snow_Rain.png",
      "light snow": "Snowfall_IV.png",
      snow: isDaytime ? "Snowfall_III.png" : "Snowfall_III.png",
      sleet: "Ice3.png",
      flurries: isDaytime ? "flurries.png" : "Snow_III.png",
      "freezing rain": "Ice3.png",
      "thunderstorms": "Thunderstorm2.png",
      "thunderstorm with rain": "Thunderstorm_Sun.png",
      "thunderstorm": "Thunderstorm2.png",
      "light intensity drizzle": "Rain.png",
      "light rain and snow": "Snow_Rain.png",
      "heavy snow": "Snowfall_III.png",
      "haze": isDaytime ? "SunHaze.png" : "Night_Clouds.png",
      "smoke": "Smoke.png",
  };
  return mapping[weatherDescription.toLowerCase()] || "Unknown.png";
}

function capitalizeDescription(description) {
  return description.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

function getWindDirection(degrees) {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return directions[Math.round(degrees / 45) % 8];
}

// Geocod.io
function addressAutocomplete(containerElement, callback, options) {
    // create input element
    var inputElement = document.createElement("input");
    inputElement.setAttribute("type", "text");
    inputElement.setAttribute("placeholder", options.placeholder);
    containerElement.appendChild(inputElement);
  
    // add input field clear button
    var clearButton = document.createElement("div");
    clearButton.classList.add("clear-button");
    addIcon(clearButton);
    clearButton.addEventListener("click", (e) => {
      e.stopPropagation();
      inputElement.value = '';
      callback(null);
      clearButton.classList.remove("visible");
      closeDropDownList();
    });
    containerElement.appendChild(clearButton);
  
    /* Current autocomplete items data (GeoJSON.Feature) */
    var currentItems;
  
    /* Active request promise reject function. To be able to cancel the promise when a new request comes */
    var currentPromiseReject;
  
    /* Focused item in the autocomplete list. This variable is used to navigate with buttons */
    var focusedItemIndex;
  
    /* Execute a function when someone writes in the text field: */
    inputElement.addEventListener("input", function(e) {
      var currentValue = this.value;
  
      /* Close any already open dropdown list */
      closeDropDownList();
  
      // Cancel previous request promise
      if (currentPromiseReject) {
        currentPromiseReject({
          canceled: true
        });
      }
  
      if (!currentValue) {
        clearButton.classList.remove("visible");
        return false;
      }
  
      // Show clearButton when there is a text
      clearButton.classList.add("visible");
  
      /* Create a new promise and send geocoding request */
      var promise = new Promise((resolve, reject) => {
        currentPromiseReject = reject;
        
        var url = `https://api.geocod.io/v1.7/geocode?q=${encodeURIComponent(currentValue)}&api_key=dedcc6226bb7cc674d5bd5b6b466c5bcec72e4b`;

        fetch(url)
          .then(response => {
            // check if the call was successful
            if (response.ok) {
              response.json().then(data => resolve(data));
            } else {
              response.json().then(data => reject(data));
            }
          });
      });
  
      promise.then((data) => {
        currentItems = data.results;
        /* create a DIV element that will contain the items (values):*/
        var autocompleteItemsElement = document.createElement("div");
        autocompleteItemsElement.setAttribute("class", "autocomplete-items");
        containerElement.appendChild(autocompleteItemsElement);
  
        /* For each item in the results */
        data.results.forEach((result, index) => {
          /* Create a DIV element for each element: */
          var itemElement = document.createElement("DIV");
          /* Set formatted address as item value */
          itemElement.innerHTML = result.address_components.city + ", " + result.address_components.state + " " + result.address_components.zip;
          
  
          /* Set the value for the autocomplete text field and notify: */
          itemElement.addEventListener("click", function(e) {
            inputElement.value = currentItems[index].address_components.city + ", " + currentItems[index].address_components.state ;
            geoZipcode = currentItems[index].address_components.zip ; //set zip
            myLat = currentItems[index].location.lat ;
            myLong = currentItems[index].location.lng ;
            setCookie("lat", myLat, 365);
            setCookie("lng", myLong, 365);
            callback(currentItems[index]);
  
            /* Close the list of autocompleted values: */
            closeDropDownList();
          });
  
          autocompleteItemsElement.appendChild(itemElement);
        });
      }, (err) => {
        if (!err.canceled) {
          console.log(err);
        }
      });
    });
  
    /* Add support for keyboard navigation */
    inputElement.addEventListener("keydown", function(e) {
      var autocompleteItemsElement = containerElement.querySelector(".autocomplete-items");
      if (autocompleteItemsElement) {
        var itemElements = autocompleteItemsElement.getElementsByTagName("div");
        if (e.keyCode == 40) {
          e.preventDefault();
          /*If the arrow DOWN key is pressed, increase the focusedItemIndex variable:*/
          focusedItemIndex = focusedItemIndex !== itemElements.length - 1 ? focusedItemIndex + 1 : 0;
          /*and and make the current item more visible:*/
          setActive(itemElements, focusedItemIndex);
        } else if (e.keyCode == 38) {
          e.preventDefault();
  
          /*If the arrow UP key is pressed, decrease the focusedItemIndex variable:*/
          focusedItemIndex = focusedItemIndex !== 0 ? focusedItemIndex - 1 : focusedItemIndex = (itemElements.length - 1);
          /*and and make the current item more visible:*/
          setActive(itemElements, focusedItemIndex);
        } else if (e.keyCode == 13) {
          /* If the ENTER key is pressed and value as selected, close the list*/
          e.preventDefault();
          if (focusedItemIndex > -1) {
            closeDropDownList();
          }
        }
      } else {
        if (e.keyCode == 40) {
          /* Open dropdown list again */
          var event = document.createEvent('Event');
          event.initEvent('input', true, true);
          inputElement.dispatchEvent(event);
        }
      }
    });
  
    function setActive(items, index) {
      if (!items || !items.length) return false;
  
      for (var i = 0; i < items.length; i++) {
        items[i].classList.remove("autocomplete-active");
      }
  
      /* Add class "autocomplete-active" to the active element*/
      items[index].classList.add("autocomplete-active");
  
      // Change input value and notify
      inputElement.value = currentItems[index].address_components.city + ", " + currentItems[index].address_components.state ;
      geoZipcode = currentItems[index].address_components.zip; //set zip
      myLat = currentItems[index].location.lat ;
      myLong = currentItems[index].location.lng ;
      setCookie("lat", myLat, 365);
      setCookie("lng", myLong, 365);

      callback(currentItems[index]);
    }
  
    function closeDropDownList() {
      var autocompleteItemsElement = containerElement.querySelector(".autocomplete-items");
      if (autocompleteItemsElement) {
        containerElement.removeChild(autocompleteItemsElement);
      }
  
      focusedItemIndex = -1;
    }
  
    function addIcon(buttonElement) {
      var svgElement = document.createElementNS("http://www.w3.org/2000/svg", 'svg');
      svgElement.setAttribute('viewBox', "0 0 24 24");
      svgElement.setAttribute('height', "24");
  
      var iconElement = document.createElementNS("http://www.w3.org/2000/svg", 'path');
      iconElement.setAttribute("d", "M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z");
      iconElement.setAttribute('fill', 'currentColor');
      svgElement.appendChild(iconElement);
      buttonElement.appendChild(svgElement);
    }
    
      /* Close the autocomplete dropdown when the document is clicked. 
        Skip, when a user clicks on the input field */
    document.addEventListener("click", function(e) {
      if (e.target !== inputElement) {
        closeDropDownList();
      } else if (!containerElement.querySelector(".autocomplete-items")) {
        // open dropdown list again
        var event = document.createEvent('Event');
        event.initEvent('input', true, true);
        inputElement.dispatchEvent(event);
      }
    });
  }

  addressAutocomplete(document.getElementById("zipcodeInput"), (data) => {
    console.log("Selected city: ");
    console.log(data);
  }, {
      placeholder: "Enter a city name here"
  });

  async function fetchWeatherbitForecast(zipcode) {
    const weatherbitApiKey = "85a65933d3894f0d9c7194ffa8098565";
    const weatherbitUrl2 = `https://api.weatherbit.io/v2.0/forecast/daily?postal_code=${zipcode}&country=US&key=${weatherbitApiKey}`;

    try {
        const response = await fetch(weatherbitUrl2);
        const data = await response.json();

        if (data && data.data) {
            // Use the first 7 days of data for the forecast cards
            updateSevenDayForecast(data.data.slice(1, 11));
            // Use the first 10 days of data for the graph
            updateTenDayBarGraph(data.data.slice(1, 16));

            const forecastData = data.data[0];
            document.getElementById("maxTemp").textContent = `Hi: ${convertCelsiusToFahrenheit(forecastData.max_temp)}°F`;
            document.getElementById("minTemp").textContent = `Lo: ${convertCelsiusToFahrenheit(forecastData.min_temp)}°F`;
        } else {
            console.error("Forecast data not found for the ZIP code: " + zipcode);
        }
    } catch (error) {
        console.error("Error fetching forecast data from Weatherbit for zip code: " + zipcode, error);
    }
}

function updateSevenDayForecast(forecastData) {
    const today = new Date();
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const tomorrowIndex = (today.getDay() + 1) % 7; // Get the index of tomorrow (0-6)
  
    const sevenDayForecast = document.getElementById("sevenDayForecast");
    sevenDayForecast.innerHTML = ""; // Clear existing content

    // Use the length of the forecast data to determine how many days to display
    const forecastLength = forecastData.length;

    let popValues = [];

    // Loop through the forecast data starting from tomorrow for available days
    for (let i = 0; i < forecastLength; i++) {
        const dayIndex = (tomorrowIndex + i) % 7; // Wrap around to start from Sunday again if needed
        const day = daysOfWeek[dayIndex]; // Get the day name

        const forecast = forecastData[i]; // Adjust the index to match forecast data

        let description = forecast.weather.description.toLowerCase();
        if (description.includes("thunderstorm with heavy rain") || description.includes("thunderstorm with rain")) {
            description = "scattered thunderstorms";
        }

        const highTemp = Math.round((forecast.high_temp * 1.8) + 32);
        const lowTemp = Math.round((forecast.low_temp * 1.8) + 32);
        const pop = Math.round((forecast.pop));
        const iconFilename = getIconFilename(description, true); // Assuming daytime for forecast

        popValues.push({ day, pop });

        const forecastDate = new Date();
        forecastDate.setDate(today.getDate() + i + 1); // Set date for each forecast day
        const formattedDate = `${forecastDate.getMonth() + 1}/${forecastDate.getDate()}`; // Format as mm/dd

        const card = document.createElement("div");
        card.classList.add("forecast-card");
        card.innerHTML = `
            <h3>${day}</h3>
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
        sevenDayForecast.appendChild(card);
    }

    localStorage.setItem("sevenDayPop", JSON.stringify(popValues));


}

function updateTenDayBarGraph(forecastData) {
  const today = new Date();

  // Use the length of the forecast data to determine how many days to display
  const forecastLength = forecastData.length;

  // Generate labels and data starting from tomorrow
  const labels = [];
  const highTemps = [];
  const weatherIcons = [];

  for (let i = 0; i < forecastLength; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i + 1);
    const dayLabel = `${date.getMonth() + 1}/${date.getDate()}`; // Format as mm/dd
    labels.push(dayLabel); // Add date label to labels

    const forecast = forecastData[i]; // Adjust index to match forecast data
    highTemps.push(Math.round(((forecast.high_temp * 1.8) + 32))); // Add high temperature to data

    const description = forecast.weather.description.toLowerCase();
    weatherIcons.push(`icons/day/${getIconFilename(description, true)}`); // Add icon filename
  }

  const ctx = document.getElementById('sevenDayBarGraph').getContext('2d');

  const minValue = Math.min(...highTemps);
  const minScaleValue = minValue - 20;
  const maxScaleValue = Math.max(...highTemps) + 10; // Extend max value by 10 degrees

  // Destroy existing chart if it exists
  if (window.myBarChart) {
    window.myBarChart.destroy();
  }

  window.myBarChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        data: highTemps,
        backgroundColor: 'rgba(0, 0, 139, 1)', // Dark blue solid color
        borderColor: 'rgba(0, 0, 139, 1)', // Dark blue solid color
        borderWidth: 1
      }]
    },
    options: {
      scales: {
        x: {
          title: {
            display: false, // Hide x-axis title
          },
          ticks: {
            color: 'white', // White color for x-axis labels
            callback: function (value, index) {
              return labels[index];
            },
            maxRotation: 90,
            minRotation: 90
          }
        },
        y: {
          title: {
            display: false, // Hide y-axis title
          },
          min: minScaleValue,
          max: maxScaleValue, // Extend y-axis max value
          ticks: {
            stepSize: 10,
            callback: function (value) { return value + "°F"; },
            color: 'white' // White color for y-axis labels
          }
        }
      },
      plugins: {
        title: {
          display: true,
          text: 'Long-term Temperature Trend',
          align: 'center',
          color: 'white',
          font: {
            size: 22,
            color: 'white' // White color for chart title
          },
          padding: {
            top: 1,
            bottom: 40
          }
        },
        legend: {
          display: false // This will hide the legend
        },
        tooltip: {
          enabled: false, // Disable default tooltips
          external: function (context) {
            const tooltipEl = document.getElementById('chartjs-tooltip');

            // Create tooltip element if it doesn't exist
            if (!tooltipEl) {
              const tooltipEl = document.createElement('div');
              tooltipEl.id = 'chartjs-tooltip';
              tooltipEl.innerHTML = '<div class="tooltip-container"></div>';
              document.body.appendChild(tooltipEl);
            }

            const tooltipModel = context.tooltip;

            // Hide if no tooltip
            if (tooltipModel.opacity === 0) {
              tooltipEl.style.opacity = 0;
              return;
            }

            // Set caret position
            tooltipEl.classList.remove('above', 'below', 'no-transform');
            if (tooltipModel.yAlign) {
              tooltipEl.classList.add(tooltipModel.yAlign);
            } else {
              tooltipEl.classList.add('no-transform');
            }

            function getBody(bodyItem) {
              return bodyItem.lines;
            }

            // Set text
            if (tooltipModel.body) {
              const titleLines = tooltipModel.title || [];
              const bodyLines = tooltipModel.body.map(getBody);

              let innerHtml = '<div class="tooltip-header">';

              titleLines.forEach(function (title) {
                innerHtml += '<div>' + title + '</div>';
              });
              innerHtml += '</div>';

              innerHtml += '<div class="tooltip-body">';
              bodyLines.forEach(function (body, i) {
                const icon = weatherIcons[tooltipModel.dataPoints[i].dataIndex];
                const temperature = highTemps[tooltipModel.dataPoints[i].dataIndex];
                innerHtml += '<img src="' + icon + '" class="tooltip-icon" alt="Weather icon">';
                innerHtml += '<div class="tooltip-temp">' + temperature + '°F</div>';
              });
              innerHtml += '</div>';

              const tooltipContainer = tooltipEl.querySelector('.tooltip-container');
              tooltipContainer.innerHTML = innerHtml;
            }

            const position = context.chart.canvas.getBoundingClientRect();

            // Display, position, and set styles for font
            tooltipEl.style.opacity = 1;
            tooltipEl.style.position = 'absolute';

            const tooltipWidth = tooltipEl.offsetWidth;
            const tooltipHeight = tooltipEl.offsetHeight;

            const caretX = tooltipModel.caretX;
            const caretY = tooltipModel.caretY;

            // Center the tooltip horizontally over the bar
            const centeredX = position.left + window.pageXOffset + caretX - tooltipWidth / 2;
            const topY = position.top + window.pageYOffset + caretY - tooltipHeight - 10; // Adjust the top position as needed

            tooltipEl.style.left = centeredX + 'px';
            tooltipEl.style.top = topY + 'px';

            tooltipEl.style.fontFamily = tooltipModel.options.bodyFont.family;
            tooltipEl.style.fontSize = tooltipModel.options.bodyFont.size + 'px';
            tooltipEl.style.fontStyle = tooltipModel.options.bodyFont.style;
            tooltipEl.style.padding = tooltipModel.padding + 'px ' + tooltipModel.padding + 'px';
            tooltipEl.style.pointerEvents = 'none';
          }
        }
      }
    },
    dataset: {
      barPercentage: 1.0, // Adjust bar width
      categoryPercentage: 1.0 // Adjust space between bars
    }
  });
}

function updateForecastDisplay(data) {
  const forecastContainer = document.getElementById('sevenDayForecast');
  forecastContainer.innerHTML = ''; // Clear previous content

  data.forEach(item => {
      const box = document.createElement('div');
      box.className = 'forecast-box';

      const icon = document.createElement('img');
      icon.src = `path/to/icons/${item.icon}`; // Ensure this path is correct
      icon.className = 'forecast-icon';
      box.appendChild(icon);

      const info = document.createElement('div');
      info.className = 'weather-info';
      info.innerHTML = `<p>${item.day}</p><p>${item.tempMax}°C / ${item.tempMin}°C</p>`;
      box.appendChild(info);

      forecastContainer.appendChild(box);
  });
}

document.getElementById('refreshButton').addEventListener('click', function() {
  location.reload(); // Refresh the page
});

document.addEventListener('DOMContentLoaded', () => {
  const iframeContainer = document.querySelector('.iframe-container');
  const iframe = iframeContainer.querySelector('iframe');
  const overlay = iframeContainer.querySelector('.iframe-overlay');

  // Handle "tap to activate" functionality
  overlay.addEventListener('click', () => {
    iframeContainer.classList.remove('inactive'); // Remove inactive class
    iframeContainer.classList.add('active'); // Add active class
  });

  // Deactivate iframe if clicking outside
  document.addEventListener('click', (e) => {
    if (!iframeContainer.contains(e.target)) {
      iframeContainer.classList.add('inactive');
      iframeContainer.classList.remove('active');
    }
  });

  // Prevent iframe from hijacking scroll events
  iframe.addEventListener('touchstart', (e) => {
    if (!iframeContainer.classList.contains('active')) {
      e.preventDefault(); // Prevent iframe from capturing touch events
      const touch = e.touches[0];
      window.scrollBy(0, touch.clientY > 0 ? -10 : 10); // Simulate scrolling
    }
  });
});

