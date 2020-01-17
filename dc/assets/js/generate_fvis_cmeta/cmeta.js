
function emeta_create (idxZone, idxArea, idxCamera) {
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
  var cntLane = typeof objCamera.cntLane == 'undefined' ? CAMERA_DEFAULT_LANE_COUNT : objCamera.cntLane;

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

  // Paint Element
  var payloadPaintElement = []
  for (var idxLane = 0; idxLane <= cntLane; idxLane ++) {
    // Paint Element
    var objPaintElement = {
      idx : idxLane + 1,
      clr : LANE_CLR,
      width : LANE_LINE_WIDTH,
      dashed : (idxLane == 0 || idxLane == cntLane) ? 0 : 1,
      pts : []
    };

    var xPos = (CAMERA_AREA_WIDTH - LANE_WIDE * cntLane) / 2 + LANE_WIDE * idxLane;
    for (var zPos = 0; zPos <= CAMERA_AREA_LONG; zPos += LANE_PTS_STEP) {
      objPaintElement.pts.push([Math.round(xPos * 100), 0, zPos * 100]);
    }

    payloadPaintElement.push(objPaintElement);

    // Camera "segs"
    if (idxLane < cntLane) {
      payloadCamera.segs.push({
        idx : idxLane + 1,
        type : LANE_TYPE,
        flow : LANE_FLOW,
        restrict : LANE_RESTRICT,
        smin : LANE_SMIN - LANE_SDIFF * idxLane,
        smax : LANE_SMAX - LANE_SDIFF * idxLane,
        lpaint : idxLane + 1,
        rpaint : idxLane + 2
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
