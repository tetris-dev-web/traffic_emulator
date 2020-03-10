library(leaflet)

crash_status_label <- "Crashes"
crash_car_count <- 32
crash_bus_count <- 58
crash_truck_count <- 17

accident_status_label <- "Accidents"
accident_car_count <- 21
accident_bus_count <- 34
accident_truck_count <- 12

injury_status_label <- "Injuries"
injury_light_count <- 235
injury_severe_count <- 82


pos_lat <- c(31.497555, 31.513837, 31.474463, 31.465495)
pos_lon <- c(120.317609, 120.356662, 120.356491, 120.348036)


chartTitle <- c("Crashes", "Accidents", "Injuries")
chartValue <- c(56.3, 43.9, 82.3)


server <- function(input, output, session) {
  

  output$crashes_status <- renderPrint({
    tags$b(crash_status_label, style = "color: white; font-size: 2rem; font-weight: bolder;")
  })
  output$crashes_car <- renderPrint({
    tags$b(crash_car_count, style = "color: white;")
  })
  output$crashes_bus <- renderPrint({
    tags$b(crash_bus_count, style = "color: white;")
  })
  output$crashes_truck <- renderPrint({
    tags$b(crash_truck_count, style = "color: white;")
  })
  
  
  output$accident_status <- renderPrint({
    tags$b(accident_status_label, style = "color: white; font-size: 2rem; font-weight: bolder;")
  })
  output$accident_car <- renderPrint({
    tags$b(accident_car_count, style = "color: white;")
  })
  output$accident_bus <- renderPrint({
    tags$b(accident_bus_count, style = "color: white;")
  })
  output$accident_truck <- renderPrint({
    tags$b(accident_truck_count, style = "color: white;")
  })
  
  
  output$injury_status <- renderPrint({
    tags$b(injury_status_label, style = "color: white; font-size: 2rem; font-weight: bolder;")
  })
  output$injury_light <- renderPrint({
    tags$b(injury_light_count, style = "color: white;")
  })
  output$injury_severe <- renderPrint({
    tags$b(injury_severe_count, style = "color: white;")
  })
  
  output$chart_title <- renderPrint({
    tags$b("Car Accident Chart", style = "color: white; font-size: 1.5rem; font-weight: bolder;")
  })
  
  #place leaflet map in html component
  observe({
    session$sendCustomMessage("sendCameraPosition", c(pos_lat, pos_lon))
    session$sendCustomMessage("sendChartData", c(chartTitle, chartValue))
  })
  
}

shinyApp(ui = htmlTemplate("www/index.html"), server)
