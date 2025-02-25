
'use strict';

/** Helper function to generate a Google Maps directions URL */
function generateDirectionsURL(origin, destination) {
const googleMapsUrlBase = 'https://www.google.com/maps/dir/?';
const searchParams = new URLSearchParams('api=1');
searchParams.append('origin', origin);
const destinationParam = [];

// Add title to destinationParam except in cases where Quick Builder set
// the title to the first line of the address

// if (destination.title !== destination.address1) {
// destinationParam.push(destination.title);
// }

destinationParam.push(destination.address);
searchParams.append('destination', destinationParam.join(','));
return googleMapsUrlBase + searchParams.toString();
}

/**
 * Defines an instance of the Locator+ solution, to be instantiated
 * when the Maps library is loaded.
 */
function LocatorPlus(configuration) {
const locator = this;

locator.locations = configuration.locations || [];
locator.capabilities = configuration.capabilities || {};

const mapEl = document.getElementById('gmp-map');
const panelEl = document.getElementById('locations-panel');
locator.panelListEl = document.getElementById('locations-panel-list');
const sectionNameEl =document.getElementById('location-results-section-name');
const resultsContainerEl = document.getElementById('location-results-list');

const itemsTemplate = Handlebars.compile(
document.getElementById('locator-result-items-tmpl').innerHTML);

locator.searchLocation = null;
locator.searchLocationMarker = null;
locator.selectedLocationIdx = null;
locator.userCountry = null;

// Initialize the map -------------------------------------------------------
locator.map = new google.maps.Map(mapEl, configuration.mapOptions);

// Store selection.
const selectResultItem = function(locationIdx, panToMarker, scrollToResult) {
locator.selectedLocationIdx = locationIdx;
for (let locationElem of resultsContainerEl.children) {
locationElem.classList.remove('selected');
if (getResultIndex(locationElem) === locator.selectedLocationIdx) {
    locationElem.classList.add('selected');
    if (scrollToResult) {
    panelEl.scrollTop = locationElem.offsetTop;
    }
}
}
if (panToMarker && (locationIdx != null)) {
locator.map.panTo(locator.locations[locationIdx].coords);
}
};

// Create a marker for each location.
const markers = locator.locations.map(function(location, index) {
const marker = new google.maps.Marker({
position: location.coords,
map: locator.map,
title: location.Title,
});
marker.addListener('click', function() {
selectResultItem(index, false, true);
});
return marker;
});

// Fit map to marker bounds.
locator.updateBounds = function() {
const bounds = new google.maps.LatLngBounds();
if (locator.searchLocationMarker) {
bounds.extend(locator.searchLocationMarker.getPosition());
}
for (let i = 0; i < markers.length; i++) {
bounds.extend(markers[i].getPosition());
}
locator.map.fitBounds(bounds);
};
if (locator.locations.length) {
locator.updateBounds();
}

// Get the distance of a store location to the user's location,
// used in sorting the list.
const getLocationDistance = function(location) {
if (!locator.searchLocation) return null;

// Use travel distance if available (from Distance Matrix).
if (location.travelDistanceValue != null) {
return location.travelDistanceValue;
}

// Fall back to straight-line distance.
return google.maps.geometry.spherical.computeDistanceBetween(
    new google.maps.LatLng(location.coords),
    locator.searchLocation.location);
};

// Render the results list --------------------------------------------------
const getResultIndex = function(elem) {
return parseInt(elem.getAttribute('data-location-index'));
};

locator.renderResultsList = function() {
let locations = locator.locations.slice();
for (let i = 0; i < locations.length; i++) {
locations[i].index = i;
}
if (locator.searchLocation) {
sectionNameEl.textContent =
    'Nearest locations (' + locations.length + ')';
locations.sort(function(a, b) {
    return getLocationDistance(a) - getLocationDistance(b);
});
} else {
sectionNameEl.textContent = `All locations (${locations.length})`;
}
const resultItemContext = {locations: locations};
resultsContainerEl.innerHTML = itemsTemplate(resultItemContext);
for (let item of resultsContainerEl.children) {
const resultIndex = getResultIndex(item);
if (resultIndex === locator.selectedLocationIdx) {
    item.classList.add('selected');
}

const resultSelectionHandler = function() {
    if (resultIndex !== locator.selectedLocationIdx) {
    selectResultItem(resultIndex, true, false);
    }
};

// Clicking anywhere on the item selects this location.
// Additionally, create a button element to make this behavior
// accessible under tab navigation.
item.addEventListener('click', resultSelectionHandler);
item.querySelector('.select-location')
    .addEventListener('click', function(e) {
        resultSelectionHandler();
        e.stopPropagation();
    });

// Clicking the directions button will open Google Maps directions in a
// new tab
const origin = (locator.searchLocation != null) ?
    locator.searchLocation.location :
    '';
const destination = locator.locations[resultIndex];
const googleMapsUrl = generateDirectionsURL(origin, destination);
item.querySelector('.directions-button')
    .setAttribute('href', googleMapsUrl);
}
};

// Optional capability initialization --------------------------------------
initializeSearchInput(locator);
initializeDistanceMatrix(locator);

// Initial render of results -----------------------------------------------
locator.renderResultsList();

locator.getUserLocation = function() {
if (navigator.geolocation) {
navigator.geolocation.getCurrentPosition(function(position) {
const userLocation = {
lat: position.coords.latitude,
lng: position.coords.longitude
};
// Erstellen Sie einen Marker an der Position des Benutzers
new google.maps.Marker({
position: userLocation,
map: locator.map,
title: 'Your location',
icon: {
path: google.maps.SymbolPath.CIRCLE,
scale: 10,
fillColor: '#0000ff',
fillOpacity: 0.8,
strokeWeight: 0
}
});
// Zentrieren Sie die Karte auf die Position des Benutzers
locator.map.setCenter(userLocation);
// Setzen Sie den Zoom-Level der Karte
locator.map.setZoom(14); // Sie können den Wert 14 durch den gewünschten Zoom-Level ersetzen

}, function() {
handleLocationError(true, locator.map.getCenter());
});
} else {
// Browser unterstützt keine Geolocation
handleLocationError(false, locator.map.getCenter());
}
}

function handleLocationError(browserHasGeolocation, pos) {
const infoWindow = new google.maps.InfoWindow({map: locator.map});
infoWindow.setPosition(pos);
infoWindow.setContent(
browserHasGeolocation ?
'Error: The Geolocation service failed.' :
'Error: Your browser doesn\'t support geolocation.');
}
}

/** When the search input capability is enabled, initialize it. */
function initializeSearchInput(locator) {
const geocodeCache = new Map();
const geocoder = new google.maps.Geocoder();

const searchInputEl = document.getElementById('location-search-input');
const searchButtonEl = document.getElementById('location-search-button');

const updateSearchLocation = function(address, location) {
if (locator.searchLocationMarker) {
locator.searchLocationMarker.setMap(null);
}
if (!location) {
locator.searchLocation = null;
return;
}
locator.searchLocation = {'address': address, 'location': location};
locator.searchLocationMarker = new google.maps.Marker({
position: location,
map: locator.map,
title: 'My location',
icon: {
path: google.maps.SymbolPath.CIRCLE,
scale: 12,
fillColor: '#3367D6',
fillOpacity: 0.5,
strokeOpacity: 0,
}
});

// Update the locator's idea of the user's country, used for units. Use
// `formatted_address` instead of the more structured `address_components`
// to avoid an additional billed call.
const addressParts = address.split(' ');
locator.userCountry = addressParts[addressParts.length - 1];

// Update map bounds to include the new location marker.
locator.map.setCenter(location); // Set the center of the map to the new location
locator.map.setZoom(14); // Set the zoom level to 14 (or any other value you prefer)

// Update the result list so we can sort it by proximity.
locator.renderResultsList();

locator.updateTravelTimes();
};

const geocodeSearch = function(query) {
if (!query) {
return;
}

const handleResult = function(geocodeResult) {
searchInputEl.value = geocodeResult.formatted_address;
updateSearchLocation(
    geocodeResult.formatted_address, geocodeResult.geometry.location);
};

if (geocodeCache.has(query)) {
handleResult(geocodeCache.get(query));
return;
}
const request = {address: query, bounds: locator.map.getBounds()};
geocoder.geocode(request, function(results, status) {
if (status === 'OK') {
    if (results.length > 0) {
    const result = results[0];
    geocodeCache.set(query, result);
    handleResult(result);
    }
}
});
};

// Set up geocoding on the search input.
searchButtonEl.addEventListener('click', function() {
geocodeSearch(searchInputEl.value.trim());
});

// Initialize Autocomplete.
initializeSearchInputAutocomplete(
locator, searchInputEl, geocodeSearch, updateSearchLocation);
}

/** Add Autocomplete to the search input. */
function initializeSearchInputAutocomplete(
locator, searchInputEl, fallbackSearch, searchLocationUpdater) {
// Set up Autocomplete on the search input. Bias results to map viewport.
const autocomplete = new google.maps.places.Autocomplete(searchInputEl, {
types: ['geocode'],
fields: ['place_id', 'formatted_address', 'geometry.location']
});
autocomplete.bindTo('bounds', locator.map);
autocomplete.addListener('place_changed', function() {
const placeResult = autocomplete.getPlace();
if (!placeResult.geometry) {
// Hitting 'Enter' without selecting a suggestion will result in a
// placeResult with only the text input value as the 'name' field.
fallbackSearch(placeResult.name);
return;
}
searchLocationUpdater(
    placeResult.formatted_address, placeResult.geometry.location);
});
}

/** Initialize Distance Matrix for the locator. */
function initializeDistanceMatrix(locator) {
const distanceMatrixService = new google.maps.DistanceMatrixService();

// Annotate travel times to the selected location using Distance Matrix.
locator.updateTravelTimes = function() {
if (!locator.searchLocation) return;

const units = (locator.userCountry === 'USA') ?
    google.maps.UnitSystem.IMPERIAL :
    google.maps.UnitSystem.METRIC;
const request = {
origins: [locator.searchLocation.location],
destinations: locator.locations.map(function(x) {
    return x.coords;
}),
travelMode: google.maps.TravelMode.DRIVING,
unitSystem: units,
};
const callback = function(response, status) {
if (status === 'OK') {
    const distances = response.rows[0].elements;
    for (let i = 0; i < distances.length; i++) {
    const distResult = distances[i];
    let travelDistanceText, travelDistanceValue;
    if (distResult.status === 'OK') {
        travelDistanceText = distResult.distance.text;
        travelDistanceValue = distResult.distance.value;
    }
    const location = locator.locations[i];
    location.travelDistanceText = travelDistanceText;
    location.travelDistanceValue = travelDistanceValue;
    }

    // Re-render the results list, in case the ordering has changed.
    locator.renderResultsList();
}
};
distanceMatrixService.getDistanceMatrix(request, callback);
};
}


const CONFIGURATION = {

};

function initMap() {

navigator.geolocation.getCurrentPosition(function(position) {
        const userLocation = {
        lat: position.coords.latitude,
        lng: position.coords.longitude};

        const obj={
            "lat":userLocation.lat,
            "lon":userLocation.lng
        }
        fetch("/getLoc",{
            method:"POST",
            headers:{
                "Content-Type":"application/json"
            },
            body: JSON.stringify(obj)
        })
        //fetch('/getLoc') // Hier ist der relative Pfad zur PHP-Datei
        .then(response => response.json())
        .then(locations => {
        CONFIGURATION.locations = locations;
        console.log(locations);
        console.log(CONFIGURATION);
        const locator = new LocatorPlus(CONFIGURATION);
        // Rufen Sie die Funktion getUserLocation auf, wenn die Karte initialisiert wird
        locator.getUserLocation();
        })
        .catch(error => console.error('Error fetching locations:', error));
    })
}