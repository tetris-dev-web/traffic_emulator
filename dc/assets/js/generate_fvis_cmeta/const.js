const DCK_PREF_OP = 22 // 'DCOP_SUPD'
const DCK_OP_EMETA = 9 // 'DCKOP_EMETA'
const DCK_OP_FVIS = 12 // 'DCKOP_FVIS'
const DCK_OP_EVT = 20 // 'DCKOP_EVT'
const DCK_CLA = 101;
const DCK_CLB_EMETA_CAMERA = 1;
const DCK_CLB_EMETA_GRIDMAP = 2;
const DCK_CLB_EMETA_PAINTELEMENT = 3;

const CAMERA_AREA_WIDTH = 19.2;
const CAMERA_AREA_LONG = 500; // Camera screen long : 500m
const CAMERA_FOCAL = 10;
const CAMERA_LENS = [10, 10];
const CAMERA_PIXELS = [1280, 1600];
const CAMERA_DIST = 1500;
const CAMERA_TILT = 0.2;
const CAMERA_DEFAULT_LANE_COUNT = 3;

const CAMERA_DEFAULT_LAT = 31.3;
const CAMERA_DEFAULT_LONG = 108.4

const LANE_WIDE = 5; // 3 meter wide
const LANE_TYPE = 1; // 1- traffic, 2 = median, 3 = shoulder, 4 = xwalk,5 = bike, 6=inter, 7=park, 8=lane 
const LANE_FLOW = 1; // 1-straight, 2-turn, 4-exit, 8-entrance, 16-right, 32-left, 64-uturn 
const LANE_LINE_WIDTH = 1; // 1 pixel
const LANE_RESTRICT = 48; // 1-cars, 2-bus, 4-trucks, 8-moto, 16-bike, 32-walk, 64-stop
const LANE_SMAX = 90; // 90 km/h
const LANE_SMIN = 70; // 70 km/h
const LANE_SDIFF = 10; // speed differenence between lane
const LANE_CLR = 0; // 0 – white, 1 – yellow, 2 – red, 3 – blue
const LANE_PTS_STEP = 100; // show pts for each 1 meter ( 100m )

const FVIS_CNT_CAR_LANE = 20; // number of cars in each lane
const FVIS_CAPTURE_DURATION = 300; // KVIS duration
const FVIS_CAPTURE_STEP = 30; // Generate KVIS for each 30 s
const FVIS_CAPTURE_FREQ = 1000; // miliseconds per frame
const FVIS_CAR_DISTANCE_MIN = 7; // distance between cars(m)
const FVIS_CAR_DISTANCE_MAX = 30; // distance between cars(m)
const CAB64 = '2-20-9-0-101-9';