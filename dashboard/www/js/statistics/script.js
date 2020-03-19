var filterOptionData = {
    startDate: "",
    endDate: "",

    accident_1: false,
    accident_2: false,
    accident_3: false,

    weather_sp: false,
    weather_su: false,
    weather_au: false,
    weather_wi: false
};


function onShowCameraGeoPositionData(event) {
    console.log('Camera Position:', event.latlng.lat, event.latlng.lng);
}

const canvas = document.getElementById("barChart");
const ctx = canvas.getContext("2d");

const canvas_plot = document.getElementById("plotChart");
const ctx_plot = canvas_plot.getContext("2d");

function eventChart() {
    Chart.defaults.global.defaultFontColor = 'black';
    Chart.defaults.global.defaultFontSize = 12;

    var chartLabel = ["Type-1", "Type-2", "Type-3", "Type-4", "Type-5", "Type-6", "Type-7", "Type-8"];
    var chartData = [evtType1, evtType2, evtType3, evtType4, evtType5, evtType6, evtType7, evtType8];

    console.log(chartData);

    var data = {
        labels: chartLabel,
        datasets: [
            {
                label: "Statistics",
                backgroundColor: "#ff9900",
                data: chartData
            }
        ]
    };
    var options = {
        hover: {
            mode: 'index',
            intersect: true
        },
        tooltips: {
            mode: 'index',
            intersect: true,
            position: 'average',

            filter: (item) => (item.value !== 'NaN' && 1 * item.value > 0),

            backgroundColor: '#202631',
            bodyFontColor: '#fff',
            titleFontSize: 14,
            titleFontColor: '#fff',
            bodyFontSize: 12,
            footerFontSize: 14,

            xPadding: 4,
            yPadding: 4,
            cornerRadius: 8,

            titleSpacing: 6,
            titleMarginBottom: 4,
            bodySpacing: 6,

            caretPadding: 4,

            callbacks: {
                title: function (tooltipItem, data) {
                    var total = 0;
                    for (var i = 0; i < tooltipItem.length; i++) {
                        total += (1 * tooltipItem[i].value) || 0
                    }

                    return [tooltipItem[0].label, total]
                }
            }
        },
        legend: {
            display: false
        },
        scales: {
            yAxes: [{
                ticks: {
                    beginAtZero: true,

                },
                stacked: true
            }],
            xAxes: [{
                stacked: true
            }]

        },

        plugins: {
            crosshair: {
                line: {
                    color: '#00000099',
                    width: 1,
                    dashPattern: [5, 5]
                },

                zoom: {
                    enabled: false
                },

                snap: {
                    enabled: true
                }
            }
        }
    };
    var myBarChart = new Chart(ctx, {
        type: 'bar',
        data: data,
        options: options
    });
}


// Shiny.addCustomMessageHandler("sendPlotData", function(data) {
//     var chartData = [];
//     var chartColor = [];

//     console.log(data);

//     for(var i = 0; i < data.length / 3; i++) {
//     var data_panel = {x: data[i], y:data[i + data.length/3]};

//     chartData.push(data_panel);
//     chartColor.push(data[i + (data.length/3) * 2]);
//     }

//     var options = {responsive: true, maintainAspectRatio: false};

//     var plotChart = new Chart(ctx_plot, {
//     type: 'scatter',
//         data: {
//         datasets: [{
//             label: 'Statistics Scater',
//             data: chartData,
//             colorArea: chartColor,
//             borderColor: '#2196f3',
//             backgroundColor: '#2196f3',
//             fill: false,
//             pointBackgroundColor: function(context) {
//             var index = context.dataIndex;
//                 var value = context.dataset.colorArea[index];
//                 return value == 1 ? 'red' :  // draw negative values in red
//                     value == 2 ? 'blue' :    // else, alternate values in blue and green
//                         'green';
//             }
//         }]
//         },
//         options: options
//     });

// })


function showStatistics() {
    var check_acc_1 = document.getElementById("idAccident_1");
    var check_acc_2 = document.getElementById("idAccident_2");
    var check_acc_3 = document.getElementById("idAccident_3");

    var check_wea_1 = document.getElementById("idWeather_sp");
    var check_wea_2 = document.getElementById("idWeather_su");
    var check_wea_3 = document.getElementById("idWeather_au");
    var check_wea_4 = document.getElementById("idWeather_wi");

    filterOptionData.accident_1 = check_acc_1.checked;
    filterOptionData.accident_2 = check_acc_2.checked;
    filterOptionData.accident_3 = check_acc_3.checked;

    filterOptionData.weather_sp = check_wea_1.checked;
    filterOptionData.weather_su = check_wea_2.checked;
    filterOptionData.weather_au = check_wea_3.checked;
    filterOptionData.weather_wi = check_wea_4.checked;

    var startDate = new Date(document.getElementById("startDate").value);
    var endDate = new Date(document.getElementById("endDate").value);

    filterOptionData.startDate = startDate.getTime().toString();
    filterOptionData.endDate = endDate.getTime().toString();

    console.log(filterOptionData);
    Shiny.onInputChange("filterData", filterOptionData);

}