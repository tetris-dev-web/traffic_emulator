const CAMERA_HEIGHT = 14.9;

const SCALE_METER2CM = 100;
const FRAMES_PER_SECOND = 60;
const PI = 3.141592653589793;

const GROUND_X = 2000;
const GROUND_Y = 0.01;              // added 0.01 for texture on the Ground.
const GROUND_Z = 2000;
const GROUND_TEXTURE_SCALE = 400;

const LANE_DEPTH = 0.02;

const CAR_TEXTURE_IMAGE = "assets/images/cartop.png";
const BUS_TEXTURE_IMAGE = "assets/images/bustop.png";
const TRUCK_TEXTURE_IMAGE = "assets/images/trucktop.png";
const VEHICLE_SHOW_Y_POS = -10;

const SECONDS_PER_FVIS = 300;       // total seconds per fvis that has 10 ~ 11 blocks
const SECONDS_PER_FVIS_BLOCK = 30;  // each fvis block is the same with the vehicle running for 30s

const VEHICLE_TYPES = [1, 2, 4];  // car, bus, truck
const VEHICLE_CAR = 1;
const VEHICLE_BUS = 2;
const VEHICLE_TRUCK = 4;

const VEHICLE_SIZE_1 = {'height': 180, 'width': 144, 'depth':455};
const VEHICLE_SIZE_2 = {'height': 180, 'width': 144, 'depth': 455};
const VEHICLE_SIZE_3 = {'height': 200, 'width': 350, 'depth': 455};

const COLORS = [0, 1, 2, 3, 4, 5];  // blue, yellow, white, black, green, bkain
const COLOR_IDX_BLUE = 0;
const COLOR_IDX_YELLOW = 1;
const COLOR_IDX_WHITE = 2;
const COLOR_IDX_BLACK = 3;
const COLOR_IDX_GREEN = 4;
const COLOR_IDX_BKAIR = 5;
const COLOR_BLUE = {'r': 0, 'g': 0, 'b':1};
const COLOR_YELLOW = {'r': 1, 'g': 1, 'b':0};
const COLOR_WHITE = {'r': 1, 'g': 1, 'b':1};
const COLOR_BLACK = {'r': 0.1, 'g': 0.1, 'b':0.1};
const COLOR_GREEN = {'r': 0, 'g': 1, 'b':0};
const COLOR_BKAIR = {'r': 1, 'g': 0, 'b':0};

g_pVehicles = [];
g_pVehicles_len = 0;

g_cVehicles = [];
g_cVehicles_len = 0;

g_vehicles_json = [];
g_vehicles_json_len = 0;
