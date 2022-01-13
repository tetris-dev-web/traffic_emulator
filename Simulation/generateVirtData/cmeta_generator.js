
function emeta_create_generator (idxZone, idxArea, idxCamera, waytype, lanecnt, interval) {
    // Get the camera object from information
    var objCamera = {};
    for (var i = 0; i < CAMERA_INFO.length; i ++) {
        if (CAMERA_INFO[i].zone == idxZone && CAMERA_INFO[i].area == idxArea && CAMERA_INFO[i].camera == idxCamera) {
            objCamera = CAMERA_INFO[i];
            break;
        }
    }
    // console.log("objCamera:", objCamera)
    // Define cab32
    var cab32 = idxZone + '-' + idxArea + '-' + '0' + '-' + idxCamera + '-' + '0';


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
    
    var payloadPaintElement = [];
    if (waytype === 'onedir')
    {
        payloadPaintElement = emata_create_with_one_direction(payloadPaintElement, lanecnt);
    }

    if (waytype === 'twodir')
    {
        payloadPaintElement = emata_create_with_two_direction(payloadPaintElement, lanecnt);
    }

    if (waytype === 'curve')
    {
        payloadPaintElement = emata_create_with_curve(payloadPaintElement, lanecnt);        
    }

    if (waytype === 'cross')
    {
        json = emata_create_with_cross(payloadPaintElement, lanecnt);
        return json;
    }

    if (waytype === 'onebridge')
    {
        json = emata_create_with_onebridge(payloadPaintElement, lanecnt);
        return json;
    }

    if (waytype === 'twobridge')
    {
        json = emata_create_with_twobridge(payloadPaintElement, lanecnt);
        return json;
    }

    // Camera "segs"
    for (var idxLane = 0; idxLane <= lanecnt; idxLane++) {
        if (idxLane < lanecnt) {
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

function emata_create_with_one_direction(paintElement, lanecnt)
{
    // Paint Element      
    for (var idxLane = 0; idxLane <= lanecnt; idxLane++) {
        // Paint Element
        var objPaintElement = {
            idx: idxLane + 1,
            clr: LANE_CLR,
            width: LANE_LINE_WIDTH,
            dashed: (idxLane == 0 || idxLane == lanecnt) ? 0 : 1,
            pts: []
        };
        // console.log("objPaintElement:", objPaintElement)
        var xPos = (CAMERA_AREA_WIDTH - LANE_WIDE * lanecnt) / 2 + LANE_WIDE * idxLane;

        for (var zPos = 0; zPos <= CAMERA_AREA_LONG; zPos += LANE_PTS_STEP) {              
            objPaintElement.pts.push([Math.round(xPos * 100 ), 0, zPos * LANE_PTS_STEP * 100]);  
        }
        
        paintElement.push(objPaintElement);
    }
       
    return paintElement;
}

function emata_create_with_two_direction(paintElement, lanecnt)
{

    for (var idxLane = 0; idxLane < Math.round(lanecnt/2); idxLane++) {
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
        paintElement.push(objPaintElement);
    }

    for (var idxLane = Math.round(lanecnt / 2); idxLane <= lanecnt; idxLane++) {
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
        paintElement.push(objPaintElement);

    }

    return paintElement;
}

function emata_create_with_curve(paintElement, lanecnt)
{
    for (var idxLane = 0; idxLane <= lanecnt; idxLane++) {
        // Paint Element
        var objPaintElement = {
            idx: idxLane + 1,
            clr: LANE_CLR,
            width: LANE_LINE_WIDTH,
            dashed: (idxLane == 0 || idxLane == lanecnt) ? 0 : 1,
            pts: []
        };
        // console.log("objPaintElement:", objPaintElement)
        var xPos = (CAMERA_AREA_WIDTH - LANE_WIDE * lanecnt) / 2 + LANE_WIDE * idxLane;

        for (var zPos = 0; zPos <= CAMERA_AREA_LONG; zPos += LANE_PTS_STEP) {              
            objPaintElement.pts.push([Math.round(xPos * 100 + STREET_RADIUS * 2 * Math.PI *( zPos / CAMERA_AREA_LONG) ), 0, zPos * LANE_PTS_STEP * 100]);  
        }
        
        paintElement.push(objPaintElement);
    }
       
    return paintElement;
}

function emata_create_with_cross(paintElement, lanecnt)
{

}

function emata_create_with_onebridge(paintElement, lanecnt)
{
    // Paint Element      
    for (var idxLane = 0; idxLane <= lanecnt; idxLane++) {
        // Paint Element
        var objPaintElement = {
            idx: idxLane + 1,
            clr: LANE_CLR,
            width: LANE_LINE_WIDTH,
            dashed: (idxLane == 0 || idxLane == lanecnt) ? 0 : 1,
            pts: []
        };
        // console.log("objPaintElement:", objPaintElement)
        var xPos = (CAMERA_AREA_WIDTH - LANE_WIDE * lanecnt) / 2 + LANE_WIDE * idxLane;

        for (var zPos = 0; zPos <= CAMERA_AREA_LONG; zPos += LANE_PTS_STEP) {              
            objPaintElement.pts.push([Math.round(xPos * 100 ), BRIDGE_DEEP, zPos * LANE_PTS_STEP * 100]);  
        }
        
        paintElement.push(objPaintElement);
    }
    
    return paintElement;
}

function emata_create_with_twobridge(paintElement, lanecnt)
{
    for (var idxLane = 0; idxLane < Math.round(lanecnt/2); idxLane++) {
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
            objPaintElement.pts.push([Math.round(xPos * 100), BRIDGE_DEEP, zPos * 100]);
        }
        paintElement.push(objPaintElement);
    }

    for (var idxLane = Math.round(lanecnt / 2); idxLane <= lanecnt; idxLane++) {
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
            objPaintElement.pts.push([Math.round(xPos * 100), BRIDGE_DEEP, zPos * 100]);
        }
        paintElement.push(objPaintElement);
    }

    return paintElement;
}
     