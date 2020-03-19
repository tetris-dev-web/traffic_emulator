function emeta_create_vdata( waytype, iscross, cntlane, tval){
	
	var objCamera = {};
    var cab32 = '0-0-0-1-0';
    var payloadCamera = {
        focal : CAMERA_FOCAL,
        lens : CAMERA_LENS,
        pixels : CAMERA_PIXELS,
        dist : CAMERA_DIST,
        tilt : CAMERA_TILT,
        geo : [CAMERA_DEFAULT_LAT, CAMERA_DEFAULT_LONG ],
        segs : []
    };

    var payloadPaintElement = [];
    var lanecnt = 0;


    if (waytype == 'traffic'){    	
		payloadPaintElement = emata_create_with_traffic(payloadPaintElement, iscross, cntlane);
		for( var idxLane = 0 ; idxLane < cntlane; idxLane ++)
		{
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

		if (iscross)
		{
			for( var idxLane = 0 ; idxLane < cntlane; idxLane ++)
			{
				payloadCamera.segs.push({
	                        idx: cntlane + idxLane + 1,
	                        type: LANE_TYPE,
	                        flow: 16,
	                        restrict: LANE_RESTRICT,
	                        smin: LANE_SMIN + LANE_SDIFF * idxLane,
	                        smax: LANE_SMAX + LANE_SDIFF * idxLane,
	                        lpaint: idxLane + 1,
	                        rpaint: idxLane + 2
	                    });
			}

			lanecnt = cntlane * 2;
		}
		else
		{
			lanecnt = cntlane;
		}

    }
    else if (waytype == 'inter')
    {
        payloadPaintElement = emata_create_with_inter(payloadPaintElement, iscross, cntlane);
		for( var idxLane = 0 ; idxLane < cntlane; idxLane ++)
		{
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

    console.log('obje = ', objJSON);
    return JSON.stringify(objJSON);
}

function emata_create_with_traffic(pelements, iscross, cntlane)
{
	for (var idxLane = 0; idxLane <= cntlane; idxLane++) {
        // Paint Element
        var objelement = {
            idx: idxLane + 1,
            clr: LANE_CLR,
            width: LANE_LINE_WIDTH,
            dashed: (idxLane == 0 || idxLane == cntlane) ? 0 : 1,
            pts: []
        };
        // console.log("objPaintElement:", objPaintElement)
        var xPos = (CAMERA_AREA_WIDTH - LANE_WIDE * cntlane) / 2 + LANE_WIDE * idxLane;

        for (var zPos = 0; zPos <= CAMERA_AREA_LONG; zPos += LANE_PTS_STEP) {              
            objelement.pts.push([Math.round(xPos * 100 ), 0, zPos * LANE_PTS_STEP * 100]);  
        }
        
        pelements.push(objelement);
    }

    if (iscross)
    {
    	for (var idxLane = 0; idxLane <= cntlane; idxLane++) {
        // Paint Element
        var objelement = {
            idx: cntlane + idxLane + 1,
            clr: LANE_CLR,
            width: LANE_LINE_WIDTH,
            dashed: (idxLane == 0 || idxLane == cntlane) ? 0 : 1,
            pts: []
        };
        // console.log("objPaintElement:", objPaintElement)
        var zPos = 270 + LANE_WIDE * (idxLane + cntlane);

        for (var xPos = -200; xPos <= 300; xPos += LANE_PTS_STEP) {          
            objelement.pts.push([Math.round(xPos * 100), 0, zPos * 100]);
        }
        
        pelements.push(objelement);
        
    	} 
    }

    return pelements;
}

function emata_create_with_inter(pelements, iscross, cntlane)
{
    for (var idxLane = 0; idxLane <= cntlane; idxLane++) {
        
        // Paint Element
        var objelement = {
            idx: idxLane + 1,
            clr: LANE_CLR,
            width: LANE_LINE_WIDTH,
            dashed: (idxLane == 0 || idxLane == cntlane) ? 0 : 1,
            pts: []
        };
        // console.log("objPaintElement:", objPaintElement)
        var xPos = (CAMERA_AREA_WIDTH - LANE_WIDE * cntlane) / 2 + LANE_WIDE * idxLane;


        for (var zPos = 0;  zPos < CAMERA_AREA_LONG / 2 ; zPos += LANE_PTS_STEP)
        {
            objelement.pts.push([xPos * 100, 0, zPos * 100]);
        }

        for (var yPos = 0 ;  yPos < STREET_RADIUS ; yPos += 3)
        {
            var vx = Math.round(xPos*100 + (1 - Math.cos( 2 * Math.PI * yPos / STREET_RADIUS)) * INTER_RADIUS * 100);
            var vz = Math.round(CAMERA_AREA_LONG*100 / 2 + Math.sin(2 * Math.PI * yPos / STREET_RADIUS) * INTER_RADIUS * 100);
            objelement.pts.push([vx, yPos, vz]);            
        }

        for( var zPos = CAMERA_AREA_LONG / 2 ; zPos < CAMERA_AREA_LONG; zPos+=LANE_PTS_STEP){
            objelement.pts.push([xPos*100, STREET_RADIUS, zPos*100]);            
        }

        pelements.push(objelement);
    }
    return pelements;
}