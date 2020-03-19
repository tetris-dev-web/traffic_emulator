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
            arrCar[i][j].positionY = 0;
            arrCar[i][j].status = 0; // 0 no start, 1 moving, 2 end
            arrCar[i][j].stop = 'stop'; // stop, start, moving
            arrCar[i][j].angle = 0;
        }

    }

    return arrCar;
}

function fvis_create_vdata(json_emeta, stime, etime, waytype, iscross, clane, tval)
{
    var arrCar = [];
    var template_emeta = JSON.parse(json_emeta);
	
    var cab64 = template_emeta.items[0].dck.cab64s;
    var cab32 = template_emeta.items[0].dck.cab32s;
	
    var arrCar = fvis_init_car(template_emeta.items[0].dcv, stime);

    if (waytype == 'traffic')
    {
    	var objReturn = fvis_create_with_traffic(arrCar, template_emeta, stime, etime, iscross, cab64, cab32);
    	return JSON.stringify(objReturn);
    }
    else if (waytype == 'inter')
    {
        var objReturn = fvis_create_with_inter(arrCar, template_emeta, stime, etime, iscross, cab64, cab32);
    	return JSON.stringify(objReturn);
    }
   

    return null;
}

function fvis_create_with_traffic(arrCar, objEmeta, stime, etime, iscross, cab64, cab32)
{
    
	var objReturn = [];
 	for (var time=stime; time<etime; time+=FVIS_CAPTURE_STEP)
    {
    	var objJSONCapture = {
            dcpref : {
                cab64s : CAB64,
                op : DCK_PREF_OP,
                ser : 1
            },
            items : []
        };

        for (var i = 0; i < arrCar.length; i++) {
        	var carSpeed = (objEmeta.items[0].dcv.segs[i].smin + (objEmeta.items[0].dcv.segs[i].smax - objEmeta.items[0].dcv.segs[i].smin) / 2) * 1000 * 100 / 3600;
            
            // Get the L/R paint element
            var lpaint, rpaint;            
            for (var k = 0; k < objEmeta.items[1].dcv.paint.length; k ++) {
                if (objEmeta.items[0].dcv.segs[i].lpaint == objEmeta.items[1].dcv.paint[k].idx) lpaint = objEmeta.items[1].dcv.paint[k];
                if (objEmeta.items[0].dcv.segs[i].rpaint == objEmeta.items[1].dcv.paint[k].idx) rpaint = objEmeta.items[1].dcv.paint[k];
            }
            laneFlow = objEmeta.items[0].dcv.segs[i].flow;            
            // Define the X position for this lane
            var positionX = lpaint.pts[0][0] + Math.abs((rpaint.pts[0][0] - lpaint.pts[0][0]) / 2);            
            var positionY = 0;
            var positionZ = lpaint.pts[0][2] + Math.abs((rpaint.pts[0][2] - lpaint.pts[0][2]) / 2);
            
            // Initialize dck/dcv item array
            var arrCarItemSeg = [];
            for (var j = 0; j < arrCar[i].length; j++) arrCarItemSeg.push({dck : {}, dcv : {}, init : false});

            //Set Lane Direction
            var laneDirection;
            // Check the EVT Record
            var itemEVT4Car = {};           

            if(laneFlow == 1 ){
                
                if(curPositionZ = lpaint.pts[0][2] == 0){
                    laneDirection = true;
                } else {
                    laneDirection = false;
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
                            // console.log('carDistance', carDistance);
                            // Get the real car distance with the size of previous car
                            carDistance += arrCar[i][j - 1].bbox[2];

                            // Define the positionZ as minus value for this car
                            if(laneDirection){
                                curPositionZ = arrCar[i][j - 1].positionZ - carDistance;
                            } else {
                                curPositionZ = arrCar[i][j - 1].positionZ + carDistance;
                            }

                            // Let the car to move
                            arrCar[i][j].stop = "moving";
                            arrCar[i][j].status = 1;

                        } else if (arrCar[i][j].status == 1) { // If the car is started already
                            // Let the car move forward
                            if(laneDirection) {
                                if (arrCar[i][j].stop != "stop") curPositionZ = arrCar[i][j].positionZ + positionZStep;
                            } else {
                                if (arrCar[i][j].stop != "stop") curPositionZ = arrCar[i][j].positionZ - positionZStep;
                            }

                            // if prev Car is stop, and calculated position + next step is overflow, force the car stop and cur position is before next car
                            if (j > 0 && arrCar[i][j - 1].stop == "stop" && arrCar[i][j].stop == "moving" && (arrCar[i][j - 1].positionZ - arrCar[i][j - 1].bbox[2] - FVIS_CAR_DISTANCE_MIN * 100) < (curPositionZ)) {
                                if(laneDirection) {
                                    curPositionZ = arrCar[i][j - 1].positionZ - arrCar[i][j - 1].bbox[2] - FVIS_CAR_DISTANCE_MIN * 100;
                                } else {
                                    curPositionZ = arrCar[i][j - 1].positionZ + arrCar[i][j-1].bbox[2] + FVIS_CAR_DISTANCE_MIN * 100;
                                }
                                // If it is crash, remove the car distance                                
                                arrCar[i][j].stop = "stop";
                            }

                            // if cur car is stop, prev Car is moving, let this car start
                            if (j > 0 && arrCar[i][j-1].stop == "moving" && arrCar[i][j].stop == "stop" ) {
                                arrCar[i][j].stop = "start";
                            } else if (arrCar[i][j].stop == "start") { // If car is start, let it moving (1 second warning)
                                arrCar[i][j].stop = "moving";
                            }

                            // if car is over the lane, mark the car out of lane
                            if(laneDirection) {
                                if (curPositionZ > CAMERA_AREA_LONG * 100) arrCar[i][j].status = 2;
                            } else {
                                if (curPositionZ < 0 ) arrCar[i][j].status = 2;
                            }
                        }

                        // positionX
                        if (arrCar[i][j].status == 1) {
                            if (arrCar[i][j].stop != 'stop') 
                            {
                                arrCar[i][j].positionX = positionX;
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
                                        etick32 : etime,
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
            }

            if(laneFlow == 16 ){
                // Time loop
                if(curPositionZ = lpaint.pts[0][0] == -20000){
                    laneDirection = true;
                } else {
                    laneDirection = false;
                }
                for (var t = 0; t < FVIS_CAPTURE_STEP; t += FVIS_CAPTURE_FREQ / 1000) {
                    // For each car
                    for (var j = 0; j < arrCar[i].length; j ++ ) {

                        // Calculate the next movement
                        var carRot = Math.round(Math.PI * 1000 / 2) / 1000;
                        //console.log("carRot", carRot)
                        var positionXStep = Math.round((FVIS_CAPTURE_FREQ / 1000) * carSpeed);
                        var curPositionX =  arrCar[i][j].positionX;
                        var curPositionZ =  arrCar[i][j].positionZ;

                        if (j == 0 && arrCar[i][j].stop == 'stop' && arrCar[i][j].status == 0) { // If first car is not started yet, let it start
                            curPositionX = lpaint.pts[0][0];
                            // console.log("curPositionX", curPositionX)
                            arrCar[i][j].stop = 'moving';
                            arrCar[i][j].status = 1;
                        } else if (j > 0 && arrCar[i][j - 1].stop == 'moving' && arrCar[i][j - 1].positionX > -20000 && arrCar[i][j].stop == 'stop' && arrCar[i][j].status == 0) { // If pre car is moving and cur car is not started yet, let the car start by minus value
                            // Get the random car distance by cm
                            var carDistance = (FVIS_CAR_DISTANCE_MIN + (FVIS_CAR_DISTANCE_MAX - FVIS_CAR_DISTANCE_MIN) * Math.random()) * 100;
                            // console.log('carDistance', carDistance);
                            // Get the real car distance with the size of previous car
                            carDistance += arrCar[i][j - 1].bbox[2];

                            // Define the positionZ as minus value for this car
                            if(laneDirection){
                                curPositionX = arrCar[i][j - 1].positionX - carDistance;
                            } else {
                                curPositionX = arrCar[i][j - 1].positionX + carDistance;
                            }
                            // console.log("curPositionX", curPositionX);
                            // Let the car to move
                            arrCar[i][j].stop = "moving";
                            arrCar[i][j].status = 1;

                        } else if (arrCar[i][j].status == 1) { // If the car is started already
                            // Let the car move forward
                            if(laneDirection) {
                                if (arrCar[i][j].stop != "stop") curPositionX = arrCar[i][j].positionX + positionXStep;
                            } else {

                                if (arrCar[i][j].stop != "stop") curPositionX = arrCar[i][j].positionX - positionXStep;
                            }

                            // if prev Car is stop, and calculated position + next step is overflow, force the car stop and cur position is before next car
                            if (j > 0 && arrCar[i][j - 1].stop == "stop" && arrCar[i][j].stop == "moving" && (arrCar[i][j - 1].positionX - arrCar[i][j - 1].bbox[2] - FVIS_CAR_DISTANCE_MIN * 100) < (curPositionX)) {
                                if(laneDirection) {
                                    curPositionX = arrCar[i][j - 1].positionX - arrCar[i][j - 1].bbox[2] - FVIS_CAR_DISTANCE_MIN * 100;
                                } else {
                                    curPositionX = arrCar[i][j - 1].positionX + arrCar[i][j-1].bbox[2] + FVIS_CAR_DISTANCE_MIN * 100;
                                }
                                // If it is crash, remove the car distance
                                if ((j - 1) == evtIdxCar && evtTyp == 8) curPositionX = arrCar[i][j - 1].positionX - arrCar[i][j - 1].bbox[2];
                                arrCar[i][j].stop = "stop";
                            }

                            // if cur car is stop, prev Car is moving, let this car start
                            if (j > 0 && arrCar[i][j-1].stop == "moving" && arrCar[i][j].stop == "stop" && j != evtIdxCar) {
                                arrCar[i][j].stop = "start";
                            } else if (arrCar[i][j].stop == "start") { // If car is start, let it moving (1 second warning)
                                arrCar[i][j].stop = "moving";
                            }

                            // if car is over the lane, mark the car out of lane
                            if(laneDirection) {
                                if (curPositionX > 300 * 100) arrCar[i][j].status = 2;
                            } else {
                                if (curPositionX < -200*100 ) arrCar[i][j].status = 2;
                            }                            
                        }

                        // positionZ
                        if (arrCar[i][j].status == 1) {
                            if (arrCar[i][j].stop != 'stop') arrCar[i][j].positionZ = positionZ;
                        }

                        curPositionZ = Math.round(curPositionZ);
                        
                        // If car is moving, then add dck/dcv item
                        if (arrCar[i][j].status == 1 ) {
                            
                            // If current position is visible, create JSON
                            if (curPositionX > -20000) {
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
                                        etick32 : etime,
                                        freq : FVIS_CAPTURE_FREQ,
                                        apts : []
                                    };
                                    arrCarItemSeg[j].init = true;
                                }

                                // Put the apts
                                arrCarItemSeg[j].dcv.apts.push({
                                    dur : FVIS_CAPTURE_FREQ,
                                    seg : i + 1,
                                    rot : 0,
                                    pt : [curPositionX, positionY, arrCar[i][j].positionZ]
                                });
                            }

                            // Keep the current position
                            arrCar[i][j].positionX = curPositionX;
                        }

                    } // End of car loop
                } // End of t loop
            }

            if (laneFlow = 32) {

            }

            // Put the dck/dcv item to JSON
            for (var j = 0; j < arrCar[i].length; j ++) {
                
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
        }
        
        if (objJSONCapture.items.length > 0) objReturn.push(objJSONCapture);
    }

    return objReturn;
}

function fvis_create_with_inter(arrCar, objEmeta, stime, etime, iscross, cab64, cab32)
{
    var objReturn = [];
 	for (var time=stime; time<etime; time+=FVIS_CAPTURE_STEP)
    {
    	var objJSONCapture = {
            dcpref : {
                cab64s : CAB64,
                op : DCK_PREF_OP,
                ser : 1
            },
            items : []
        };

       
        for (var i = 0; i < arrCar.length; i++) {
        	var carSpeed = (objEmeta.items[0].dcv.segs[i].smin + (objEmeta.items[0].dcv.segs[i].smax - objEmeta.items[0].dcv.segs[i].smin) / 2) * 1000 * 100 / 3600;
            
            // Get the L/R paint element
            var lpaint, rpaint;            
            for (var k = 0; k < objEmeta.items[1].dcv.paint.length; k ++) {
                if (objEmeta.items[0].dcv.segs[i].lpaint == objEmeta.items[1].dcv.paint[k].idx) lpaint = objEmeta.items[1].dcv.paint[k];
                if (objEmeta.items[0].dcv.segs[i].rpaint == objEmeta.items[1].dcv.paint[k].idx) rpaint = objEmeta.items[1].dcv.paint[k];
            }
            laneFlow = objEmeta.items[0].dcv.segs[i].flow;         
            // Define the X position for this lane
            
            var positionX = lpaint.pts[0][0] + + Math.abs(LANE_WIDE * 100 / 2);   
            
            // Initialize dck/dcv item array
            var arrCarItemSeg = [];
            for (var j = 0; j < arrCar[i].length; j++) arrCarItemSeg.push({dck : {}, dcv : {}, init : false});

            //Set Lane Direction
            var laneDirection;
            // Check the EVT Record
            var itemEVT4Car = {};                       
                
                if(curPositionZ = lpaint.pts[0][2] == 0){
                    laneDirection = true;
                } else {
                    laneDirection = false;
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
                            // console.log('carDistance', carDistance);
                            // Get the real car distance with the size of previous car
                            carDistance += arrCar[i][j - 1].bbox[2];

                            // Define the positionZ as minus value for this car
                            if(laneDirection){
                                curPositionZ = arrCar[i][j - 1].positionZ - carDistance;
                                arrCar[i][j].positionX = positionX;
                            } else {
                                curPositionZ = arrCar[i][j - 1].positionZ + carDistance;
                                arrCar[i][j].positionX = positionX;
                            }

                            // Let the car to move
                            arrCar[i][j].stop = "moving";
                            arrCar[i][j].status = 1;

                        }
                        else if (arrCar[i][j].status == 1) { // If the car is started already
                            
                            // Let the car move forward
                            if(laneDirection) {
                                if (arrCar[i][j].stop != "stop")
                                {
                                    if ((curPositionZ < CAMERA_AREA_LONG * 100 / 2 && arrCar[i][j].positionY == 0) ||
                                    (curPositionZ > CAMERA_AREA_LONG * 100 / 2 && arrCar[i][j].positionY > STREET_RADIUS))
                                    {
                                        curPositionZ = arrCar[i][j].positionZ + positionZStep;
                                        arrCar[i][j].positionX = positionX;
                                    }                                        
                                    else
                                    {
                                        var vx = Math.round(positionX + (1 - Math.cos( 2 * Math.PI * arrCar[i][j].angle / STREET_RADIUS)) * INTER_RADIUS * 100);
                                        var vz = Math.round(CAMERA_AREA_LONG*100 / 2 + Math.sin(2 * Math.PI * arrCar[i][j].angle / STREET_RADIUS) * INTER_RADIUS * 100);
                                        
                                        arrCar[i][j].angle += 10;
                                        
                                        curPositionZ = vz;
                                        arrCar[i][j].positionY += STREET_RADIUS / (STREET_RADIUS / 10);
                                        arrCar[i][j].positionX = vx;
                                    }
                                } 
                            } else {
                                
                                if (arrCar[i][j].stop != "stop")
                                {
                                    if ((curPositionZ > CAMERA_AREA_LONG * 100 / 2 && arrCar[i][j].positionY == 0) ||
                                        (curPositionZ < CAMERA_AREA_LONG * 100 / 2 && arrCar[i][j].positionY < STREET_RADIUS))
                                        {
                                            curPositionZ = arrCar[i][j].positionZ - positionZStep;
                                            arrCar[i][j].positionX = positionX;
                                        }
                                    else
                                    {
                                        var vx = Math.round(positionX - Math.cos( 2 * Math.PI * arrCar[i][j].angle / STREET_RADIUS) * INTER_RADIUS * 100);
                                        var vz = Math.round(CAMERA_AREA_LONG / 2 + Math.sin(2 * Math.PI * arrCar[i][j].angle / STREET_RADIUS) * INTER_RADIUS * 100);
                                        
                                        arrCar[i][j].angle += 50;
                                        curPositionZ = vz;
                                        arrCar[i][j].positionY --;
                                        arrCar[i][j].positionX = vx;
                                        carRot = 2 * Math.PI * arrCar[i][j].angle / STREET_RADIUS;

                                    }
                                        
                                }                                 
                            }

                            // if prev Car is stop, and calculated position + next step is overflow, force the car stop and cur position is before next car
                            if (j > 0 && arrCar[i][j - 1].stop == "stop" && arrCar[i][j].stop == "moving" && (arrCar[i][j - 1].positionZ - arrCar[i][j - 1].bbox[2] - FVIS_CAR_DISTANCE_MIN * 100) < (curPositionZ)) {
                                if(laneDirection) {
                                    curPositionZ = arrCar[i][j - 1].positionZ - arrCar[i][j - 1].bbox[2] - FVIS_CAR_DISTANCE_MIN * 100;
                                } else {
                                    curPositionZ = arrCar[i][j - 1].positionZ + arrCar[i][j-1].bbox[2] + FVIS_CAR_DISTANCE_MIN * 100;
                                }
                                // If it is crash, remove the car distance                                
                                arrCar[i][j].stop = "stop";
                            }

                            // if cur car is stop, prev Car is moving, let this car start
                            if (j > 0 && arrCar[i][j-1].stop == "moving" && arrCar[i][j].stop == "stop" ) {
                                arrCar[i][j].stop = "start";
                            } else if (arrCar[i][j].stop == "start") { // If car is start, let it moving (1 second warning)
                                arrCar[i][j].stop = "moving";
                            }

                            // if car is over the lane, mark the car out of lane
                            if(laneDirection) {
                                if (curPositionZ > CAMERA_AREA_LONG * 100) arrCar[i][j].status = 2;
                            } else {
                                if (curPositionZ < 0 ) arrCar[i][j].status = 2;
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
                                        etick32 : etime,
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
                                    pt : [arrCar[i][j].positionX, arrCar[i][j].positionY, curPositionZ]
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
            // console.log(objJSONCapture);
            // Add EVT
            if (typeof itemEVT4Car.dck != 'undefined') {

                objJSONCapture.items.push(itemEVT4Car);
            }
        }
        

        if (objJSONCapture.items.length > 0) objReturn.push(objJSONCapture);
    }


    return objReturn;
}