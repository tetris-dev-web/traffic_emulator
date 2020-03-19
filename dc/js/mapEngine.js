// create map
var mapboxAccessToken =
    'pk.eyJ1IjoiZGVubmlzd2FsdGVyIiwiYSI6ImNqdHNnZXEwejBwcTk0ZGxhMWVsamM5c2UifQ.2UTF5HZ77qcKVzHf3Txlhw';
var map = L.map('map').setView([31.25750030355148, 120.11138710053002], 10);

L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=' + mapboxAccessToken, {id: 'mapbox/light-v9',}).addTo(map);

//map = L.map('map', {crs: L.CRS.EPSG3857, center: [30.6851225, 104.0562385], zoom: 11, });
//L.tileLayer('http://www.arctiler.com:9009/arctiler/arcgis/services/chengdu/MapServer/tile/{z}/{y}/{x}').addTo(map);


// create island
var region_latlngs = [];
var cnt_region_latlngs = 0;

for (var i = 0; i < regionData['features'][0]['geometry']['coordinates'][0].length; i++) {
    var lat = regionData['features'][0]['geometry']['coordinates'][0][i][1];
    var lng = regionData['features'][0]['geometry']['coordinates'][0][i][0];
    var latlng = [lat, lng];

    region_latlngs[cnt_region_latlngs++] = latlng;
}

var island = L.polygon(region_latlngs, {
    color: '800026',
    fillColor: '#eee',
    fillOpacity: 1,
}).addTo(map);

// create layers
var areajson, zonejson, regionjson;

function getColor(d) {
    return d == 'zone_1' ? '#eee' : //800026
        d == 'zone_2' ? '#eee' : //BD0026
        d == 'zone_3' ? '#eee' : //E31A1C
        d == 'zone_4' ? '#eee' : //FC4E2A
        d == 'region' ? '#eee' : //FEB24C
        '#FFEDA0';
}

function style(feature) {
    return {
        fillColor: getColor(feature.properties.color),
        weight: 2,
        opacity: 1,
        color: '#888',
        dashArray: '3',
        fillOpacity: 0.5
    };
}

function highlightFeature(e) {
    var layer = e.target;

    layer.setStyle({
        weight: 2,
        color: '#00f',
        dashArray: '',
        opacity: 0.5,
        fillOpacity: 0.7
    });

    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
        layer.bringToFront();
    }

    info.update(layer.feature.properties);
}

function resetHighlight(e) {
    if (map.hasLayer(areajson)) {
        areajson.resetStyle(e.target);
    }
    if (map.hasLayer(zonejson)) {
        zonejson.resetStyle(e.target);
    }
    if (map.hasLayer(regionjson)) {
        regionjson.resetStyle(e.target);
    }
    info.update();
}

function zoomToFeature(e) {
    map.fitBounds(e.target.getBounds());
}

function onEachFeature(feature, layer) {
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        click: zoomToFeature
    });
}

regionjson = L.geoJson(regionData, {
    style: style,
    onEachFeature: onEachFeature
});

zonejson = L.geoJson(zonesData, {
    style: style,
    onEachFeature: onEachFeature
});

areajson = L.geoJson(areasData, {
    style: style,
    onEachFeature: onEachFeature
});

// right top info box
var info = L.control();

info.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
    this.update();
    return this._div;
};

info.update = function (props) {
    
    var zoneid = '', areaid= '';
    try {
        if (props.zoneid) {
            zoneid = 'Zone ID: <b>' + props.zoneid + '</b><br />';
        }
    
        if (props.areaid) {
            areaid = 'Area ID: <b>' + props.areaid + '</b><br />';
        }
      }
      catch(error) {
        //console.error(error);
      }
    this._div.innerHTML = '<h4>Info</h4>' + (props ?
        zoneid + areaid +
        props.cameras + ' cameras exist' :
        'Hover over a area');
};

info.addTo(map);

// create camera markers
var cameras = [];
var cnt_cameras = 0;
var LeafIcon = L.Icon.extend({
    options: {
        iconSize: [20, 20],
    }
});
var cameraIcon = new LeafIcon({
    iconUrl: './img/cam.png'
})
L.icon = function (options) {
    return new L.Icon(options);
};

for (var i = 0; i < CAMERA_INFO.length; i++) {
    var camera = L.marker([CAMERA_INFO[i].long, CAMERA_INFO[i].lat], {
        icon: cameraIcon
    }).bindPopup("Zone ID: " + CAMERA_INFO[i].zone + "<br>Area ID: " + CAMERA_INFO[i].area + "<br>Camera ID: " + CAMERA_INFO[i].camera + "<br><a href='simulator.html?zone="+CAMERA_INFO[i].zone+"&area="+CAMERA_INFO[i].area+"&camera="+CAMERA_INFO[i].camera+"'>View</a>");
    cameras[cnt_cameras++] = camera;
}
/*
// Edit const_camera.js
for (var i = 0; i < CAMERA_INFO.length; i++) {
    var camera = L.marker([CAMERA_INFO[i].long, CAMERA_INFO[i].lat], {
        icon: cameraIcon, draggable: true
    }).bindPopup(camera.getLatLng() + "<br>" + "Zone ID: " + CAMERA_INFO[i].zone + "<br>Area ID: " + CAMERA_INFO[i].area + "<br>Camera ID: " + CAMERA_INFO[i].camera + "<br><a href='emulator.html' onclick=''>View</a>");
    cameras[cnt_cameras++] = camera;
}
*/
var camera_markers = L.layerGroup(cameras);

// control the layers by levels- region, zones, areas
function ControlLayers() {
    var map_zoom = map.getZoom();
    console.log(map_zoom);
    switch (map_zoom) {
        case 1:
        case 2:
        case 3:
        case 4:
        case 5:
        case 6:
        case 7:
        case 8:
        case 9:
        case 10:
            if (map.hasLayer(areajson)) {
                map.removeLayer(areajson);
                map.removeLayer(camera_markers);
            }
            if (map.hasLayer(zonejson)) {
                map.removeLayer(zonejson);
            }
            if (map.hasLayer(regionjson)) {
                map.removeLayer(regionjson);
            }
            break;
        case 11:
        case 12:

            if (map.hasLayer(areajson)) {
                map.removeLayer(areajson);
                map.removeLayer(camera_markers);
            }
            if (map.hasLayer(zonejson)) {
                map.removeLayer(zonejson);
            }
            if (map.hasLayer(regionjson)) {
                map.removeLayer(regionjson);
            }

            if (!map.hasLayer(regionjson)) {
                map.addLayer(regionjson);
            }
            break;
        case 13:

            if (map.hasLayer(areajson)) {
                map.removeLayer(areajson);
                map.removeLayer(camera_markers);
            }
            if (map.hasLayer(zonejson)) {
                map.removeLayer(zonejson);
            }
            if (map.hasLayer(regionjson)) {
                map.removeLayer(regionjson);
            }
            if (!map.hasLayer(zonejson)) {
                map.addLayer(zonejson);
            }
            break;
        case 14:
            if (map.hasLayer(areajson)) {
                map.removeLayer(areajson);
                map.removeLayer(camera_markers);
            }
            if (map.hasLayer(zonejson)) {
                map.removeLayer(zonejson);
            }
            if (map.hasLayer(regionjson)) {
                map.removeLayer(regionjson);
            }

            if (!map.hasLayer(areajson)) {
                map.addLayer(areajson);
                map.addLayer(camera_markers);
            }
            break;
        default:
            break;
    }
}

map.on('moveend', function (event) {
    ControlLayers();
});

var camera1 = L.circle([31.301549847100296, 120.03533076358959], {
    color: 'red',
    fillColor: '#f03',
    fillOpacity: 0.5,
    radius: 50
}).addTo(map);

var camera2 = L.circle([31.305970975138788, 120.03858490589059], {
    color: 'red',
    fillColor: '#f03',
    fillOpacity: 0.5,
    radius: 50
}).addTo(map);

var camera3 = L.circle([31.29591777911836, 120.03908113218328], {
    color: 'red',
    fillColor: '#f03',
    fillOpacity: 0.5,
    radius: 50
}).addTo(map);