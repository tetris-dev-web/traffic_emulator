BRIDGE_SPACE = 50;
BRIDGE_SIDE_OFFSET = 3;
BRIDGE_Z_LEFT = 305;
BRIDGE_Z_RIGHT = 325;
BRIDGE_Y_OFFSET = -1.5;
BRIDGE_SIDE_Z_LEFT_OFFSET = -2.5;
BRIDGE_SIDE_Z_RIGHT_OFFSET = 2.5;

class Lane {
    constructor(data, scene) {
        this.emeta = JSON.parse(data);

        this.segs_info = this.emeta['items'][0]['dcv']['segs'];
        this.paint = this.emeta['items'][1]['dcv']['paint'];

        var zone = parseInt(this.emeta['items'][0]['dck']['cab32s'].split('-')[0]);
        var area = parseInt(this.emeta['items'][0]['dck']['cab32s'].split('-')[1]);
        var camera = parseInt(this.emeta['items'][0]['dck']['cab32s'].split('-')[3]);

        for(var i in CAMERA_INFO) {
            if(CAMERA_INFO[i].zone === zone && CAMERA_INFO[i].area === area && CAMERA_INFO[i].camera === camera )
                this.count_lane = CAMERA_INFO[i].cntLane;
        }
        this.segs = [];
        this.scene = scene;
        this.drawSegs()
    }
    drawSegs() {
        var mat_road_traffic = new BABYLON.StandardMaterial("mat_road", this.scene);
        mat_road_traffic.diffuseTexture = new BABYLON.Texture("assets/images/material-road-traffic.jpg", this.scene);

        var mat_road_split = new BABYLON.StandardMaterial("mat_road_split", this.scene);
        mat_road_split.diffuseTexture = new BABYLON.Texture("assets/images/material-road-split.jpg", this.scene);

        var mat_road_main = new BABYLON.StandardMaterial("mat_road_main", this.scene);
        mat_road_main.diffuseTexture = new BABYLON.Texture("assets/images/material-road-main.png", this.scene);

        var mat_pillar = new BABYLON.StandardMaterial("mat_pillar", this.scene);
        mat_pillar.diffuseTexture = new BABYLON.Texture("assets/images/material-pillar.jpg", this.scene);      

        for (var i = 0; i < this.paint.length; i++) {

            var pts = this.paint[i]['pts'];
            
            for (var j = 0; j < pts.length - 1; j++) {

                if(pts[j][1] > 1)
                {
                    // add 3d material
                    var plane_road_box = BABYLON.MeshBuilder.CreateBox("plane_road_depth", {height: LANE_WIDE, width: LANE_WIDE, depth: LANE_DEPTH * 20}, this.scene);
                    plane_road_box.position = new BABYLON.Vector3(pts[j][0]/SCALE_METER2CM, pts[j][1]/SCALE_METER2CM + LANE_DEPTH * 20, pts[j][2]/SCALE_METER2CM);
                    plane_road_box.material = mat_road_main;

                    plane_road_box.rotation.x = Math.PI/2;
                    plane_road_box.rotation.y = Math.PI/2;
                    plane_road_box.rotation.z = 0;
                }
                else 
                {
                    // add material to lane
                    var plane_road = BABYLON.MeshBuilder.CreatePlane("plane_road", {width: LANE_WIDE, size: LANE_WIDE}, this.scene);
                    plane_road.position = new BABYLON.Vector3(pts[j][0]/SCALE_METER2CM, pts[j][1]/SCALE_METER2CM + LANE_DEPTH, pts[j][2]/SCALE_METER2CM);
                    plane_road.material = mat_road_traffic;

                    plane_road.rotation.x = Math.PI/2;
                    plane_road.rotation.y = Math.PI/2;
                    if(pts[j][1] === 1)
                        plane_road.rotation.z = 0;
                    else
                        plane_road.rotation.z = Math.PI/2;
                }

                // add spliter between lanes
                // if(pts[j][1]/SCALE_METER2CM === 0 && pts[j][0]/SCALE_METER2CM === -0.4)
                // {
                //     var plane_road_split = BABYLON.MeshBuilder.CreateBox("plane_road_split", {width: LANE_WIDE / 5, size: LANE_WIDE, depth: LANE_DEPTH * 100}, this.scene);
                //     plane_road_split.position = new BABYLON.Vector3(pts[j][0]/SCALE_METER2CM + LANE_WIDE + 0.4, pts[j][1]/SCALE_METER2CM + LANE_DEPTH * 100, pts[j][2]/SCALE_METER2CM);
                //     plane_road_split.material = mat_road_split;

                //     if(pts[j][1] > 0) 
                //     {
                //         plane_road_split.rotation.x = Math.PI/2;
                //         plane_road_split.rotation.y = Math.PI/2;
                //     }
                //     else 
                //     {
                //         plane_road_split.rotation.x = Math.PI/2;
                //         plane_road_split.rotation.y = Math.PI/2;
                //         plane_road_split.rotation.z = Math.PI/2;
                //     }
                // }

                // add spliter side of bridge
                // if(pts[j][1]/SCALE_METER2CM > 0 && (pts[j][2]/SCALE_METER2CM === 305 || pts[j][2]/SCALE_METER2CM === 325))
                // {
                //     var plane_road_split = BABYLON.MeshBuilder.CreateBox("plane_road_split", {width: LANE_WIDE / 5, size: LANE_WIDE, depth: LANE_DEPTH * 100}, this.scene);
                //     if(pts[j][2]/SCALE_METER2CM === BRIDGE_Z_LEFT)
                //         plane_road_split.position = new BABYLON.Vector3(pts[j][0]/SCALE_METER2CM + LANE_WIDE + 0.4, 
                //             pts[j][1]/SCALE_METER2CM + LANE_DEPTH * 100 + BRIDGE_Y_OFFSET, BRIDGE_Z_LEFT + BRIDGE_SIDE_Z_LEFT_OFFSET);
                //     if(pts[j][2]/SCALE_METER2CM === BRIDGE_Z_RIGHT)
                //         plane_road_split.position = new BABYLON.Vector3(pts[j][0]/SCALE_METER2CM + LANE_WIDE + 0.4, 
                //             pts[j][1]/SCALE_METER2CM + LANE_DEPTH * 100 + BRIDGE_Y_OFFSET, BRIDGE_Z_RIGHT + BRIDGE_SIDE_Z_RIGHT_OFFSET);

                //     plane_road_split.material = mat_road_split;

                //     if(pts[j][1] > 0) 
                //     {
                //         plane_road_split.rotation.x = Math.PI/2;
                //         plane_road_split.rotation.y = Math.PI/2;
                //     }
                //     else 
                //     {
                //         plane_road_split.rotation.x = Math.PI/2;
                //         plane_road_split.rotation.y = Math.PI/2;
                //         plane_road_split.rotation.z = Math.PI/2;
                //     }
                // }

                // add pillar to bridge
                if(pts[j][1] > 0 && (pts[j][0]/SCALE_METER2CM == 5 || Math.abs(pts[j][0]/SCALE_METER2CM % BRIDGE_SPACE) == 45 ) && (pts[j][2]/SCALE_METER2CM == 305  || pts[j][2]/SCALE_METER2CM == 325))
                {
                    var cone1 = BABYLON.MeshBuilder.CreateCylinder("cone", {diameterBottom: 1.5, height: pts[j][1]/SCALE_METER2CM + LANE_DEPTH - 0.2, tessellation: 96}, this.scene);
                    cone1.position = new BABYLON.Vector3(pts[j][0]/SCALE_METER2CM, (pts[j][1]/SCALE_METER2CM + LANE_DEPTH - 0.2) / 2, 305);
                    cone1.material = mat_pillar;
                    var cone2 = BABYLON.MeshBuilder.CreateCylinder("cone", {diameterBottom: 1.5, height: pts[j][1]/SCALE_METER2CM + LANE_DEPTH - 0.2, tessellation: 96}, this.scene);
                    cone2.position = new BABYLON.Vector3(pts[j][0]/SCALE_METER2CM, (pts[j][1]/SCALE_METER2CM + LANE_DEPTH - 0.2) / 2, 307);
                    cone2.material = mat_pillar;

                    var cone3 = BABYLON.MeshBuilder.CreateCylinder("cone", {diameterBottom: 1.5, height: pts[j][1]/SCALE_METER2CM + LANE_DEPTH - 0.2, tessellation: 96}, this.scene);
                    cone3.position = new BABYLON.Vector3(pts[j][0]/SCALE_METER2CM, (pts[j][1]/SCALE_METER2CM + LANE_DEPTH - 0.2) / 2, 323);
                    cone3.material = mat_pillar;
                    var cone4 = BABYLON.MeshBuilder.CreateCylinder("cone", {diameterBottom: 1.5, height: pts[j][1]/SCALE_METER2CM + LANE_DEPTH - 0.2, tessellation: 96}, this.scene);
                    cone4.position = new BABYLON.Vector3(pts[j][0]/SCALE_METER2CM, (pts[j][1]/SCALE_METER2CM + LANE_DEPTH - 0.2) / 2, 325);
                    cone4.material = mat_pillar;
                }

                if(pts[j][1] > 1500 && pts[j][1] < 1505 || 
                    pts[j][1] > 1550 && pts[j][1] < 1560)
                {
                    var cone1 = BABYLON.MeshBuilder.CreateCylinder("cone", {diameterBottom: 1.5, height: pts[j][1]/SCALE_METER2CM + LANE_DEPTH - 0.2, tessellation: 96}, this.scene);
                    cone1.position = new BABYLON.Vector3(pts[j][0]/SCALE_METER2CM, (pts[j][1]/SCALE_METER2CM + LANE_DEPTH - 0.2) / 2, pts[j][2]/SCALE_METER2CM);
                    cone1.material = mat_pillar;
                }
                // var plane_road_main = BABYLON.MeshBuilder.CreatePlane("plane_road_main", {}, this.scene);
                // plane_road_main.position = new BABYLON.Vector3(pts[j][0]/SCALE_METER2CM + 3, pts[j][1]/SCALE_METER2CM + LANE_DEPTH, pts[j][2]/SCALE_METER2CM);
                // plane_road_main.material = mat_road_main;
                // plane_road_main.rotation.x = Math.PI/2;
                // plane_road_main.rotation.y = Math.PI/2;
                // plane_road_main.rotation.z = Math.PI/2;
                       
                // var seg = BABYLON.Mesh.CreateLines("lines", [
                //     new BABYLON.Vector3(pts[j][0]/SCALE_METER2CM, 
                //         pts[j][1]/SCALE_METER2CM + LANE_DEPTH, pts[j][2]/SCALE_METER2CM),
                //     new BABYLON.Vector3(pts[j + 1][0]/SCALE_METER2CM, 
                //         pts[j + 1][1]/SCALE_METER2CM + LANE_DEPTH, pts[j + 1][2]/SCALE_METER2CM)
                // ], this.scene);
            }

        }
    }
}
