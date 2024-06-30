const h1 = document.querySelector("span");
const day = document.querySelector(".date");
const time = document.querySelector(".time");
const add = document.querySelector(".add");
const main = document.querySelector("main");
const icon = document.querySelector(".icon");
const hourly = document.querySelector(".hourly");
const daily = document.querySelector(".daily");
const places = document.querySelector(".places");
const input = document.querySelector("input");
const clear = document.querySelector(".clear");
const daysOfWeek = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const weatherCode = [
  {
    0: '<i class="fa-regular fa-sun"></i>',
  },
  {
    1: '<i class="fa-regular fa-sun"></i>',
  },
  {
    2: '<i class="fa-solid fa-cloud-sun"></i>',
  },
  {
    3: '<i class="fa-solid fa-cloud"></i>',
  },
  {
    61: '<i class="fa-solid fa-cloud-rain"></i>',
  },

  {
    63: '<i class="fa-solid fa-cloud-rain"></i>',
  },
  {
    65: '<i class="fa-solid fa-cloud-rain"></i>',
  },
  {
    71: '<i class="fa-solid fa-cloud-meatball"></i>',
  },
  {
    73: '<i class="fa-solid fa-cloud-meatball"></i>',
  },
  {
    75: '<i class="fa-solid fa-cloud-meatball"></i>',
  },
  {
    80: '<i class="fa-solid fa-cloud-rain"></i>',
  },
  {
    81: '<i class="fa-solid fa-cloud-rain"></i>',
  },
  {
    82: '<i class="fa-solid fa-cloud-rain"></i>',
  },
];

const localTime = new Date();
const date = localTime.getDay();
day.innerHTML = daysOfWeek[date];
setInterval(() => {
  const localTime = new Date();
  const hours = localTime.getHours();
  const minutes = localTime.getMinutes();
  time.innerHTML = `${hours}:${minutes < 10 ? "0" : ""}${minutes}`;
}, 1000);

navigator.geolocation.getCurrentPosition(function (position) {
  const latitude = position.coords.latitude;
  const longitude = position.coords.longitude;
  fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=apparent_temperature,weather_code&minutely_15=apparent_temperature&hourly=apparent_temperature&daily=weather_code,apparent_temperature_max,apparent_temperature_min&timezone=auto&past_minutely_15=1&forecast_minutely_15=4`
  )
    .then((response) => response.json())
    .then((resp) => {
      h1.innerHTML = resp.current.apparent_temperature;
      icons(icon, resp.current);
      for (let i = 0; i < 24; i++) {
        const temp = resp.hourly.apparent_temperature[i];
        const time = resp.hourly.time[i];
        const date = new Date(time);
        const hour = date.getHours();
        const minutes = date.getMinutes();
        const div = document.createElement("div");
        div.innerHTML = `
      <h3>${hour < 10 ? "0" : ""}${hour}:${
          minutes < 10 ? "0" : ""
        }${minutes}</h3>
      <h2>${temp}°C</h2>
      `;
        hourly.appendChild(div);
      }
      for (let i = 0; i < 7; i++) {
        const max = resp.daily.apparent_temperature_max[i];
        const min = resp.daily.apparent_temperature_min[i];
        const time = resp.daily.time[i];
        const date = new Date(time);
        const day = date.getDay();
        const future = daysOfWeek[day];
        const div = document.createElement("div");
        const code = resp.daily.weather_code[i];
        let icon = "";
        weatherCode.forEach((obj) => {
          const key = Object.keys(obj)[0];
          if (parseInt(key) === code) {
            icon = obj[key];
          }
        });
        div.innerHTML = `
      <h2>${future}</h2>
      <h3>${max}°C - ${min}°C</h3>
      <h2>${icon}</h2>
      `;
        daily.appendChild(div);
      }
    })
    .catch((error) => {
      console.error("Error occurred while fetching weather data:", error);
    });
});

let num = 0;
const array = JSON.parse(localStorage.getItem("places")) || [];
if (array.length > 0) {
  clear.style.display = "initial";
}
array.forEach((data) => {
  CreateDiv(data, data.timezone);
});
clear.addEventListener("click", () => {
  localStorage.clear();
});
add.addEventListener("click", newPlaces);
function newPlaces() {
  const value = input.value;

  fetch(`https://nominatim.openstreetmap.org/search?q=${value}&format=json`)
    .then((response) => response.json())
    .then((resp) => {
      const longitude = resp[0].lon;
      const latitude = resp[0].lat;
      fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=apparent_temperature,weather_code&timezone=auto&forecast_days=1`
      )
        .then((response) => response.json())
        .then((resp) => {
          const temp = resp.current.apparent_temperature;
          const time = resp.current.time;
          const timezone = resp.timezone;
          const date = new Date(time);
          const day = date.getDay();
          const future = daysOfWeek[day];
          const divData = {
            temp: temp,
            city: value.toUpperCase(),
            future: future,
            timezone: timezone,
          };
          array.push(divData);
          localStorage.setItem("places", JSON.stringify(array));
          CreateDiv(divData, resp.timezone);
          clear.style.display = "initial";
          input.value = "";
        });
    })
    .catch((error) => {
      console.error("User Entered Invalid Name", error);
      input.style.border = "2px solid red";
    });
}
function CreateDiv(data, timezone) {
  const div = document.createElement("div");
  const DateTime = luxon.DateTime.now().setZone(timezone);
  const currentTime = DateTime.toFormat("HH:mm");

  div.innerHTML = `<div style="display: flex"><h1>${data.temp}°C</h1></div>
      <div> <h2>${data.city}</h2>
      <h3>${data.future}</h3>
      <h3 class="currentTime">${currentTime} <span style="font-size: small">(Difference may be up to 1 minute)</span></h3></div>`;

  places.append(div);
  setInterval(() => {
    const DateTime = luxon.DateTime.now().setZone(data.timezone);
    const currentTime = DateTime.toFormat("HH:mm");
    div.querySelector(".currentTime").textContent = currentTime;
  }, 60000);
}

function icons(where, when) {
  if (when.weather_code === 0 || when.weather_code === 1) {
    where.innerHTML = '<i class="fa-regular fa-sun"></i>';
  } else if (when.weather_code === 2) {
    where.innerHTML = '<i class="fa-solid fa-cloud-sun"></i>';
  } else if (when.weather_code === 3) {
    where.innerHTML = '<i class="fa-solid fa-cloud"></i>';
  } else if (
    when.weather_code === 61 ||
    when.weather_code === 63 ||
    when.weather_code === 65
  ) {
    where.innerHTML = '<i class="fa-solid fa-cloud-rain"></i>';
  } else if (
    when.weather_code === 71 ||
    when.weather_code === 73 ||
    when.weather_code === 75
  ) {
    where.innerHTML = '<i class="fa-solid fa-cloud-meatball"></i>';
  }
}
