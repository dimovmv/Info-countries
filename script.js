"use strict";

const btn = document.querySelector(".btn-country");
const countriesContainer = document.querySelector(".countries");
const whereAmIbtn = document.querySelector(".where_am_i_button");

///////////////////////////////
// Get Country data
const renderCountry = function (data, tag) {
  const first = function (obj) {
    return Object.values(obj)[0];
  };
  const name = data.name.common;
  const flag = data.flags.png;
  const language = first(data.languages);
  const currency = first(data.currencies).name;
  const html = `
  <article class="country ${tag === "alpha" ? "neighbour" : ""}">
    <img class="country__img" src="${flag}" />
    <div class="country__data">
      <h3 class="country__name">${name}</h3>
      <h4 class="country__region">${data.region}</h4>
      <p class="country__row"><span>🏙</span>${data.capital}</p>
      <p class="country__row"><span>👫</span>${(
        +data.population / 1000000
      ).toFixed(2)}m people</p>     
      <p class="country__row"><span>🗣️</span>${language}</p>    
      <p class="country__row"><span>💰</span>${currency}</p>
    </div>
  </article>
  `;
  countriesContainer.insertAdjacentHTML("beforeend", html);
  return data;
  // countriesContainer.style.opacity = 1;
};

//  Fetcher
const fetcher = function (country, search) {
  return fetch(
    `https://restcountries.com/v3.1/${search}/${country}?fullText=true`
  ).then(response => {
    if (!response.ok)
      throw new Error(`Country not found! (${response.status})`);
    return response.json();
  });
};

const renderError = function (e) {
  countriesContainer.insertAdjacentText("beforeend", e.message);
  // countriesContainer.style.opacity = 1;
};

// Display country data and neighbours (if any)

const getCountryAndNeighbour = function (country) {
  fetcher(country, "name")
    .then(([data]) => renderCountry(data, ""))
    .then(data =>
      data.borders?.forEach(neighbour => {
        fetcher(neighbour, "alpha").then(([neighbour]) =>
          renderCountry(neighbour, "alpha")
        );
      })
    )
    .catch(e => renderError(e))
    .finally(() => (countriesContainer.style.opacity = 1));
};

btn.addEventListener("click", e => {
  e.preventDefault();
  countriesContainer.style.opacity = 0;
  countriesContainer.innerHTML = "";
  const country = window.prompt("Please enter a country!").toLowerCase();
  getCountryAndNeighbour(country);
});

/////////////////////////////////////
// Returning Values from Async Functions
// // WHERE AM I #####
const getPosition = function () {
  return new Promise(function (resolve, reject) {
    navigator.geolocation.getCurrentPosition(resolve, reject);
  });
};

const whereAmI = async function () {
  try {
    countriesContainer.innerHTML = "";
    // Geolocation
    const pos = await getPosition();
    const { latitude: lat, longitude: lng } = pos.coords;

    // Reverse geocoding
    const resGeo = await fetch(`https://geocode.xyz/${lat},${lng}?geoit=json`);
    if (!resGeo.ok) throw new Error("Problem getting location data");
    const dataGeo = await resGeo.json();

    // Country data
    const res = await fetch(
      `https://restcountries.com/v3.1/name/${dataGeo.country}`
    );
    if (!resGeo.ok) throw new Error("Problem getting country");
    const data = await res.json();
    renderCountry(data[0]);
    return `You are in ${dataGeo.city}, ${dataGeo.country}`;
  } catch (err) {
    console.error(`${err} 💥`);
    renderError(`💥 ${err.message}`);

    // Reject promise returned from async function
    throw err;
  }
};
whereAmIbtn.addEventListener("click", whereAmI);
