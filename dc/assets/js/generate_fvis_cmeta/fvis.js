function fvis_create(idxZone, idxArea, idxCamera, startTime, endTime) {

  var arrCar = [];
  // Get emeta data
  var objEmeta = JSON.parse(emeta_create(idxZone, idxArea, idxCamera));

  // Cab64 and Cab32
  var cab64 = objEmeta.items[0].dck.cab64s;
  var cab32 = objEmeta.items[0].dck.cab32s;

  var objReturn = [];

  // Init Car Array for each lane with start time
  function fvis_init_car(objCamera, startTime) {
    var arrCar = [];

    for (var i = 0; i < objCamera.segs.length; i ++) {
      arrCar[i] = [];

      // Add cars to each lane
      for (var j = 0; j < FVIS_CNT_CAR_LANE; j++) {
        // Define car type
        var carType = 0;
        if (i == 0) carType = 0; // Left lane only car
        if (i == objCamera.segs.length - 1) carType = 2; // right lane only truck
        if (i == 1) carType = Math.random() > 0.5 ? 0 : 1; // 2nd left lane : car, bus
        if (i > 1 && i < objCamera.segs.length - 1) carType = Math.random() > 0.5 ? 1 : 2; // middle lane : bus, truck

        // Look for the unchecked object
        k = 0;
        while(k < CAR_INFO[carType].length - 1 && CAR_INFO[carType][k].hasOwnProperty('marked')) k ++;

        // mark that object as checked
        CAR_INFO[carType][k].marked = true;

        // Add Object to array
        arrCar[i].push(CAR_INFO[carType][k]);
      }

      // Define the positionZ as minus value
      for (var j = 0; j < arrCar[i].length; j ++) {
        arrCar[i][j].positionZ = -1;
        arrCar[i][j].positionX = -1;
        arrCar[i][j].status = 0; // 0 no start, 1 moving, 2 end
        arrCar[i][j].stop = 'stop'; // stop, start, moving
      }
    }

    return arrCar;
  }
  var arrCar = fvis_init_car(objEmeta.items[0].dcv, startTime);

  for (var time = startTime; time < endTime; time += FVIS_CAPTURE_STEP) {

    // Make the json payload
    var objJSONCapture = {
      dcpref : {
        cab64s : CAB64,
        op : DCK_PREF_OP,
        ser : 1
      },
      items : []
    };

    // For each lane
    for (var i = 0; i < arrCar.length; i++) {
      // Car Speed as cm / s
      var carSpeed = (objEmeta.items[0].dcv.segs[i].smin + (objEmeta.items[0].dcv.segs[i].smax - objEmeta.items[0].dcv.segs[i].smin) / 2) * 1000 * 100 / 3600;

      // Get the L/R paint element
      var lpaint, rpaint;
      for (var k = 0; k < objEmeta.items[1].dcv.paint.length; k ++) {
        if (objEmeta.items[0].dcv.segs[i].lpaint == objEmeta.items[1].dcv.paint[k].idx) lpaint = objEmeta.items[1].dcv.paint[k];
        if (objEmeta.items[0].dcv.segs[i].rpaint == objEmeta.items[1].dcv.paint[k].idx) rpaint = objEmeta.items[1].dcv.paint[k];
      }

      // Define the X position for this lane
      var positionX = lpaint.pts[0][0] + Math.abs((rpaint.pts[0][0] - lpaint.pts[0][0]) / 2);

      // Initialize dck/dcv item array
      var arrCarItemSeg = [];
      for (var j = 0; j < arrCar[i].length; j++) arrCarItemSeg.push({dck : {}, dcv : {}, init : false});

      // Check the EVT Record
      var itemEVT4Car = {};
      var evtStartTime = 0;
      var evtIdxCar = -1;
      var evtDuration = 0;
      var evtTyp = 0;
      for (var idxCar = 0; idxCar < arrCar[i].length; idxCar++)
      for (var p = 0; p < EVT_INFO.length; p++) {
        if (idxZone == EVT_INFO[p].zone && idxArea == EVT_INFO[p].area && idxCamera == EVT_INFO[p].camera && (i + 1) == EVT_INFO[p].lane && idxCar == (EVT_INFO[p].idxCar - 1)) {
          evtStartTime = EVT_INFO[p].startTime;
          evtDuration = EVT_INFO[p].duration;
          evtTyp = EVT_INFO[p].typ;
          evtIdxCar = idxCar;

          // Define EVT dck
          itemEVT4Car.dck = {
            op16 : DCK_OP_EVT,
            cla : DCK_CLA,
            clb : EVT_INFO[p].clb,
            cab64s : cab64,
            cab32s : cab32,
            id64 : arrCar[i][idxCar].id64,
            id32 : 0,
            tick32 : time,
            tick16 : EVT_INFO[p].tick16,
            ref64 : ((time) * 65536) + EVT_INFO[p].tick16,
            ref32 : 0
          };

          // Mark the evt is not started
          if (typeof arrCar[i][idxCar].evt == 'undefined') arrCar[i][idxCar].evt = 0;

          break;
        }
      }

      // Time loop 
      for (var t = 0; t < FVIS_CAPTURE_STEP; t += FVIS_CAPTURE_FREQ / 1000) {
        // For each car
        for (var j = 0; j < arrCar[i].length; j ++ ) {
          // Calculate the next movement
          var carRot = Math.round(Math.PI * 1000 / 2) / 1000;
          var positionZStep = Math.round((FVIS_CAPTURE_FREQ / 1000) * carSpeed);
          var curPositionZ =  arrCar[i][j].positionZ;

          if (j == 0 && arrCar[i][j].stop == 'stop' && arrCar[i][j].status == 0) { // If first car is not started yet, let it start
            curPositionZ = lpaint.pts[0][2];
            arrCar[i][j].stop = 'moving';
            arrCar[i][j].status = 1;
          } else if (j > 0 && arrCar[i][j - 1].stop == 'moving' && arrCar[i][j - 1].positionZ > 0 && arrCar[i][j].stop == 'stop' && arrCar[i][j].status == 0) { // If pre car is moving and cur car is not started yet, let the car start by minus value
            // Get the random car distance by cm
            var carDistance = (FVIS_CAR_DISTANCE_MIN + (FVIS_CAR_DISTANCE_MAX - FVIS_CAR_DISTANCE_MIN) * Math.random()) * 100;

            // Get the real car distance with the size of previous car
            carDistance += arrCar[i][j - 1].bbox[2];

            // Define the positionZ as minus value for this car
            curPositionZ = arrCar[i][j - 1].positionZ - carDistance;

            // Let the car to move
            arrCar[i][j].stop = "moving";
            arrCar[i][j].status = 1;

          } else if (arrCar[i][j].status == 1) { // If the car is started already
            // Let the car move forward
            if (arrCar[i][j].stop != "stop") curPositionZ = arrCar[i][j].positionZ + positionZStep;

            // if prev Car is stop, and calculated position + next step is overflow, force the car stop and cur position is before next car
            if (j > 0 && arrCar[i][j - 1].stop == "stop" && arrCar[i][j].stop == "moving" && (arrCar[i][j - 1].positionZ - arrCar[i][j - 1].bbox[2] - FVIS_CAR_DISTANCE_MIN * 100) < (curPositionZ)) {
              curPositionZ = arrCar[i][j - 1].positionZ - arrCar[i][j-1].bbox[2] - FVIS_CAR_DISTANCE_MIN * 100;

              // If it is crash, remove the car distance
              if ((j - 1) == evtIdxCar && evtTyp == 8) curPositionZ = arrCar[i][j - 1].positionZ - arrCar[i][j - 1].bbox[2];
              arrCar[i][j].stop = "stop";
            }

            // if cur car is stop, prev Car is moving, let this car start
            if (j > 0 && arrCar[i][j-1].stop == "moving" && arrCar[i][j].stop == "stop" && j != evtIdxCar) {
              arrCar[i][j].stop = "start";
            } else if (arrCar[i][j].stop == "start") { // If car is start, let it moving (1 second warning)
              arrCar[i][j].stop = "moving";
            }

            // if car is over the lane, mark the car out of lane
            if (curPositionZ > CAMERA_AREA_LONG * 100) arrCar[i][j].status = 2;
          }

          // positionX
          if (arrCar[i][j].status == 1) {
            if (arrCar[i][j].stop != 'stop') arrCar[i][j].positionX = positionX;

            // If it is EVT car and side crash, illegal turn, put the car to the sidebar
            if (j == evtIdxCar && arrCar[i][j].stop == 'stop' && (evtTyp == 1 || evtTyp == 4 || evtTyp == 5)) {
              arrCar[i][j].positionX = Math.round(lpaint.pts[0][0] + arrCar[i][j].bbox[0] / 2);

              if (evtTyp == 4 || evtTyp == 5) {
                carRot = Math.round(Math.PI * 1000 / 3) / 1000;
              }
            }

          }

          // EVT processing (only 1 time for each lane)
          if (evtIdxCar == j && arrCar[i][j].status == 1 && arrCarItemSeg[j].init) {
            if (arrCar[i][j].stop == "moving" && arrCarItemSeg[j].dcv.apts.length == evtStartTime && arrCar[i][j].evt == 0) {
              // Let the car stop
              arrCar[i][j].stop = "stop";

              // fill the evt value
              itemEVT4Car.dck.tick32 = time + t;
              itemEVT4Car.dck.ref64 = ((time + t) * 65536) + itemEVT4Car.dck.tick16,
              itemEVT4Car.dcv = {
                typ : evtTyp,
                bbox :  [arrCar[i][j].bbox[0], arrCar[i][j].bbox[1], arrCar[i][j].bbox[2]],
                clr : arrCar[i][j].clr,
                logo : arrCar[i][j].logo,
                tick32 : time + t,
                etick32 : time + t + evtDuration,
                freq : evtDuration * 1000,
                stamp64 : 0,
                apts : [
                  {
                    dur : evtDuration * 1000,
                    seg : i + 1,
                    rot : (evtTyp == 4 || evtTyp == 5) ? (Math.round(Math.PI * 1000 / 3) / 1000) : carRot,
                    pt : [arrCar[i][j].positionX, 0, curPositionZ]
                  }                
                ]
              };  

              // Update the event is processed
              arrCar[i][j].evt = 1;            
            }

            if (arrCar[i][j].stop == "stop" && arrCarItemSeg[j].dcv.apts.length == evtStartTime + evtDuration) {
              arrCar[i][j].stop = "start";
            }
          }

          curPositionZ = Math.round(curPositionZ);

          // If car is moving, then add dck/dcv item
          if (arrCar[i][j].status == 1 ) {
            // If current position is visible, create JSON
            if (curPositionZ > 0) {
              // if the car is starting, define dck, dcv
              if (!arrCarItemSeg[j].init) {
                arrCarItemSeg[j].dck = {
                  op16 : DCK_OP_FVIS,
                  cla : DCK_CLA,
                  cab64s : cab64,
                  cab32s : cab32,
                  id64 : arrCar[i][j].id64,
                  id32 : 0
                };
                arrCarItemSeg[j].dcv = {
                  typ : arrCar[i][j].typ,
                  bbox :  [arrCar[i][j].bbox[0], arrCar[i][j].bbox[1], arrCar[i][j].bbox[2]],
                  clr : arrCar[i][j].clr,
                  logo : arrCar[i][j].logo,
                  tick32 : time + t, // current time
                  etick32 : endTime,
                  freq : FVIS_CAPTURE_FREQ,
                  apts : []
                };
                arrCarItemSeg[j].init = true;
              }

              // Put the apts
              arrCarItemSeg[j].dcv.apts.push({
                dur : FVIS_CAPTURE_FREQ,
                seg : i + 1,
                rot : carRot,
                pt : [arrCar[i][j].positionX, 0, curPositionZ]
              });
            }
            
            // Keep the current position
            arrCar[i][j].positionZ = curPositionZ;
          }

        } // End of car loop
      } // End of t loop

      // Put the dck/dcv item to JSON
      for (var j = 0; j < arrCar[i].length; j ++) {
        if (!arrCarItemSeg[j].init) continue;

        arrCarItemSeg[j].dcv.etick32 = arrCarItemSeg[j].dcv.tick32 + arrCarItemSeg[j].dcv.apts.length
        objJSONCapture.items.push({
          dck : arrCarItemSeg[j].dck,
          dcv : arrCarItemSeg[j].dcv
        });
      }

      // Add EVT
      if (typeof itemEVT4Car.dck != 'undefined') objJSONCapture.items.push(itemEVT4Car);
    } // End of lane loop

    // If there is car, add to JSON payload
    if (objJSONCapture.items.length > 0) objReturn.push(objJSONCapture);
    // End of one capture
  }

  return JSON.stringify(objReturn);
}