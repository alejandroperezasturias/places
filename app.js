// Global Stuff
const mappKey =
  "pk.eyJ1IjoiYWxleGNhYmFuYXF1aW50YSIsImEiOiJja2E1YWMwYjQxMjNvM2hwbnY2N2tnNW93In0.ewo_YDu86yWLu-uSu9tp-Q";
const auth = "FD0ESUZR33KCKPXKTSZ4SAJHFA0P31VNK3Y4ZU0CVLII5AAV";
const secret = "DIGQZIR51ONYXRUAIHVNBDR3S0DIYPAAHABNYUFKARCMHMKQ";
const authPexels = "563492ad6f91700001000001a92d4e50b1df47eb827e519d1c777b22";
const listPlaces = document.querySelector(".list-places");
const input = document.querySelector("input");
const submitBottom = document.querySelector(".submit-btn");
const categoryButtons = document.querySelectorAll(".category");
const iTag = document.querySelector("i");
const moreButtonGeneral = document.querySelector(".more");
let titleName = document.querySelector(".title");
let titleNameList = titleName.textContent.split("");
let focusMap;
let searchValue = "Prague";
let currentMarkers = [];
let pictureCategories = {};
let activeCategory = [];
let activeTracker = [];
let activePointer = [];
let offsetValue = 4;
let sectionSearch = "food";

// Logo Name Animation

titleName.innerHTML = "";
titleNameList.forEach((letter) => {
  titleName.innerHTML += "<span>" + letter + "</span>";
});
let ticker = 0;
let timer = setInterval(onTick, 50);

// Event Listeners

input.addEventListener("input", function (e) {
  searchValue = e.target.value;
});

// Main Search Button
submitBottom.addEventListener("click", searchforValueandSection);

// Making The Search Bar Prettier
submitBottom.addEventListener("mouseover", function () {
  input.classList.add("input-change-background-color");
  iTag.classList.add("move-i");
});

submitBottom.addEventListener("mouseout", function () {
  input.classList.remove("input-change-background-color");
  iTag.classList.remove("move-i");
});

// Chosing the categories
categoryButtons.forEach((button) => {
  button.addEventListener("click", (e) => {
    //   Only One Category Selected at a Time
    activeCategory.push(button);
    if (activeCategory.length === 1) {
      button.classList.add("active-category-button");
      sectionSearch = e.target.id;
    } else if (activeCategory[activeCategory.length - 2] !== button) {
      button.classList.add("active-category-button");
      activeCategory[activeCategory.length - 2].classList.remove(
        "active-category-button"
      );
      sectionSearch = e.target.id;
    } else if (activeCategory[activeCategory.length - 2] === button) {
      button.classList.toggle("active-category-button");
      sectionSearch = "";
    }
    if (activeCategory.length > 2) {
      activeCategory.shift();
    }
  });
});

// Get more similar recommendations
moreButtonGeneral.addEventListener("click", (e) => {
  clear();
  apiCallForShowMore(searchValue, sectionSearch, offsetValue);
  offsetValue += 4;
});

// Start Map

mapboxgl.accessToken = mappKey;
var map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/mapbox/light-v10",
  zoom: 10,
  center: [40, 3.7],
  trackResize: true,
});

map.on("dataloading", () => {
  map.resize();
});

// Functions

// Logo animation
function onTick() {
  const span = titleName.querySelectorAll("span")[ticker];
  span.classList.add("fade");
  ticker++;
  if (ticker === titleNameList.length) {
    stopInterval();
  }
}

function stopInterval() {
  clearInterval(timer);
  timer = null;
  return;
}

// Main API Call
async function apiCall(x, section = "food") {
  const dataFetch = await fetch(
    `https://api.foursquare.com/v2/venues/explore?near=${x}
      &client_id=${auth}
      &client_secret=${secret}
      &v=20180323&limit=4
      &offset=0
      &section=${section}
      &sortByPopularity=1`
  );
  const data = await dataFetch.json();
  const venues = data.response.groups[0].items;
  //   Create Unique Categories to minimize Api Calls
  flytoDestination(venues[0].venue.location.lng, venues[0].venue.location.lat);
  updateMapandList(venues);
}

function searchforValueandSection(e) {
  e.preventDefault();
  clear();
  offsetValue = 5;
  //   Catch Error
  apiCall(searchValue, sectionSearch);
  input.value = "";
}

function flytoDestination(x, y) {
  //   Fly to the location
  map.flyTo({
    center: [x, y],
    essential: true, // this animation is considered essential with respect to prefers-reduced-motion
  });
}

async function apiCallPictures(category) {
  const searachItem = category + " " + sectionSearch;
  // Page = 2 to avoid garlic pictures :D
  const dataFetch = await fetch(
    `https://api.pexels.com/v1/search?query=${searachItem}+query&per_page=3&page=2`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: authPexels,
      },
    }
  );
  const data = await dataFetch.json();
  pictureCategories[category] = data.photos[2].src.tiny;
}

function createList(x, y, categoryID, index) {
  // Main Div
  const place = document.createElement("div");
  place.setAttribute("id", categoryID);
  place.classList.add(index);
  place.classList.add("places");
  //   Button Wrapper
  const buttonWrapper = document.createElement("div");
  buttonWrapper.classList.add("places-button-wrapper");
  //   Button Show on Map
  const buttonShowMap = document.createElement("button");
  buttonWrapper.appendChild(buttonShowMap);
  buttonShowMap.innerHTML = '<i class="fas fa-map-signs"></i>';
  buttonShowMap.classList.add("showMapButton");
  //   Image Wrapper for correct Image CSS styling
  const imgWrapper = document.createElement("div");
  const imageofPlace = document.createElement("img");
  imageofPlace.classList.add("imagePlace");
  imgWrapper.classList.add("imageWrapper");
  imageofPlace.src = pictureCategories[y];
  imgWrapper.appendChild(imageofPlace);
  //  Information about the place
  const categoriesDiv = document.createElement("div");
  const infoDiv = document.createElement("div");
  infoDiv.classList.add("infodiv");
  // Name
  const name = document.createElement("div");
  name.classList.add("namediv");
  name.innerHTML = x.name;
  infoDiv.appendChild(name);
  // Category
  categoriesDiv.classList.add("categorydiv");
  name.innerHTML = x.name;
  categoriesDiv.innerHTML = y;
  categoriesDiv.classList.add("categorydiv");
  infoDiv.appendChild(categoriesDiv);
  //   Append to place
  place.appendChild(imgWrapper);
  place.appendChild(infoDiv);
  place.appendChild(buttonWrapper);
  // Append to HTLM
  listPlaces.appendChild(place);
  //   Show on Map Functionality
  buttonShowMap.addEventListener("click", function (e) {
    // Switching One to Another Functionality

    const indexMarker = e.target.parentNode.parentNode.classList[0];
    // Track the Buttons that is clicked the current and past one
    activeTracker.push(buttonShowMap);
    // Track the active map marker the current and past one
    activePointer.push(currentMarkers[indexMarker]._element);

    if (activeTracker.length === 1) {
      currentMarkers[indexMarker]._element.classList.add("bounce");
      buttonShowMap.classList.add("active-show-map-button");
      map.flyTo({
        // Chose the first destination as the flying coordinates
        center: [
          currentMarkers[indexMarker]._lngLat.lng,
          currentMarkers[indexMarker]._lngLat.lat,
        ],
        essential: true, // this animation is considered essential with respect to prefers-reduced-motion
      });
    } else if (activeTracker[activeTracker.length - 2] !== buttonShowMap) {
      // Add classes to Active Button
      buttonShowMap.classList.add("active-show-map-button");
      currentMarkers[indexMarker]._element.classList.add("bounce");
      map.flyTo({
        // Chose the first destination as the flying coordinates
        center: [
          currentMarkers[indexMarker]._lngLat.lng,
          currentMarkers[indexMarker]._lngLat.lat,
        ],
        essential: true, // this animation is considered essential with respect to prefers-reduced-motion
      });
      // Remove classess from the previously active classess
      activePointer[activePointer.length - 2].classList.remove("bounce");
      activeTracker[activeTracker.length - 2].classList.remove(
        "active-show-map-button"
      );
    } else if (activeTracker[activeTracker.length - 2] === buttonShowMap) {
      buttonShowMap.classList.toggle("active-show-map-button");
      activePointer[activePointer.length - 2].classList.toggle("bounce");
    }
    // Clean the both trackers. We just need the current and previous state
    if (activeTracker.length > 2 && activePointer.length > 2) {
      activeTracker.shift();
      activePointer.shift();
    }
  });
}

function addPositiontoMap(longitude, latitude, name, category, address) {
  let el = document.createElement("div");
  el.className = "marker";
  const marker = new mapboxgl.Marker(el)
    .setLngLat([longitude, latitude])
    .setPopup(
      new mapboxgl.Popup({ offset: 25 }) // add popups
        .setHTML(
          "<h3>" + name + "</h3><p>" + category + "</p><p>" + address + "</p>"
        )
    )
    .addTo(map);
  currentMarkers.push(marker);
}

function clear() {
  // Delete List Items
  while (listPlaces.firstChild) {
    listPlaces.removeChild(listPlaces.lastChild);
  }
  //   Delete Markers
  if (currentMarkers !== null) {
    currentMarkers.forEach((marker) => {
      marker.remove();
    });
    currentMarkers = [];
  }
}

async function apiCallForShowMore(
  searchValue,
  thePLaceTargetCategory,
  offsetValue
) {
  const dataFetch = await fetch(
    `https://api.foursquare.com/v2/venues/explore?near=${searchValue}
      &client_id=${auth}
      &client_secret=${secret}
      &v=20180323
      &limit=4
      &offset=${offsetValue}
      &sortByPopularity=1
      &section=${thePLaceTargetCategory}`
  );
  const data = await dataFetch.json();
  const venues = data.response.groups[0].items;
  flytoDestination(venues[0].venue.location.lng, venues[0].venue.location.lat);
  updateMapandList(venues);
}

function updateMapandList(venues) {
  venues.forEach((venue) => {
    const category = venue.venue.categories[0].shortName;
    if (!(category in pictureCategories)) {
      apiCallPictures(category);
    }
  });
  venues.forEach((venue, index) => {
    // This is the Map PopUps
    setTimeout(function () {
      const longitude = venue.venue.location.lng;
      const latitude = venue.venue.location.lat;
      const category = venue.venue.categories[0].shortName;
      const categoryID = venue.venue.categories[0].id;
      const address = venue.venue.location.address;
      let name = venue.venue.name;
      // Map Work
      addPositiontoMap(longitude, latitude, name, category, address);
      // List Work
      createList(venue.venue, category, categoryID, index);
    }, 1000);
  });
}

apiCall("prague");
