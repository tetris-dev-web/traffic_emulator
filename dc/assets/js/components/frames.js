function parsingFvis(data) {
    //console.log(data);
    var fvis_json = JSON.parse(data);
    //console.log(fvis_json);
    for (var i = 0; i < fvis_json.length; i++) { // fvis_json.length == count fvis blocks for 30s
        for (var j = 0; j < fvis_json[i].items.length; j++) { // fvis_json[i].items.length
            //console.log(fvis_json[i].items[j]);
            if (fvis_json[i].items[j].dck.op16 != DCK_OP_FVIS) {
                continue;
            }
            for (var k = 0; k < fvis_json[i].items[j].dcv.apts.length; k++) {
                
                var vehicle_json = {};
                vehicle_json.id64 = fvis_json[i].items[j].dck.id64;
                vehicle_json.tick32 = fvis_json[i].items[j].dcv.tick32 + k;
                vehicle_json.sPt_z = getStartsPt_z(vehicle_json.id64, vehicle_json.tick32);
                vehicle_json.sPt_x = getStartsPt_x(vehicle_json.id64, vehicle_json.tick32);
                vehicle_json.sPt_y = getStartsPt_y(vehicle_json.id64, vehicle_json.tick32);
                vehicle_json.pt = fvis_json[i].items[j].dcv.apts[k].pt;
                vehicle_json.rot = fvis_json[i].items[j].dcv.apts[k].rot;
                vehicle_json.clr = fvis_json[i].items[j].dcv.clr;
                vehicle_json.typ = fvis_json[i].items[j].dcv.typ;
                vehicle_json.bbox = fvis_json[i].items[j].dcv.bbox;
                g_vehicles_json[g_vehicles_json_len++] = vehicle_json;
            }
        }
    }
}

function getStartsPt_z(id64, tick32) {
    var ary = g_vehicles_json.filter(function (item) {
        return ((item.id64 == id64) && (item.tick32 == (tick32 - 1)));
    });

    if (ary.length == 0) {
        return 0;
    }
    else {
        return ary[0].pt[2];
    }
}

function getStartsPt_x(id64, tick32) {
    var ary = g_vehicles_json.filter(function (item) {
        return ((item.id64 == id64) && (item.tick32 == (tick32 - 1)));
    });

    if (ary.length == 0) {
        return 0;
    }
    else {
        return ary[0].pt[0];
    }
}

function getStartsPt_y(id64, tick32) {
    var ary = g_vehicles_json.filter(function (item) {
        return ((item.id64 == id64) && (item.tick32 == (tick32 - 1)));
    });

    if (ary.length == 0) {
        return 0;
    }
    else {
        return ary[0].pt[1];
    }
}

function createParentVehicles(scene) {
    for (var i = 0; i < VEHICLE_TYPES.length; i++) { // VEHICLE_CAR, VEHICLE_BUS, VEHICLE_TRUCK
        for (var j = 0; j < COLORS.length; j++) { // COLOR_BLUE, COLOR_YELLOW, COLOR_WHITE, COLOR_BLACK, COLOR_GREEN, COLOR_BKAIR
            var vehicle = {};
            var mat = new BABYLON.StandardMaterial("mat1", scene);
            mat.alpha = 1.0;
            vehicle.typ = VEHICLE_TYPES[i];
            switch (vehicle.typ) {
                case 1:
                    var texture = new BABYLON.Texture(CAR_TEXTURE_IMAGE, scene);
                    break;
                case 2:
                    var texture = new BABYLON.Texture(BUS_TEXTURE_IMAGE, scene);
                    break;
                case 4:
                    var texture = new BABYLON.Texture(TRUCK_TEXTURE_IMAGE, scene);
                    break;
            }
            mat.diffuseTexture = texture;

            vehicle.clr = COLORS[j];
            switch (vehicle.clr) {
                case 0:
                    mat.diffuseColor = new BABYLON.Color3(COLOR_BLUE['r'], COLOR_BLUE['g'], COLOR_BLUE['b']);
                    break;
                case 1:
                    mat.diffuseColor = new BABYLON.Color3(COLOR_YELLOW['r'], COLOR_YELLOW['g'], COLOR_YELLOW['b']);
                    break;
                case 2:
                    mat.diffuseColor = new BABYLON.Color3(COLOR_WHITE['r'], COLOR_WHITE['g'], COLOR_WHITE['b']);
                    break;
                case 3:
                    mat.diffuseColor = new BABYLON.Color3(COLOR_BLACK['r'], COLOR_BLACK['g'], COLOR_BLACK['b']);
                    break;
                case 4:
                    mat.diffuseColor = new BABYLON.Color3(COLOR_GREEN['r'], COLOR_GREEN['g'], COLOR_GREEN['b']);
                    break;
                case 5:
                    mat.diffuseColor = new BABYLON.Color3(COLOR_BKAIR['r'], COLOR_BKAIR['g'], COLOR_BKAIR['b']);
                    break;
            }
            var hSpriteNb = 1;
            var vSpriteNb = 1;

            var faceUV = new Array(6);
            faceUV[4] = new BABYLON.Vector4(0, 0, 1 / hSpriteNb, 1 / vSpriteNb);

            var options = {
                width: 1, // default
                height: 1, // default
                depth: 1, // default
                faceUV: faceUV
            };

            var box = BABYLON.MeshBuilder.CreateBox("box", options, scene);
            box.material = mat;
            box.position.y = -100;
            vehicle.box = box;

            g_pVehicles[g_pVehicles_len++] = vehicle;
        }
    }
}

function getVehicleParentIdx(typ, clr) {
    for (var i = 0; i < g_pVehicles_len; i++) {
        if ((g_pVehicles[i].typ == typ) && (g_pVehicles[i].clr == clr)) {
            return i;
        }
    }
}

function frame1(tick32) {
    var ary = g_vehicles_json.filter(function (item) {
        return ((item.tick32 == tick32) && (item.pt[2] >= 0) && (item.pt[2] <= 50000) && (item.pt[0] >= -20000) && (item.pt[0] <= 30000));
    });
    return ary
}

function animation(tick32) {
    frame = frame1(tick32);
    init();
    for (var i = 0; i < frame.length; i++) {
        var pIdx = getVehicleParentIdx(frame[i].typ, frame[i].clr);
        var freeMeshes = getFreeMeshes(pIdx);
        if ( freeMeshes.length == 0) {
            var cVehicle = {};
            cVehicle.instance = g_pVehicles[pIdx].box.createInstance(pIdx + '_' + g_cVehicles_len);
            cVehicle.pIdx = pIdx;
            cVehicle.idx = g_cVehicles_len;
            cVehicle.flag = 1;
            cVehicle.sPt_z = frame[i].sPt_z;
            cVehicle.sPt_x = frame[i].sPt_x;
            cVehicle.sPt_y = frame[i].sPt_y;
            cVehicle.pt = frame[i].pt;
            cVehicle.bbox = frame[i].bbox;
            cVehicle.rot = frame[i].rot;
            cVehicle.id64 = frame[i].id64;
            g_cVehicles[g_cVehicles_len] = cVehicle;
            g_cVehicles[g_cVehicles_len].instance.position = new BABYLON.Vector3(frame[i].pt[0] / SCALE_METER2CM, frame[i].sPt_y / SCALE_METER2CM + frame[i].bbox[1] / (2*SCALE_METER2CM), frame[i].sPt_z / SCALE_METER2CM);
            g_cVehicles[g_cVehicles_len].instance.scaling = new BABYLON.Vector3(frame[i].bbox[0] / SCALE_METER2CM, frame[i].bbox[1] / SCALE_METER2CM, frame[i].bbox[2] / SCALE_METER2CM);
            
            g_cVehicles_len ++;
        }
        else {
            g_cVehicles[freeMeshes[0].idx].flag = 1;
            g_cVehicles[freeMeshes[0].idx].pt = frame[i].pt;
            g_cVehicles[freeMeshes[0].idx].sPt_z = frame[i].sPt_z;
            g_cVehicles[freeMeshes[0].idx].sPt_x = frame[i].sPt_x;
            g_cVehicles[freeMeshes[0].idx].sPt_y = frame[i].sPt_y;
            g_cVehicles[freeMeshes[0].idx].bbox = frame[i].bbox;
            g_cVehicles[freeMeshes[0].idx].rot = frame[i].rot;
            g_cVehicles[freeMeshes[0].idx].instance.position = new BABYLON.Vector3(frame[i].pt[0] / SCALE_METER2CM, frame[i].sPt_y / SCALE_METER2CM + frame[i].bbox[1] / (2*SCALE_METER2CM), frame[i].sPt_z / SCALE_METER2CM);
            g_cVehicles[freeMeshes[0].idx].instance.scaling = new BABYLON.Vector3(frame[i].bbox[0] / SCALE_METER2CM, frame[i].bbox[1] / SCALE_METER2CM, frame[i].bbox[2] / SCALE_METER2CM);
        }
    }
}

function getFreeMeshes(pIdx) {
    var ary = g_cVehicles.filter(function (item) {
        return ((item.pIdx == pIdx) && (item.flag == -1));
    });
    return ary
}

function init() {
    for (var i = 0; i < g_cVehicles_len; i++) {
        g_cVehicles[i].instance.position = new BABYLON.Vector3(0, 0, 0);
        g_cVehicles[i].instance.scaling = new BABYLON.Vector3(0, 0, 0);
        g_cVehicles[i].instance.rotation = new BABYLON.Vector3(0, 0, 0);
        g_cVehicles[i].pt = [];
        g_cVehicles[i].sPt_z = [];
        g_cVehicles[i].sPt_x = [];
        g_cVehicles[i].sPt_y = [];
        g_cVehicles[i].bbox = [];
        g_cVehicles[i].rot = 0;
        g_cVehicles[i].flag = -1;
    }
    
}
