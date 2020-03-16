pos_lat <- c(31.497555, 31.513837, 31.474463, 31.465495)
pos_lon <- c(120.317609, 120.356662, 120.356491, 120.348036)

chartTitle <- c("Crash", "Accident", "Injury")
chartValue <- c(16, 13, 29)

server <- function(input, output, session) {
  
  observeEvent(input$filterData, {
    startDate = ""
    endDate = ""
    
    accident_1 = FALSE
    accident_2 = FALSE
    accident_3 = FALSE
    
    weather_sp = FALSE
    weather_su = FALSE
    weather_au = FALSE
    weather_wi = FALSE
    
    startDate = input$filterData$startDate
    endDate = input$filterData$endDate
    
    accident_1 = input$filterData$accident_1
    accident_2 = input$filterData$accident_2
    accident_3 = input$filterData$accident_3
    
    weather_sp = input$filterData$weather_sp
    weather_su = input$filterData$weather_su
    weather_au = input$filterData$weather_au
    weather_wi = input$filterData$weather_wi

  })
  
  #place leaflet map in html component
  observe({
    session$sendCustomMessage("sendCameraPosition", c(pos_lat, pos_lon))
    session$sendCustomMessage("sendChartData", c(chartTitle, chartValue))
    session$sendCustomMessage("sendPlotData", c(chartTitle, chartValue))
  })
  
}

shinyApp(ui = htmlTemplate("www/index.html"), server)