/*
Array of car event
zone : zone index, 1~4
area : area index, 1~10
camera : camera index, 1~25
lane : lane index, 1~3
idxCar : car index, (occurance of car), 1~ 30
startTime : start event from car starting.. seconds
duration : EVT duration (seconds)
clb : 1 : ticket, 2 : accident
typ : 1 : side crash, 2 : reverse, 3 : no track, 4: uturn, 5 : illegal turn, 6 : x-walk, 7 : no stop, 8 : crash
*/
const EVT_INFO = [
  {zone : 1, area : 1, camera : 1, lane : 1, idxCar : 3, startTime : 4, duration : 4, clb : 1, tick16 : 200, typ : 8}, // Crash
  {zone : 1, area : 1, camera : 2, lane : 1, idxCar : 4, startTime : 4, duration : 2, clb : 2, tick16 : 300, typ : 5}, // illegal turn
  {zone : 1, area : 1, camera : 2, lane : 2, idxCar : 3, startTime : 4, duration : 2, clb : 2, tick16 : 300, typ : 5}, // illegal turn
  {zone : 1, area : 1, camera : 3, lane : 1, idxCar : 3, startTime : 3, duration : 3, clb : 2, tick16 : 300, typ : 1}, // side crash
  {zone : 1, area : 1, camera : 3, lane : 2, idxCar : 3, startTime : 3, duration : 3, clb : 2, tick16 : 300, typ : 8}, // side crash
];