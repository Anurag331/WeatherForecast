"use strict";
const apiKey = "dcb27cf8e471c57b3de03458239f2788";

// Fetch current weather data
document.addEventListener("DOMContentLoaded", function () {
  function fetchCurrentWeather(city) {
    fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`
    )
      .then((response) => response.json())
      .then((data) => {
        // Extract relevant data from the response
        const temperature = Math.round(data.main.temp - 273.15);
        const weatherDescription = data.weather[0].description;
        const weatherIcon = data.weather[0].icon;
        const cityName = data.name;
        // Create HTML elements to display the current weather
        const currentContainer = document.querySelector(".current-container");
        currentContainer.innerHTML = `
            <div class="current-weather">
              <div>
              <p>City: ${cityName}
              </div>
              <div>
              <p>Temperature: ${temperature}°C</p>
              </div>
              <div>
              <p>Weather: ${weatherDescription}</p>
              </div>
              <div>
              <img  src="https://openweathermap.org/img/w/${weatherIcon}.png" alt="Weather Icon">
              </div>
            </div>
          `;
      })
      .catch((error) => {
        console.log("Error:", error);
      });
  }

  function fetchTodayForecast(city) {
    fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}`
    )
      .then((response) => response.json())
      .then((data) => {
        const todayForecastContainer = document.querySelector(
          ".today-forecast-container"
        );
        todayForecastContainer.innerHTML = "";

        for (let i = 0; i < 6; i++) {
          const forecast = data["list"][i];
          const date = forecast.dt_txt.split(" ")[0];
          const time = forecast.dt_txt.split(" ")[1];
          const temp = Math.round(forecast.main.temp - 273.15);
          const icon = forecast["weather"][0].icon;
          const description = forecast["weather"][0].description;

          const todayForecast = document.createElement("div");
          todayForecast.classList.add("today-forecast");
          todayForecast.innerHTML = `
          <p>${date}</p>
          <p>${time}</p>
          <p>${temp} °C</p>
          <img src="http://openweathermap.org/img/w/${icon}.png" alt="Weather Icon">
          <p> ${description}</p>`;
          todayForecastContainer.appendChild(todayForecast);
        }
      });
  }

  // Fetch 7-day weather forecast
  function fetchWeatherForecast(city) {
    fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}`
    )
      .then((response) => response.json())
      .then((data) => {
        // Group forecast data by day
        const forecastByDay = {};
        data.list.forEach((forecast) => {
          const date = forecast.dt_txt.split(" ")[0];
          if (!forecastByDay[date]) {
            forecastByDay[date] = [];
          }
          forecastByDay[date].push(forecast);
        });

        // Create HTML elements to display the forecast
        const forecastContainer = document.querySelector(".forecast-container");
        forecastContainer.innerHTML = "";

        // Display today's weather
        const todayDate = new Date().toISOString().split("T")[0];
        if (forecastByDay[todayDate]) {
          const todayForecasts = forecastByDay[todayDate];
          const todayAverageTemp = Math.round(
            todayForecasts.reduce(
              (total, forecast) => total + (forecast.main.temp - 273.15),
              0
            ) / todayForecasts.length
          );
          const todayWeatherDescription =
            todayForecasts[0].weather[0].description;
          const todayWeatherIcon = todayForecasts[0].weather[0].icon;

          const todayCard = document.createElement("div");
          todayCard.classList.add("forecast-card");
          todayCard.innerHTML = `
          <p>Date: ${todayDate}</p>
          <p>Temperature: ${todayAverageTemp}°C</p>
          <p>Weather: ${todayWeatherDescription}</p>
          <img src="http://openweathermap.org/img/w/${todayWeatherIcon}.png" alt="Weather Icon">
        `;
          forecastContainer.appendChild(todayCard);
          delete forecastByDay[todayDate]; // Remove today's forecasts from the list
        }
        // Iterate over each day's forecast data
        Object.entries(forecastByDay).forEach(([date, forecasts]) => {
          // Calculate average temperature for the day
          const averageTemp = Math.round(
            forecasts.reduce(
              (total, forecast) => total + (forecast.main.temp - 273.15),
              0
            ) / forecasts.length
          );
          const weatherDescription = forecasts[0].weather[0].description;
          const weatherIcon = forecasts[0].weather[0].icon;

          // Create a forecast card for the day
          const forecastCard = document.createElement("div");
          forecastCard.classList.add("forecast-card");
          forecastCard.innerHTML = `
          <p>Date: ${date}</p>
          <p>Temperature: ${averageTemp}°C</p>
          <p>Weather: ${weatherDescription}</p>
          <img src="http://openweathermap.org/img/w/${weatherIcon}.png" alt="Weather Icon">
        `;
          forecastContainer.appendChild(forecastCard);
        });
      })
      .catch((error) => {
        console.log("Error:", error);
      });
  }

  //new code

  function fetchHistory(latitude, longitude) {
    fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&past_days=7&hourly=temperature_2m`
    )
      .then((response) => response.json())
      .then((data) => {
        const historicalContainer = document.querySelector(
          ".historical-container"
        );
        historicalContainer.innerHTML = "";

        let averageTemp = 0;
        for (let i = 0; i < 168; i += 24) {
          //24 hours * 7days = 168 hours
          const dateString = data["hourly"]["time"][i];
          const date = dateString.substring(0, 10); //example -

          let limit = i + 24;
          for (let x = i; x < limit && x < 168; x++) {
            averageTemp += data["hourly"]["temperature_2m"][x];
          }
          averageTemp = averageTemp / 24;

          const historicalCard = document.createElement("div");
          historicalCard.classList.add("historical-card");
          historicalCard.innerHTML = `
            <p>Date: ${date}</p>
            <p>Temperature: ${Math.round(averageTemp)}°C</p>
          `;
          historicalContainer.appendChild(historicalCard);
        }
      });
  }

  function helper(city) {
    fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`
    )
      .then((response) => response.json())
      .then((data) => {
        if (data.name) {
          let cityName = data.name;

          const longitude = data["coord"]["lon"];
          const latitude = data["coord"]["lat"];

          const url = `https://trueway-geocoding.p.rapidapi.com/ReverseGeocode?location=${latitude}%2C${longitude}&language=en`;
          const options = {
            method: "GET",
            headers: {
              "X-RapidAPI-Key":
                "769b551702msh46c9085e47fc063p1e8bfdjsn5099929a58eb",
              "X-RapidAPI-Host": "trueway-geocoding.p.rapidapi.com",
            },
          };

          fetch(url, options)
            .then((response) => response.json())
            .then((data) => {
              cityName = data["results"][0]["locality"];
              console.log(cityName);
              fetchHistory(latitude, longitude);
              fetchCurrentWeather(cityName);
              fetchWeatherForecast(cityName);
              fetchTodayForecast(cityName);
            });
          // console.log(cityName);
        } else {
          alert("City not found.");
        }
      })
      .catch((error) => console.error("Error fetching data:", error));
  }

  // Search functionality
  const searchForm = document.querySelector("#search-form");

  searchForm.addEventListener("submit", function (e) {
    e.preventDefault(); //to stop default behaviour of event.
    const searchInput = document.querySelector("#search-input");
    const city = searchInput.value;
    if (city) {
      helper(city);
      // fetchTodayForecast(city);
    }
    searchInput.value = "";
  });

  /*****************************************************************************************************************************/
  //Code for handling favourites

  document
    .getElementById("add-to-fav-btn")
    .addEventListener("click", (event) => {
      event.preventDefault(); // Prevent form submission (if the button is inside a form)
      const cityInput = document.getElementById("search-input");
      const city = cityInput.value.trim(); // Get the city from the input and trim any leading/trailing whitespace

      if (city !== "") {
        addToFavorites(city); // Call the addToFavorites function
        cityInput.value = ""; // Clear the input field after adding to favorites
        displayFavorites(); // Update the favorites list in the UI
      }
    });

  function addToFavorites(city) {
    let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

    city = city.toUpperCase();
    if (!favorites.includes(city) && favorites.length < 3) {
      console.log(favorites.length);
      favorites.push(city);
      localStorage.setItem("favorites", JSON.stringify(favorites));
    } else if (favorites.length === 3) {
      alert("Only 3 Favourites are supported");
    } else {
      alert(`City ${city} already present in Favourites`);
    }
  }

  function displayFavorites() {
    let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
    let favoritesList = document.getElementById("favoritesList");

    // Clear the existing list to avoid duplicates
    favoritesList.innerHTML = "";

    favorites.forEach((city) => {
      // Create a list item for each favorite city
      let listItem = document.createElement("li");

      // Create a span element to display the city name
      let cityNameSpan = document.createElement("span");
      cityNameSpan.textContent = city;

      // Create a cross button to delete the city
      let crossButton = document.createElement("button");
      crossButton.textContent = "❌"; // You can use any suitable icon for the cross button

      // Add click event to the city name
      cityNameSpan.addEventListener("click", () => {
        helper(city);
      });

      // Add click event to the cross button
      crossButton.addEventListener("click", (event) => {
        event.stopPropagation(); // Prevent the listItem click event from being triggered

        // Call a function to delete the city from favorites
        deleteFromFavorites(city);
        // After deleting, update the favorites list in the UI
        displayFavorites();
      });

      // Add the city name and cross button to the list item
      listItem.appendChild(cityNameSpan);
      listItem.appendChild(crossButton);

      favoritesList.appendChild(listItem);
    });
  }

  function deleteFromFavorites(city) {
    let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

    // Find the index of the city in the favorites array
    const index = favorites.indexOf(city);

    if (index !== -1) {
      // Remove the city from favorites using splice
      favorites.splice(index, 1);
      localStorage.setItem("favorites", JSON.stringify(favorites));
    }
  }

  // Call displayFavorites after page load
  window.addEventListener("load", () => {
    displayFavorites();
  });

  /**************************************************************************************************************************************/
});

// Function to toggle between light mode and dark mode
function toggleMode() {
  const body = document.body;
  body.classList.toggle("light-mode");
  body.classList.toggle("dark-mode");
}
