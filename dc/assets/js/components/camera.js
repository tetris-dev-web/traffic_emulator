class Camera {
    constructor(scene, canvas) {
        this.width = CAMERA_AREA_WIDTH;
        this.height = CAMERA_HEIGHT;
        this.tilt = CAMERA_TILT;
        this.scene = scene;
        this.canvas = canvas;
        this.create();
    }
    create() {
        // var camera = new BABYLON.FreeCamera("FreeCamera", new BABYLON.Vector3(this.width/2, this.height, 0), this.scene);
        var camera = new BABYLON.ArcRotateCamera("camera1", 0, 0, 10, BABYLON.Vector3(0, 0, 0), this.scene);
        
        // var dist = this.height / Math.tan(PI/2 - this.tilt);
        //camera.setTarget(new BABYLON.Vector3(this.width/2, 0, dist));
        // camera.setTarget(new BABYLON.Vector3(Math.PI/3, Math.PI/2, 350));
        camera.setPosition(new BABYLON.Vector3(-Math.PI/2, Math.PI * 2, 400));

        camera.attachControl(this.canvas);
    }
}