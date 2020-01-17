class Lane {
    constructor(data, scene) {
        this.emeta = JSON.parse(data);
        this.segs_info = this.emeta['items'][0]['dcv']['segs'];
        this.paint = this.emeta['items'][1]['dcv']['paint'];
        this.segs = [];
        this.scene = scene;
        this.drawSegs()
    }
    drawSegs() {
        for (var i = 0; i < this.paint.length; i++) {

            var pts = this.paint[i]['pts'];
            
            for (var j = 0; j < pts.length - 1; j++) {
                var seg = BABYLON.Mesh.CreateLines("lines", [
                    new BABYLON.Vector3(pts[j][0]/SCALE_METER2CM, pts[j][1]/SCALE_METER2CM + LANE_DEPTH, pts[j][2]/SCALE_METER2CM),
                    new BABYLON.Vector3(pts[j + 1][0]/SCALE_METER2CM, pts[j + 1][1]/SCALE_METER2CM + LANE_DEPTH, pts[j + 1][2]/SCALE_METER2CM)
                ], this.scene);
            }

        }
    }
}