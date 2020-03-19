$(document).ready(function () {
    $("#statistics-panel").show();
    $('#statictics_refer').show();
});

var mapviewer_status = 0;

function openStatistics(evt, tabName) {
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.className += " active";
    $('#statictics_refer').show();
    mapviewer_status = 0;
    map.addLayer(statistics_markers);
    map.removeLayer(areajson);
    map.removeLayer(camera_markers);
    map.removeLayer(jams_markers);
    map.removeLayer(wazer_markers);
    map.removeLayer(zonejson);
    map.removeLayer(regionjson);

}

function openMapViewer(evt, tabName) {
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.className += " active";
    $('#statictics_refer').hide();
    mapviewer_status = 1
    map.removeLayer(statistics_markers);
    ControlLayers();
}