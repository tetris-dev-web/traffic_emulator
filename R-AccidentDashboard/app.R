library(leaflet)

pos_lat <- c(31.497555, 31.513837, 31.474463, 31.465495)
pos_lon <- c(120.317609, 120.356662, 120.356491, 120.348036)

chartTitle <- c("Crash", "Accident", "Injury")
chartValue <- c(16, 13, 29)

server <- function(input, output, session) {
  
  #place leaflet map in html component
  observe({
    session$sendCustomMessage("sendCameraPosition", c(pos_lat, pos_lon))
    session$sendCustomMessage("sendChartData", c(chartTitle, chartValue))
  })
  
}

shinyApp(ui = htmlTemplate("www/index.html"), server)