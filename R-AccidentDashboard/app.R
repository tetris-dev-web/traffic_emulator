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


server <- function(input, output) {
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
  
  
  #place leaflet map in html component

  
}

shinyApp(ui = htmlTemplate("www/index.html"), server)
