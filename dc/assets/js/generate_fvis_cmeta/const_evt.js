/*
Array of car event
zone : zone index, 1~4
area : area index, 1~10
camera : camera index, 1~25
lane : lane index, 1~3
idxCar : car index, (occurance of car), 1~ 30
startTime : start event from car starting.. seconds
duration : EVT duration (seconds)
*/
const EVT_INFO = [
  {zone : 1, area : 1, camera : 1, lane : 1, idxCar : 5, startTime : 4, duration : 4, clb : 1, tick16 : 200},
  {zone : 1, area : 1, camera : 1, lane : 2, idxCar : 7, startTime : 4, duration : 4, clb : 2, tick16 : 300}
];