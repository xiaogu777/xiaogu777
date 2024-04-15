// Initialize map
//<a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © 
var map = L.map('map').setView([35, 105], 4);
L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox/light-v10',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: 'pk.eyJ1IjoibG91YmV6IiwiYSI6ImNsdHM1a29saTBvaWQya252cHZscXlva3UifQ.Lk-4dUmomVkPtpGTSysdjQ'
}).addTo(map);
var markers = L.layerGroup().addTo(map);
var connections = L.layerGroup().addTo(map);
var provinceLayer;
// Load city data from JSON
$.getJSON('./data/cities.json', function (data) {
    data.forEach(function (city) {
        var marker = L.marker([city.lat, city.lng], {
            title: city.name,
            tier: city.tier,
            region: city.region
        }).addTo(markers);
        marker.bindPopup(`
      <div class="p-4">
        <h3 class="text-lg font-bold">${city.name}</h3>
        <p>${city.nameEn}</p>
        <p>经度: ${city.lng}</p>
        <p>纬度: ${city.lat}</p>
      </div>
    `);
        marker.on('click', function () {
            showConnections(city);
        });
    });
    updateMarkers();
});
// Show lines connecting a city on click
function showConnections(city) {
    connections.clearLayers();
    $.getJSON('./data/cities.json', function (data) {
        data.forEach(function (other) {
            if (city !== other) {
                L.polyline([
                    [city.lat, city.lng],
                    [other.lat, other.lng]
                ], {
                    color: '#1a73e8',
                    weight: 2,
                    opacity: 0.7
                }).addTo(connections);
            }
        });
    });
}
// Filter markers based on checked boxes
function updateMarkers() {
    var tiers = [];
    var regions = [];
    $('.sidebar input[type="checkbox"]').each(function () {
        if (this.checked) {
            if ($(this).data('region')) {
                regions.push($(this).data('region'));
            } else {
                tiers.push($(this).parent().text().trim());
            }
        }
    });
    markers.eachLayer(function (marker) {
        if (tiers.includes(marker.options.tier) && regions.includes(marker.options.region)) {
            marker.addTo(map);
        } else {
            map.removeLayer(marker);
        }
    });
}
$('.sidebar input[type="checkbox"]').on('change', updateMarkers);
// Toggle visibility of sidebar sections
$('.block-toggle').on('click', function () {
    $(this).find('i').toggleClass('fa-caret-down fa-caret-up');
    $(this).next('.block-content').slideToggle();
});
// Highlight province on hover
$('.sidebar input[data-region]').on('mouseover', function () {
    var region = $(this).data('region');
    if (provinceLayer) {
        map.removeLayer(provinceLayer);
    }
    $.getJSON('provinces.geojson', function (data) {
        var province = data.features.find(function (feature) {
            return feature.properties.name === region;
        });
        if (province) {
            provinceLayer = L.geoJSON(province, {
                style: {
                    fillColor: '#ff0000',
                    fillOpacity: 0.5,
                    weight: 2,
                    color: '#ff0000'
                }
            }).addTo(map);
        }
    });
});
$('.sidebar input[data-region]').on('mouseout', function () {
    if (provinceLayer) {
        map.removeLayer(provinceLayer);
    }
});