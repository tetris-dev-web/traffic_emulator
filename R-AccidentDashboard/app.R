server <- function(input, output) {
  output$status <- renderPrint({
    tags$b("pass", style = "color: green;")
  })
}

shinyApp(ui = htmlTemplate("www/index.html"), server)
