

function fvis_create_generator(idxZone, idxArea, idxCamera, startTime, endTime, waytype, lanecnt, interval) {
    var arrCar = [];
    // Get emeta data
    var objEmeta = JSON.parse(emeta_create_generator(idxZone, idxArea, idxCamera, waytype, lanecnt, interval));
    // console.log(objEmeta)
    // Cab64 and Cab32
    var cab64 = objEmeta.items[0].dck.cab64s;
    var cab32 = objEmeta.items[0].dck.cab32s;

    var objReturn = [];
    
    if (waytype === 'onedir')
    {
        function fvis_init_onedirection_car(objCamera, startTime) {
            var cars =[];
        
            for (var i = 0; i < objCamera.segs.length; i ++) {
                cars[i] = [];
        
                // Add cars to each lane
                for (var j = 0; j < FVIS_CNT_CAR_LANE; j++) {
                    // Define car type
                    var rnd = Math.random();                    
                    var carType = 0;

                    if ( 0.3 < rnd && 0.6 < rnd)
                        carType = 1;
                    else if  (0.6 <= rnd)
                        carType = 2;                    
        
                    // Look for the unchecked object
                    k = 0;
                    while(k < CAR_INFO[carType].length - 1 && CAR_INFO[carType][k].hasOwnProperty('marked')) k ++;
        
                    // mark that object as checked
                    CAR_INFO[carType][k].marked = true;
        
                    // Add Object to array
                    cars[i].push(CAR_INFO[carType][k]);
                }
        
                // Define the positionZ as minus value
                for (var j = 0; j < cars[i].length; j ++) {
                    cars[i][j].positionZ = -1;
                    cars[i][j].positionX = -1;
                    cars[i][j].status = 0; // 0 no start, 1 moving, 2 end
                    cars[i][j].stop = 'stop'; // stop, start, moving
                }
            }
            return cars;
        }

        var arrCar = fvis_init_onedirection_car(objEmeta.items[0].dcv, startTime);
        json = fvis_create_with_one_direction( arrCar, startTime, endTime, objEmeta, lanecnt);
        return json;
    }

    if (waytype === 'twodir')
    {
        function fvis_init_twodirection_car(objCamera, startTime) {
            var cars =[];
        
            for (var i = 0; i < objCamera.segs.length; i ++) {
                cars[i] = [];
        
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
                    cars[i].push(CAR_INFO[carType][k]);
                }
        
                // Define the positionZ as minus value
                for (var j = 0; j < cars[i].length; j ++) {
                    cars[i][j].positionZ = -1;
                    cars[i][j].positionX = -1;
                    cars[i][j].status = 0; // 0 no start, 1 moving, 2 end
                    cars[i][j].stop = 'stop'; // stop, start, moving
                }
            }
            return cars;
        }

        var arrCar = fvis_init_twodirection_car(objEmeta.items[0].dcv, startTime);
        json = fvis_create_with_two_direction(idxZone, idxArea, idxCamera, lanecnt, interval);
        return json;
    }

    if (waytype === 'curve')
    {
        json = fvis_create_with_curve(idxZone, idxArea, idxCamera, lanecnt, interval);
        return json;
    }

    if (waytype === 'cross')
    {
        json = fvis_create_with_cross(idxZone, idxArea, idxCamera, lanecnt, interval);
        return json;
    }

    if (waytype === 'onebridge')
    {
        json = fvis_create_with_onebridge(idxZone, idxArea, idxCamera, lanecnt, interval);
        return json;
    }

    if (waytype === 'twobridge')
    {
        json = fvis_create_with_twobridge(idxZone, idxArea, idxCamera, lanecnt, interval);
        return json;
    }

    return JSON.stringify(objReturn);
}


function fvis_create_with_one_direction( lstCars, sTime, eTime, emeta, lanecnt)
{
    var objReturn = [];
    for (var time = sTime; time < eTime; time += FVIS_CAPTURE_STEP) {
        // console.log(time)
        // Make the json payload
        var objJSONCapture = {
            dcpref : {
                cab64s : CAB64,
                op : DCK_PREF_OP,
                ser : 1
            },
            items : []
        };

        // Car Speed as cm / s
        var carSpeed = (emeta.items[0].dcv.segs[0].smin + (emeta.items[0].dcv.segs[0].smax - emeta.items[0].dcv.segs[0].smin) / 2) * 1000 * 100 / 3600;
        // For each lane
        for (var i = 0; i < lanecnt; i++) {

            // Get the L/R paint element
            var lpaint, rpaint;
            
            for (var k = 0; k < emeta.items[1].dcv.paint.length; k ++) {
                if (emeta.items[0].dcv.segs[i].lpaint == emeta.items[1].dcv.paint[k].idx) lpaint = emeta.items[1].dcv.paint[k];
                if (emeta.items[0].dcv.segs[i].rpaint == emeta.items[1].dcv.paint[k].idx) rpaint = emeta.items[1].dcv.paint[k];
            }
            laneFlow = objEmeta.items[0].dcv.segs[i].flow;
            
            // Define the X position for this lane
            var positionX_base = lpaint.pts[0][0] + Math.abs((rpaint.pts[0][0] - lpaint.pts[0][0]) / 2);            
            var positionZ = lpaint.pts[0][2] + Math.abs((rpaint.pts[0][2] - lpaint.pts[0][2]) / 2);
    
            // Initialize dck/dcv item array
            var arrCarItemSeg = [];
            for (var j = 0; j < lstCars[i].length; j++) arrCarItemSeg.push({dck : {}, dcv : {}, init : false});

            //Set Lane Direction
            var laneDirection= true;
            // Check the EVT Record
            var itemEVT4Car = {};
            var evtStartTime = 0;
            var evtIdxCar = -1;
            var evtDuration = 0;
            var evtTyp = 0;
           
                // Time loop
                for (var t = 0; t < FVIS_CAPTURE_STEP; t += FVIS_CAPTURE_FREQ / 1000) {
                    // For each car
                    for (var j = 0; j < lstCars[i].length; j ++ ) {
                        // Calculate the next movement
                        var carRot = Math.round(Math.PI * 1000 / 2) / 1000;                        
                        var positionZStep = Math.round((FVIS_CAPTURE_FREQ / 1000) * carSpeed);
                        var curPositionZ =  lstCars[i][j].positionZ;
                        var event = Math.random();

                        if (j == 0 && lstCars[i][j].stop == 'stop' && lstCars[i][j].status == 0 ) { // If first car is not started yet, let it start                            
                            if ( event > GO_EVENT )
                            {
                                curPositionZ = lpaint.pts[0][2];
                                lstCars[i][j].stop = 'moving';
                                lstCars[i][j].status = 1;                            
                            }
                            else 
                            {
                                lstCars[i][j].stop = 'stop';
                                lstCars[i][j].status = 0; 
                            }                            
                        } else if (j > 0 && lstCars[i][j - 1].stop == 'moving' && lstCars[i][j - 1].positionZ > 0 && lstCars[i][j].stop == 'stop' && lstCars[i][j].status == 0) { // If pre car is moving and cur car is not started yet, let the car start by minus value
                            // Get the random car distance by cm
                            var carDistance = (FVIS_CAR_DISTANCE_MIN + (FVIS_CAR_DISTANCE_MAX - FVIS_CAR_DISTANCE_MIN) * Math.random()) * 100;
                            
                            // Get the real car distance with the size of previous car
                            carDistance += lstCars[i][j - 1].bbox[2];

                            // Define the positionZ as minus value for this car
                            curPositionZ = lstCars[i][j - 1].positionZ - carDistance;
                            
                            // Let the car to move
                            lstCars[i][j].stop = "moving";
                            lstCars[i][j].status = 1;

                        } else if (lstCars[i][j].status == 1) { // If the car is started already
                            // Let the car move forward
                            if (lstCars[i][j].stop != "stop") curPositionZ = lstCars[i][j].positionZ + positionZStep;                            

                            // if prev Car is stop, and calculated position + next step is overflow, force the car stop and cur position is before next car
                            if (j > 0 && lstCars[i][j - 1].stop == "stop" && lstCars[i][j].stop == "moving" && (lstCars[i][j - 1].positionZ - lstCars[i][j - 1].bbox[2] - FVIS_CAR_DISTANCE_MIN * 100) < (curPositionZ)) {
                                curPositionZ = lstCars[i][j - 1].positionZ - lstCars[i][j - 1].bbox[2] - FVIS_CAR_DISTANCE_MIN * 100;

                                if (event < 0.2)
                                {                                    
                                    evtStartTime = time+t;
                                    evtDuration = Math.round(Math.random() * 5);
                                    evtTyp = 8; //crash
                                    evtIdxCar = j;
        
                                    // Define EVT dck
                                    itemEVT4Car.dck = {
                                        op16 : DCK_OP_EVT,
                                        cla : DCK_CLA,
                                        clb : 1, //accident
                                        cab64s : cab64,
                                        cab32s : cab32,
                                        id64 : arrCar[i][j].id64,
                                        id32 : 0,
                                        tick32 : time,
                                        tick16 : 300,
                                        ref64 : ((time) * 65536) + 300,
                                        ref32 : 0
                                    };
        
                                    // Mark the evt is not started
                                    arrCar[i][j].evt = 0;                                 
                                }
                                else if  (event > 0.8)
                                {

                                }
                                // If it is crash, remove the car distance
                                if ((j - 1) == evtIdxCar && evtTyp == 8) curPositionZ = lstCars[i][j - 1].positionZ - lstCars[i][j - 1].bbox[2];
                                lstCars[i][j].stop = "stop";
                            }

                            // if cur car is stop, prev Car is moving, let this car start
                            if (j > 0 && lstCars[i][j-1].stop == "moving" && lstCars[i][j].stop == "stop" && j != evtIdxCar) {
                                lstCars[i][j].stop = "start";
                            } else if (lstCars[i][j].stop == "start") { // If car is start, let it moving (1 second warning)
                                lstCars[i][j].stop = "moving";
                            }

                            // if car is over the lane, mark the car out of lane
                            if(laneDirection) {
                                if (curPositionZ > CAMERA_AREA_LONG * 100) lstCars[i][j].status = 2;
                            } else {
                                if (curPositionZ < 0 ) lstCars[i][j].status = 2;
                            }
                        }

                        
                        if ( curPositionZ < 0 || idxCamera != 11)
                            positionX = positionX_base;
                        else 
                            positionX = positionX_base + 600 * Math.sin( 2* Math.PI * curPositionZ / 50000);

                        // positionX
                        if (lstCars[i][j].status == 1) {
                            if (lstCars[i][j].stop != 'stop') lstCars[i][j].positionX = positionX;
                            // If it is EVT car and side crash, illegal turn, put the car to the sidebar
                            if (j == evtIdxCar && lstCars[i][j].stop == 'stop' && (evtTyp == 1 || evtTyp == 4 || evtTyp == 5)) {
                                lstCars[i][j].positionX = Math.round(lpaint.pts[0][0] + lstCars[i][j].bbox[0] / 2);

                                if (evtTyp == 4 || evtTyp == 5) {
                                    carRot = Math.round(Math.PI * 1000 / 3) / 1000;
                                }
                            }
                        }


                        // EVT processing (only 1 time for each lane)
                        if (evtIdxCar == j && lstCars[i][j].status == 1 && arrCarItemSeg[j].init) {
                            if (lstCars[i][j].stop == "moving" && arrCarItemSeg[j].dcv.apts.length == evtStartTime && lstCars[i][j].evt == 0) {
                                // Let the car stop
                                lstCars[i][j].stop = "stop";

                                // fill the evt value
                                itemEVT4Car.dck.tick32 = time + t;
                                itemEVT4Car.dck.ref64 = ((time + t) * 65536) + itemEVT4Car.dck.tick16,
                                    itemEVT4Car.dcv = {
                                        typ : evtTyp,
                                        bbox :  [lstCars[i][j].bbox[0], lstCars[i][j].bbox[1], lstCars[i][j].bbox[2]],
                                        clr : lstCars[i][j].clr,
                                        logo : lstCars[i][j].logo,
                                        tick32 : time + t,
                                        etick32 : time + t + evtDuration,
                                        freq : evtDuration * 1000,
                                        stamp64 : 0,
                                        apts : [
                                            {
                                                dur : evtDuration * 1000,
                                                seg : i + 1,
                                                rot : (evtTyp == 4 || evtTyp == 5) ? (Math.round(Math.PI * 1000 / 3) / 1000) : carRot,
                                                pt : [lstCars[i][j].positionX, 0, curPositionZ]
                                            }
                                        ]
                                    };

                                // Update the event is processed
                                lstCars[i][j].evt = 1;
                            }

                            if (lstCars[i][j].stop == "stop" && arrCarItemSeg[j].dcv.apts.length == evtStartTime + evtDuration) {
                                lstCars[i][j].stop = "start";
                            }
                        }

                        curPositionZ = Math.round(curPositionZ);
                        // If car is moving, then add dck/dcv item
                        if (lstCars[i][j].status == 1 ) {
                            
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
                                        typ : lstCars[i][j].typ,
                                        bbox :  [lstCars[i][j].bbox[0], lstCars[i][j].bbox[1], lstCars[i][j].bbox[2]],
                                        clr : lstCars[i][j].clr,
                                        logo : lstCars[i][j].logo,
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
                                    pt : [lstCars[i][j].positionX, 0, curPositionZ]
                                });
                            }

                            // Keep the current position
                            lstCars[i][j].positionZ = curPositionZ;
                          //  console.log('i = ', i, ' j= ', j, 'tick = ', t, 'posx = ', arrCar[i][j].positionX, 'curposZ = ', curPositionZ);
                        }

                    } // End of car loop
                } // End of t loop

            // Put the dck/dcv item to JSON
            for (var j = 0; j < arrCar[i].length; j ++) {
                // console.log("carlength",arrCar[i].length);
                if (!arrCarItemSeg[j].init) continue;

                arrCarItemSeg[j].dcv.etick32 = arrCarItemSeg[j].dcv.tick32 + arrCarItemSeg[j].dcv.apts.length
                objJSONCapture.items.push({
                    dck : arrCarItemSeg[j].dck,
                    dcv : arrCarItemSeg[j].dcv
                });
            }
            // console.log(objJSONCapture);
            // Add EVT
            if (typeof itemEVT4Car.dck != 'undefined') {

                objJSONCapture.items.push(itemEVT4Car);
            }
        } // End of lane loop

        // If there is car, add to JSON payload
        if (objJSONCapture.items.length > 0) objReturn.push(objJSONCapture);
        // End of one capture
    }

    return JSON.stringify(objReturn);
}

function fvis_create_with_two_direction(idxZone, idxArea, idxCamera, lanecnt, interval)
{

}

 function fvis_create_with_curve(idxZone, idxArea, idxCamera, lanecnt, interval)
 {

 }

function fvis_create_with_cross(idxZone, idxArea, idxCamera, lanecnt, interval)
{

}

function fvis_create_with_onebridge(idxZone, idxArea, idxCamera, lanecnt, interval)
{

}

function fvis_create_with_twobridge(idxZone, idxArea, idxCamera, lanecnt, interval)
{

}

function fvis_create_with_nine(idxZone, idxArea, idxCamera, startTime, endTime)
{

}
