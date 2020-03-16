library(R3port)
library(png)
library(caret)

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
  
  inTrain <- createDataPartition(y = iris$Species, p = 0.7, list = F)
  print(inTrain)
  
  training <- iris[inTrain,]
  training.data <- scale(training[-5])
  iris.kmeans <- kmeans(training.data[,-5], centers = 3, iter.max = 10000)
  training$cluster <- as.factor(iris.kmeans$cluster)


  #place leaflet map in html component
  observe({
    session$sendCustomMessage("sendCameraPosition", c(pos_lat, pos_lon))
    session$sendCustomMessage("sendChartData", c(chartTitle, chartValue))
    session$sendCustomMessage("sendPlotData", c(training$Sepal.Width, training$Sepal.Length))
  })
  
}

shinyApp(ui = htmlTemplate("www/index.html"), server)