
function emeta_create (idxZone, idxArea, idxCamera) {
    // Get the camera object from information
    if(idxCamera == 9){
        json = emeta_create_with_nine(idxZone, idxArea, idxCamera);
        return json;
    }

    if(idxCamera == 10){
        json = emeta_create_with_ten(idxZone, idxArea, idxCamera);
        return json;
    }
    var objCamera = {};
    for (var i = 0; i < CAMERA_INFO.length; i ++) {
        if (CAMERA_INFO[i].zone == idxZone && CAMERA_INFO[i].area == idxArea && CAMERA_INFO[i].camera == idxCamera) {
            objCamera = CAMERA_INFO[i];
            break;
        }
    }
    console.log("objCamera1", objCamera)
    // console.log("objCamera:", objCamera)
    // Define cab32
    var cab32 = idxZone + '-' + idxArea + '-' + '0' + '-' + idxCamera + '-' + '0';

    // Number of lane
    var cntLane = typeof objCamera.cntLane == 'undefined' ? 0 : objCamera.cntLane;
    var cntLaneCross = typeof objCamera.cntLaneCross == 'undefined' ? 0 : objCamera.cntLaneCross;

    // Camera Payload
    var payloadCamera = {
        focal : CAMERA_FOCAL,
        lens : CAMERA_LENS,
        pixels : CAMERA_PIXELS,
        dist : CAMERA_DIST,
        tilt : CAMERA_TILT,
        geo : [typeof objCamera.lat == 'undefined' ? CAMERA_DEFAULT_LAT : objCamera.lat , typeof objCamera.long == 'undefined' ? CAMERA_DEFAULT_LONG : objCamera.long],
        segs : []
    };
    // console.log("payloadCamera:", payloadCamera)
    // Paint Element
    var payloadPaintElement = []
    
    if (Number(cntLaneCross) + Number(cntLane) == 0){
        cntLane = 3;
        for (var idxLane = 0; idxLane <= cntLane; idxLane++) {
            // Paint Element
            var objPaintElement = {
                idx: idxLane + 1,
                clr: LANE_CLR,
                width: LANE_LINE_WIDTH,
                dashed: (idxLane == 0 || idxLane == cntLane) ? 0 : 1,
                pts: []
            };
            // console.log("objPaintElement:", objPaintElement)
            var xPos = (CAMERA_AREA_WIDTH - LANE_WIDE * cntLane) / 2 + LANE_WIDE * idxLane;

            for (var zPos = 0; zPos <= CAMERA_AREA_LONG; zPos += LANE_PTS_STEP) {
                var diff = 0;
                if (idxCamera == 11)
                    diff = Math.sin(2 * Math.PI * (zPos / CAMERA_AREA_LONG )) * 600;
                objPaintElement.pts.push([Math.round(xPos * 100  +  diff ), 0, zPos * LANE_PTS_STEP * 100]);  
            }
            
            payloadPaintElement.push(objPaintElement);

            // Camera "segs"
            if (idxLane < cntLane) {
                payloadCamera.segs.push({
                    idx: idxLane + 1,
                    type: LANE_TYPE,
                    flow: LANE_FLOW,
                    restrict: LANE_RESTRICT,
                    smin: LANE_SMIN - LANE_SDIFF * idxLane,
                    smax: LANE_SMAX - LANE_SDIFF * idxLane,
                    lpaint: idxLane + 1,
                    rpaint: idxLane + 2
                });
            }
        }
    }
    if(typeof objCamera.cntLane != 'undefined') {
        if(cntLane > 3){
            for (var idxLane = 0; idxLane < Math.round(cntLane/2); idxLane++) {
                // Paint Element
                var objPaintElement = {
                    idx: idxLane + 1,
                    clr: LANE_CLR,
                    width: LANE_LINE_WIDTH,
                    dashed: (idxLane == 0 || idxLane == cntLane) ? 0 : 1,
                    pts: []
                };
                // console.log("objPaintElement:", objPaintElement)
                var xPos = (CAMERA_AREA_WIDTH - LANE_WIDE * cntLane) / 2 + LANE_WIDE * idxLane;

                for (var zPos = CAMERA_AREA_LONG; zPos >= 0; zPos -= LANE_PTS_STEP) {
                    objPaintElement.pts.push([Math.round(xPos * 100), 0, zPos * 100]);
                }
                payloadPaintElement.push(objPaintElement);

                // Camera "segs"
                if (idxLane < cntLane) {
                    payloadCamera.segs.push({
                        idx: idxLane + 1,
                        type: LANE_TYPE,
                        flow: LANE_FLOW,
                        restrict: LANE_RESTRICT,
                        smin: LANE_SMIN - LANE_SDIFF * idxLane,
                        smax: LANE_SMAX - LANE_SDIFF * idxLane,
                        lpaint: idxLane + 1,
                        rpaint: idxLane + 2
                    });
                }
            }

            for (var idxLane = Math.round(cntLane / 2); idxLane <= cntLane; idxLane++) {
                // Paint Element
                var objPaintElement = {
                    idx: idxLane + 1,
                    clr: LANE_CLR,
                    width: LANE_LINE_WIDTH,
                    dashed: (idxLane == 0 || idxLane == cntLane) ? 0 : 1,
                    pts: []
                };
                // console.log("objPaintElement:", objPaintElement)
                var xPos = (CAMERA_AREA_WIDTH - LANE_WIDE * cntLane) / 2 + LANE_WIDE * idxLane;

                for (var zPos = 0; zPos <= CAMERA_AREA_LONG; zPos += LANE_PTS_STEP) {
                    objPaintElement.pts.push([Math.round(xPos * 100), 0, zPos * 100]);
                }
                payloadPaintElement.push(objPaintElement);

                // Camera "segs"
                if (idxLane < cntLane) {
                    payloadCamera.segs.push({
                        idx: idxLane + 1,
                        type: LANE_TYPE,
                        flow: LANE_FLOW,
                        restrict: LANE_RESTRICT,
                        smin: LANE_SMIN - LANE_SDIFF * idxLane,
                        smax: LANE_SMAX - LANE_SDIFF * idxLane,
                        lpaint: idxLane + 1,
                        rpaint: idxLane + 2
                    });
                }
            }
        }else{
            for (var idxLane = 0; idxLane <= cntLane; idxLane++) {
                // Paint Element
                var objPaintElement = {
                    idx: idxLane + 1,
                    clr: LANE_CLR,
                    width: LANE_LINE_WIDTH,
                    dashed: (idxLane == 0 || idxLane == cntLane) ? 0 : 1,
                    pts: []
                };
                // console.log("objPaintElement:", objPaintElement)
                var xPos = (CAMERA_AREA_WIDTH - LANE_WIDE * cntLane) / 2 + LANE_WIDE * idxLane;

                for (var zPos = 0; zPos <= CAMERA_AREA_LONG; zPos += LANE_PTS_STEP) {
                    objPaintElement.pts.push([Math.round(xPos * 100), 0, zPos * 100]);
                }
                payloadPaintElement.push(objPaintElement);

                // Camera "segs"
                if (idxLane < cntLane) {
                    payloadCamera.segs.push({
                        idx: idxLane + 1,
                        type: LANE_TYPE,
                        flow: LANE_FLOW,
                        restrict: LANE_RESTRICT,
                        smin: LANE_SMIN - LANE_SDIFF * idxLane,
                        smax: LANE_SMAX - LANE_SDIFF * idxLane,
                        lpaint: idxLane + 1,
                        rpaint: idxLane + 2
                    });
                }
            }
        }

    }
    if(typeof objCamera.cntLaneCross != 'undefined'){
        if(cntLane == 0){
            cntLaneCross = 0;
        }else{
            cntLaneCross = cntLane+1;
        }
        console.log('cntLaneCross', cntLaneCross)
        if(objCamera.cntLaneCross < 4) {
            for (var idxLane = cntLaneCross; idxLane <= cntLaneCross + objCamera.cntLaneCross; idxLane++) {
                // Paint Element
                var objPaintElement = {
                    idx: idxLane + 1,
                    clr: LANE_CLR,
                    width: LANE_LINE_WIDTH,
                    dashed: (idxLane == 0 || idxLane == cntLane) ? 0 : 1,
                    pts: []
                };
                // console.log("objPaintElement:", objPaintElement)
                // var xPos = (CAMERA_AREA_WIDTH - LANE_WIDE * cntLane) / 2 + LANE_WIDE * idxLane;
                var zPos = 100 + 5 * idxLane;
                for (var xPos = -200; xPos <= 300; xPos += LANE_PTS_STEP) {
                    objPaintElement.pts.push([Math.round(xPos * 100), 0, zPos * 100]);
                }
                payloadPaintElement.push(objPaintElement);

                // Camera "segs"
                if (idxLane < cntLaneCross + objCamera.cntLaneCross) {
                    payloadCamera.segs.push({
                        idx: idxLane + 1,
                        type: LANE_TYPE,
                        flow: 16,
                        restrict: LANE_RESTRICT,
                        smin: LANE_SMIN - LANE_SDIFF * idxLane,
                        smax: LANE_SMAX - LANE_SDIFF * idxLane,
                        lpaint: idxLane + 1,
                        rpaint: idxLane + 2
                    });
                }
            }
        }else{
            for (var idxLane = cntLaneCross; idxLane < cntLaneCross + Math.round(objCamera.cntLaneCross/2); idxLane++) {
                // Paint Element
                var objPaintElement = {
                    idx: idxLane + 1,
                    clr: LANE_CLR,
                    width: LANE_LINE_WIDTH,
                    dashed: (idxLane == 0 || idxLane == cntLane) ? 0 : 1,
                    pts: []
                };
                // console.log("objPaintElement:", objPaintElement)
                // var xPos = (CAMERA_AREA_WIDTH - LANE_WIDE * cntLane) / 2 + LANE_WIDE * idxLane;
                var zPos = 100 + 5 * idxLane;
                for (var xPos = -200; xPos <= 300; xPos += LANE_PTS_STEP) {
                    objPaintElement.pts.push([Math.round(xPos * 100), 0, zPos * 100]);
                }
                payloadPaintElement.push(objPaintElement);

                // Camera "segs"
                if (idxLane < cntLaneCross + objCamera.cntLaneCross) {
                    payloadCamera.segs.push({
                        idx: idxLane + 1,
                        type: LANE_TYPE,
                        flow: 16,
                        restrict: LANE_RESTRICT,
                        smin: LANE_SMIN - LANE_SDIFF * (cntLaneCross-idxLane),
                        smax: LANE_SMAX - LANE_SDIFF * (cntLaneCross-idxLane),
                        lpaint: idxLane + 1,
                        rpaint: idxLane + 2
                    });
                }
            }

            for (var idxLane = cntLaneCross + Math.round(objCamera.cntLaneCross/2); idxLane <= cntLaneCross + objCamera.cntLaneCross; idxLane++) {
                // Paint Element
                var objPaintElement = {
                    idx: idxLane + 1,
                    clr: LANE_CLR,
                    width: LANE_LINE_WIDTH,
                    dashed: (idxLane == 0 || idxLane == cntLane) ? 0 : 1,
                    pts: []
                };
                // console.log("objPaintElement:", objPaintElement)
                // var xPos = (CAMERA_AREA_WIDTH - LANE_WIDE * cntLane) / 2 + LANE_WIDE * idxLane;
                var zPos = 100 + 5 * idxLane;
                for (var xPos = 300; xPos >= -200; xPos -= LANE_PTS_STEP) {
                    objPaintElement.pts.push([Math.round(xPos * 100), 0, zPos * 100]);
                }
                payloadPaintElement.push(objPaintElement);

                // Camera "segs"
                if (idxLane < cntLaneCross + objCamera.cntLaneCross) {
                    payloadCamera.segs.push({
                        idx: idxLane + 1,
                        type: LANE_TYPE,
                        flow: 16,
                        restrict: LANE_RESTRICT,
                        smin: LANE_SMIN - LANE_SDIFF * (cntLaneCross-idxLane),
                        smax: LANE_SMAX - LANE_SDIFF * (cntLaneCross-idxLane),
                        lpaint: idxLane + 1,
                        rpaint: idxLane + 2
                    });
                }
            }
        }
    }
    // JSON object
    var objJSON = {
        dcpref : {
            cab64s : CAB64,
            op : DCK_PREF_OP,
            ser : 1
        },
        items : [
            {
                dck : {
                    op16 : DCK_OP_EMETA,
                    cla : DCK_CLA,
                    clb : DCK_CLB_EMETA_CAMERA,
                    cab64s : CAB64,
                    cab32s : cab32
                },
                dcv : payloadCamera
            },
            {
                dck : {
                    op16 : DCK_OP_EMETA,
                    cla : DCK_CLA,
                    clb : DCK_CLB_EMETA_PAINTELEMENT,
                    cab64s : CAB64,
                    cab32s : cab32
                },
                dcv : {paint : payloadPaintElement}
            }
        ]
    };

    return JSON.stringify(objJSON);
}

function emeta_create_with_nine (idxZone, idxArea, idxCamera) {
    // Get the camera object from information
    var objCamera = {};
    for (var i = 0; i < CAMERA_INFO.length; i ++) {
        if (CAMERA_INFO[i].zone == idxZone && CAMERA_INFO[i].area == idxArea && CAMERA_INFO[i].camera == idxCamera) {
            objCamera = CAMERA_INFO[i];
            break;
        }
    }

    // Define cab32
    var cab32 = idxZone + '-' + idxArea + '-' + '0' + '-' + idxCamera + '-' + '0';

    // Number of lane
    var cntLane = typeof objCamera.cntLane == 'undefined' ? 0 : objCamera.cntLane;
    var cntLaneCross = typeof objCamera.cntLaneCross == 'undefined' ? 0 : objCamera.cntLaneCross;

    // Camera Payload
    var payloadCamera = {
        focal : CAMERA_FOCAL,
        lens : CAMERA_LENS,
        pixels : CAMERA_PIXELS,
        dist : CAMERA_DIST,
        tilt : CAMERA_TILT,
        geo : [typeof objCamera.lat == 'undefined' ? CAMERA_DEFAULT_LAT : objCamera.lat , typeof objCamera.long == 'undefined' ? CAMERA_DEFAULT_LONG : objCamera.long],
        segs : []
    };
    // console.log("payloadCamera:", payloadCamera)
    // Paint Element
    var payloadPaintElement = []
    if(typeof objCamera.cntLane != 'undefined') {

        for (var idxLane = 0; idxLane <= Math.round(cntLane/2); idxLane++) {
            // Paint Element
            var objPaintElement = {
                idx: idxLane + 1,
                clr: LANE_CLR,
                width: LANE_LINE_WIDTH,
                dashed: (idxLane == 0 || idxLane == cntLane) ? 0 : 1,
                pts: []
            };
            // console.log("objPaintElement:", objPaintElement)
            var xPos = (CAMERA_AREA_WIDTH - LANE_WIDE * cntLane) / 2 + LANE_WIDE * idxLane-10;

            for (var zPos = CAMERA_AREA_LONG; zPos >= 0; zPos -= LANE_PTS_STEP) {
                objPaintElement.pts.push([Math.round(xPos * 100), 0, zPos * 100]);
            }
            payloadPaintElement.push(objPaintElement);

            // Camera "segs"
            if (idxLane < Math.round(cntLane / 2)) {
                payloadCamera.segs.push({
                    idx: idxLane + 1,
                    type: LANE_TYPE,
                    flow: LANE_FLOW,
                    restrict: LANE_RESTRICT,
                    smin: LANE_SMIN - LANE_SDIFF * idxLane,
                    smax: LANE_SMAX - LANE_SDIFF * idxLane,
                    lpaint: idxLane + 1,
                    rpaint: idxLane + 2
                });
            }
        }
         
        for (var idxLane = Math.round(cntLane / 2) ; idxLane <= cntLane; idxLane++) {
                // Paint Element
                var objPaintElement = {
                    idx: idxLane + 1,
                    clr: LANE_CLR,
                    width: LANE_LINE_WIDTH,
                    dashed: (idxLane == 0 || idxLane == cntLane) ? 0 : 1,
                    pts: []
                };
                // console.log("objPaintElement:", objPaintElement)
                var xPos = (CAMERA_AREA_WIDTH - LANE_WIDE * cntLane) / 2 + LANE_WIDE * idxLane;

                for (var zPos = 0; zPos <= CAMERA_AREA_LONG; zPos += LANE_PTS_STEP) {
                    objPaintElement.pts.push([Math.round(xPos * 100), 0, zPos * 100]);
                }
                payloadPaintElement.push(objPaintElement);

                // Camera "segs"
                if (idxLane < cntLane) {
                    payloadCamera.segs.push({
                        idx: idxLane + 1,
                        type: LANE_TYPE,
                        flow: LANE_FLOW,
                        restrict: LANE_RESTRICT,
                        smin: LANE_SMIN - LANE_SDIFF * idxLane,
                        smax: LANE_SMAX - LANE_SDIFF * idxLane,
                        lpaint: idxLane + 1,
                        rpaint: idxLane + 2
                    });
                }
            }

    }
    if(typeof objCamera.cntLaneCross != 'undefined') {
        if(cntLane == 0){
            cntLaneCross = 0;
        }else{
            cntLaneCross = cntLane+1;
        }

            for (var idxLane = cntLaneCross; idxLane < cntLaneCross + Math.round(objCamera.cntLaneCross/2); idxLane++) {
                // Paint Element
                var objPaintElement = {
                    idx: idxLane + 1,
                    clr: LANE_CLR,
                    width: LANE_LINE_WIDTH,
                    dashed: (idxLane == 0 || idxLane == cntLane) ? 0 : 1,
                    pts: []
                };
                // console.log("objPaintElement:", objPaintElement)
                // var xPos = (CAMERA_AREA_WIDTH - LANE_WIDE * cntLane) / 2 + LANE_WIDE * idxLane;
                var zPos = 270 + 5 * idxLane;
                for (var xPos = -200; xPos <= 300; xPos += LANE_PTS_STEP) {
                    objPaintElement.pts.push([Math.round(xPos * 100), 600, zPos * 100]);
                }
                payloadPaintElement.push(objPaintElement);

                // Camera "segs"
                if (idxLane < cntLaneCross + objCamera.cntLaneCross) {
                    payloadCamera.segs.push({
                        idx: idxLane + 1,
                        type: LANE_TYPE,
                        flow: 16,
                        restrict: LANE_RESTRICT,
                        smin: LANE_SMIN - LANE_SDIFF * (cntLaneCross-idxLane),
                        smax: LANE_SMAX - LANE_SDIFF * (cntLaneCross-idxLane),
                        lpaint: idxLane + 1,
                        rpaint: idxLane + 2
                    });
                }
            }

            for (var idxLane = cntLaneCross + Math.round(objCamera.cntLaneCross/2); idxLane <= cntLaneCross + objCamera.cntLaneCross; idxLane++) {
                // Paint Element
                var objPaintElement = {
                    idx: idxLane + 1,
                    clr: LANE_CLR,
                    width: LANE_LINE_WIDTH,
                    dashed: (idxLane == 0 || idxLane == cntLane) ? 0 : 1,
                    pts: []
                };
                // console.log("objPaintElement:", objPaintElement)
                // var xPos = (CAMERA_AREA_WIDTH - LANE_WIDE * cntLane) / 2 + LANE_WIDE * idxLane;
                var zPos = 270 + 5 * idxLane;
                for (var xPos = 300; xPos >= -200; xPos -= LANE_PTS_STEP) {
                    objPaintElement.pts.push([Math.round(xPos * 100), 600, zPos * 100]);
                }
                payloadPaintElement.push(objPaintElement);

                // Camera "segs"
                if (idxLane < cntLaneCross + objCamera.cntLaneCross) {
                    payloadCamera.segs.push({
                        idx: idxLane + 1,
                        type: LANE_TYPE,
                        flow: 16,
                        restrict: LANE_RESTRICT,
                        smin: LANE_SMIN - LANE_SDIFF * (cntLaneCross-idxLane),
                        smax: LANE_SMAX - LANE_SDIFF * (cntLaneCross-idxLane),
                        lpaint: idxLane + 1,
                        rpaint: idxLane + 2
                    });
                }
            }
    }
    // JSON object
    var objJSON = {
        dcpref : {
            cab64s : CAB64,
            op : DCK_PREF_OP,
            ser : 1
        },
        items : [
            {
                dck : {
                    op16 : DCK_OP_EMETA,
                    cla : DCK_CLA,
                    clb : DCK_CLB_EMETA_CAMERA,
                    cab64s : CAB64,
                    cab32s : cab32
                },
                dcv : payloadCamera
            },
            {
                dck : {
                    op16 : DCK_OP_EMETA,
                    cla : DCK_CLA,
                    clb : DCK_CLB_EMETA_PAINTELEMENT,
                    cab64s : CAB64,
                    cab32s : cab32
                },
                dcv : {paint : payloadPaintElement}
            }
        ]
    };

    return JSON.stringify(objJSON);
}

function emeta_create_with_ten (idxZone, idxArea, idxCamera) {
    // Get the camera object from information
    var objCamera = {};
    for (var i = 0; i < CAMERA_INFO.length; i ++) {
        if (CAMERA_INFO[i].zone == idxZone && CAMERA_INFO[i].area == idxArea && CAMERA_INFO[i].camera == idxCamera) {
            objCamera = CAMERA_INFO[i];
            break;
        }
    }

    // Define cab32
    var cab32 = idxZone + '-' + idxArea + '-' + '0' + '-' + idxCamera + '-' + '0';

    // Number of lane
    var cntLane = typeof objCamera.cntLane == 'undefined' ? 0 : objCamera.cntLane;
    var cntLaneCross = typeof objCamera.cntLaneCross == 'undefined' ? 0 : objCamera.cntLaneCross;

    // Camera Payload
    var payloadCamera = {
        focal : CAMERA_FOCAL,
        lens : CAMERA_LENS,
        pixels : CAMERA_PIXELS,
        dist : CAMERA_DIST,
        tilt : CAMERA_TILT,
        geo : [typeof objCamera.lat == 'undefined' ? CAMERA_DEFAULT_LAT : objCamera.lat , typeof objCamera.long == 'undefined' ? CAMERA_DEFAULT_LONG : objCamera.long],
        segs : []
    };
    // console.log("payloadCamera:", payloadCamera)
    // Paint Element
    var payloadPaintElement = [];
    var nIdxlane = 0;
    if(typeof objCamera.cntLane != 'undefined') {
        
        for (var idxLane = 0; idxLane <= Math.round(cntLane/2); idxLane++) {
            // Paint Element
            nIdxlane++;
            var objPaintElement = {
                idx: nIdxlane,
                clr: LANE_CLR,
                width: LANE_LINE_WIDTH,
                dashed: (idxLane == 0 || idxLane == cntLane) ? 0 : 1,
                pts: []
            };
            // console.log("objPaintElement:", objPaintElement)
            var xPos = (CAMERA_AREA_WIDTH - LANE_WIDE * cntLane) / 2 + LANE_WIDE * idxLane - 10;

            for (var zPos = CAMERA_AREA_LONG; zPos >= 0; zPos -= LANE_PTS_STEP) {
                objPaintElement.pts.push([Math.round(xPos * 100), 0, zPos * 100]);
            }
            payloadPaintElement.push(objPaintElement);

            // Camera "segs"            
            if (idxLane < Math.round(cntLane / 2)){
                payloadCamera.segs.push({
                    idx: idxLane,
                    type: LANE_TYPE,
                    flow:  (idxLane == 0)? (1|2): 1,
                    restrict:  (1|2|4), //bus or trucks or car
                    smin: LANE_SMIN - LANE_SDIFF * (1 - idxLane),
                    smax: LANE_SMAX - LANE_SDIFF * (1 - idxLane),
                    lpaint: idxLane + 1,
                    rpaint: idxLane + 2
                });
            }           
        }

        for (var idxLane = Math.round(cntLane / 2); idxLane <= cntLane; idxLane++) {
            // Paint Element
            nIdxlane ++;
            var objPaintElement = {
                idx: nIdxlane,
                clr: LANE_CLR,
                width: LANE_LINE_WIDTH,
                dashed: (idxLane == 0 || idxLane == cntLane) ? 0 : 1,
                pts: []
            };
            // console.log("objPaintElement:", objPaintElement)
            var xPos = (CAMERA_AREA_WIDTH - LANE_WIDE * cntLane) / 2 + LANE_WIDE * idxLane;

            for (var zPos = 0; zPos <= CAMERA_AREA_LONG; zPos += LANE_PTS_STEP) {
                objPaintElement.pts.push([Math.round(xPos * 100), 0, zPos * 100]);
            }
            payloadPaintElement.push(objPaintElement);

            // Camera "segs"
            if (idxLane < cntLane) {
                payloadCamera.segs.push({
                    idx: idxLane,
                    type: LANE_TYPE,
                    flow:  (idxLane == 2)? 1: (1|2),
                    restrict:  (1|2|4), //car : bus or trucks 
                    smin: LANE_SMIN - LANE_SDIFF * idxLane,
                    smax: LANE_SMAX - LANE_SDIFF * idxLane,
                    lpaint: idxLane + 2,
                    rpaint: idxLane + 3
                });
            }
        }

    }
    if(typeof objCamera.cntLaneCross != 'undefined'){
        var ncount = Math.round(objCamera.cntLaneCross/2);
        if(cntLane == 0){
            cntLaneCross = 0;
        }else{
            cntLaneCross = cntLane;            
        }

        for (var idxLane = cntLaneCross; idxLane <= cntLaneCross + Math.round(objCamera.cntLaneCross/2); idxLane++) {
            // Paint Element
            nIdxlane++;
            var objPaintElement = {
                idx: nIdxlane,
                clr: LANE_CLR,
                width: LANE_LINE_WIDTH,
                dashed: (idxLane == 0 || idxLane == cntLane) ? 0 : 1,
                pts: []
            };
            // console.log("objPaintElement:", objPaintElement)
            // var xPos = (CAMERA_AREA_WIDTH - LANE_WIDE * cntLane) / 2 + LANE_WIDE * idxLane;
            var zPos = 50 + 5 * idxLane - 10;
            
            for (var xPos = -200; xPos <= 300; xPos += LANE_PTS_STEP) {
                objPaintElement.pts.push([Math.round(xPos * 100), 1, zPos * 100]);
            }
            payloadPaintElement.push(objPaintElement);

            // Camera "segs"
            if (idxLane < cntLaneCross + ncount) {
                payloadCamera.segs.push({
                    idx: idxLane,
                    type: LANE_TYPE,
                    flow: (idxLane == 4)? (16|2) : 16, //right
                    restrict: (1|2|4), //out is bus or trucks , in is car
                    smin: LANE_SMIN - LANE_SDIFF * (idxLane - cntLaneCross),
                    smax: LANE_SMAX - LANE_SDIFF * (idxLane - cntLaneCross),
                    lpaint: idxLane + 3,
                    rpaint: idxLane + 4
                });
            }
        }

        for (var idxLane = cntLaneCross + Math.round(objCamera.cntLaneCross/2); idxLane <= cntLaneCross + objCamera.cntLaneCross; idxLane++) {
            // Paint Element
            nIdxlane++;
            var objPaintElement = {
                idx: nIdxlane,
                clr: LANE_CLR,
                width: LANE_LINE_WIDTH,
                dashed: (idxLane == 0 || idxLane == cntLane) ? 0 : 1,
                pts: []
            };
            // console.log("objPaintElement:", objPaintElement)
            // var xPos = (CAMERA_AREA_WIDTH - LANE_WIDE * cntLane) / 2 + LANE_WIDE * idxLane;
            var zPos = 50 + 5 * idxLane;

            for (var xPos = 300; xPos >= -200; xPos -= LANE_PTS_STEP) {
                objPaintElement.pts.push([Math.round(xPos * 100), 1, zPos * 100]);
            }
            payloadPaintElement.push(objPaintElement);
            // Camera "segs"
            if (idxLane < cntLaneCross + objCamera.cntLaneCross) {
                payloadCamera.segs.push({
                    idx: idxLane,
                    type: LANE_TYPE,
                    flow: (idxLane == 6)? 32 : (2|32),
                    restrict:  (1|2|4),
                    smin: LANE_SMIN - LANE_SDIFF * (cntLaneCross-idxLane),
                    smax: LANE_SMAX - LANE_SDIFF * (cntLaneCross-idxLane),
                    lpaint: idxLane + 4,
                    rpaint: idxLane + 5
                });
            }
        }
    }
    cntLaneCrossSecond = cntLaneCross+cntLaneCross ;
    
    for (var idxLane = cntLaneCrossSecond; idxLane <= cntLaneCrossSecond + Math.round(objCamera.cntLaneCross/2); idxLane++) {
        // Paint Element
        nIdxlane++;
        var objPaintElement = {
            idx: nIdxlane,
            clr: LANE_CLR,
            width: LANE_LINE_WIDTH,
            dashed: (idxLane == 0 || idxLane == cntLane) ? 0 : 1,
            pts: []
        };
        // console.log("objPaintElement:", objPaintElement)
        // var xPos = (CAMERA_AREA_WIDTH - LANE_WIDE * cntLane) / 2 + LANE_WIDE * idxLane;
        var zPos = 300 + 5 * idxLane - 10;

        for (var xPos = -200; xPos <= 300; xPos += LANE_PTS_STEP) {
            objPaintElement.pts.push([Math.round(xPos * 100), 1, zPos * 100]);
        }
        payloadPaintElement.push(objPaintElement);

        // Camera "segs"
        if (idxLane < cntLaneCrossSecond +  Math.round(objCamera.cntLaneCross/2)) {
            payloadCamera.segs.push({
                idx: idxLane,
                type: LANE_TYPE,
                flow: (idxLane == 8)? (2|16): 16,
                restrict: (1|2|4),
                smin: LANE_SMIN - LANE_SDIFF * (idxLane - cntLaneCrossSecond),
                smax: LANE_SMAX - LANE_SDIFF * (idxLane - cntLaneCrossSecond),
                lpaint: idxLane + 5,
                rpaint: idxLane + 6
            });
        }
    }

    for (var idxLane = cntLaneCrossSecond + Math.round(objCamera.cntLaneCross/2); idxLane <= cntLaneCrossSecond + objCamera.cntLaneCross; idxLane++) {
        // Paint Element
        nIdxlane++;
        var objPaintElement = {
            idx: nIdxlane,
            clr: LANE_CLR,
            width: LANE_LINE_WIDTH,
            dashed: (idxLane == 0 || idxLane == cntLane) ? 0 : 1,
            pts: []
        };
        // console.log("objPaintElement:", objPaintElement)
        // var xPos = (CAMERA_AREA_WIDTH - LANE_WIDE * cntLane) / 2 + LANE_WIDE * idxLane;
        var zPos = 300 + 5 * idxLane;

        for (var xPos = 300; xPos >= -200; xPos -= LANE_PTS_STEP) {
            objPaintElement.pts.push([Math.round(xPos * 100), 1, zPos * 100]);
        }
        payloadPaintElement.push(objPaintElement);

        // Camera "segs"
        if (idxLane < cntLaneCrossSecond + objCamera.cntLaneCross) {
            payloadCamera.segs.push({
                idx: idxLane,
                type: LANE_TYPE,
                flow: (idxLane == 10)? (2|32): 32,
                restrict: (1|2|4),
                smin: LANE_SMIN - LANE_SDIFF * (cntLaneCrossSecond + Math.round(objCamera.cntLaneCross/2)-idxLane),
                smax: LANE_SMAX - LANE_SDIFF * (cntLaneCrossSecond + Math.round(objCamera.cntLaneCross/2)-idxLane),
                lpaint: idxLane + 6,
                rpaint: idxLane + 7
            });
        }
    }

    cntLaneSecond = cntLaneCrossSecond + objCamera.cntLaneCross;
    for (var idxLane = cntLaneSecond; idxLane < cntLaneSecond+1; idxLane++) {
        // Paint Element
        nIdxlane++;
        var objPaintElement = {
            idx: nIdxlane,
            clr: LANE_CLR,
            width: LANE_LINE_WIDTH,
            dashed: (idxLane == 0 || idxLane == cntLane) ? 0 : 1,
            pts: []
        };
        // console.log("objPaintElement:", objPaintElement)
        
        for (var zPos = CAMERA_AREA_LONG; zPos >= 0; zPos -= LANE_PTS_STEP) {
            objPaintElement.pts.push([zPos * 25 - 50*100, 2500 * Math.sin( Math.PI * (zPos / CAMERA_AREA_LONG)), zPos * 100]);
        }
        payloadPaintElement.push(objPaintElement);

        // Camera "segs"
        if (idxLane < cntLaneSecond + 1) {
            payloadCamera.segs.push({
                idx: idxLane ,
                type: LANE_TYPE,
                flow: LANE_FLOW,
                restrict: (1 | 2),
                smin: LANE_SMIN,
                smax: LANE_SMAX,
                lpaint: idxLane + 7,
                rpaint: idxLane + 8
            });
        }
    }

    
    for (var idxLane = cntLaneSecond+1; idxLane <= cntLaneSecond+2; idxLane++) {
        // Paint Element
        nIdxlane++;
        var objPaintElement = {
            idx: nIdxlane,
            clr: LANE_CLR,
            width: LANE_LINE_WIDTH,
            dashed: (idxLane == 0 || idxLane == cntLane) ? 0 : 1,
            pts: []
        };
        // console.log("objPaintElement:", objPaintElement)
        var xPos = (CAMERA_AREA_WIDTH - LANE_WIDE * cntLane) / 2 -20;

        for (var zPos = 0; zPos <= CAMERA_AREA_LONG; zPos += LANE_PTS_STEP) {
            objPaintElement.pts.push([zPos * 25 - (45 - LANE_WIDE* (idxLane - cntLaneSecond - 1) )*100, 2500 * Math.sin(Math.PI * (zPos / CAMERA_AREA_LONG)), zPos * 100]);           
        }

        payloadPaintElement.push(objPaintElement);

        // Camera "segs"
        if (idxLane < cntLaneSecond+2) {
            payloadCamera.segs.push({
                idx: idxLane,
                type: LANE_TYPE,
                flow: LANE_FLOW,
                restrict: LANE_RESTRICT,
                smin: LANE_SMIN - LANE_SDIFF,
                smax: LANE_SMAX - LANE_SDIFF,
                lpaint: idxLane + 8,
                rpaint: idxLane + 9
            });
        }
    }

    cntLaneSecond += 2;
    for (var idxLane = cntLaneSecond; idxLane <= cntLaneSecond + 1; idxLane++) {
        // Paint Element
        nIdxlane++;
        var objPaintElement = {
            idx: nIdxlane,
            clr: LANE_CLR,
            width: LANE_LINE_WIDTH,
            dashed: (idxLane == 0 || idxLane == cntLane) ? 0 : 1,
            pts: []
        };
        // console.log("objPaintElement:", objPaintElement)

        var zPos = 90 + (idxLane - cntLaneSecond) * LANE_WIDE;

        for (var xPos = -200; xPos <= 300; xPos += LANE_PTS_STEP) {
            objPaintElement.pts.push([xPos * 100, 2000 * Math.sin (Math.PI * (xPos + 200) / 500), (zPos*100 +  Math.sin( Math.PI * (xPos + 200)/500) * 11500) ]);
        }
        payloadPaintElement.push(objPaintElement);

        // Camera "segs"
        if (idxLane < cntLaneSecond + 1) {
            payloadCamera.segs.push({
                idx: idxLane,
                type: LANE_TYPE,
                flow: 16, //right
                restrict: (1|2|4), //out is bus or trucks , in is car
                smin: LANE_SMIN - LANE_SDIFF ,
                smax: LANE_SMAX - LANE_SDIFF,
                lpaint: idxLane + 9,
                rpaint: idxLane + 10
            });
        }
    }

    for (var idxLane = cntLaneSecond + 1 ; idxLane <= cntLaneSecond + 2; idxLane++) {
        // Paint Element
        nIdxlane++;
        var objPaintElement = {
            idx: nIdxlane,
            clr: LANE_CLR,
            width: LANE_LINE_WIDTH,
            dashed: (idxLane == 0 || idxLane == cntLane) ? 0 : 1,
            pts: []
        };
        // console.log("objPaintElement:", objPaintElement)
        var zPos = 325 + (idxLane - cntLaneSecond - 1) * LANE_WIDE;
        for (var xPos = 300; xPos >= -200; xPos -= LANE_PTS_STEP) {
            objPaintElement.pts.push([xPos * 100, 2000 * Math.sin(Math.PI * (xPos + 200) / 500 ), (zPos*100 - Math.sin( Math.PI * (xPos + 200)/500)*11500) ]);
        }
        payloadPaintElement.push(objPaintElement);

        // Camera "segs"
        if (idxLane < cntLaneSecond + 2) {
            payloadCamera.segs.push({
                idx: idxLane,
                type: LANE_TYPE,
                flow: 32,
                restrict:  (1|2|4),
                smin: LANE_SMIN - LANE_SDIFF,
                smax: LANE_SMAX - LANE_SDIFF,
                lpaint: idxLane + 10,
                rpaint: idxLane + 11
            });
        }
    }

    // JSON object
    var objJSON = {
        dcpref : {
            cab64s : CAB64,
            op : DCK_PREF_OP,
            ser : 1
        },
        items : [
            {
                dck : {
                    op16 : DCK_OP_EMETA,
                    cla : DCK_CLA,
                    clb : DCK_CLB_EMETA_CAMERA,
                    cab64s : CAB64,
                    cab32s : cab32
                },
                dcv : payloadCamera
            },
            {
                dck : {
                    op16 : DCK_OP_EMETA,
                    cla : DCK_CLA,
                    clb : DCK_CLB_EMETA_PAINTELEMENT,
                    cab64s : CAB64,
                    cab32s : cab32
                },
                dcv : {paint : payloadPaintElement}
            }
        ]
    };

    return JSON.stringify(objJSON);
}