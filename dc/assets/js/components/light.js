class Light {
    constructor(scene) {
        this.scene = scene;
        this.create();
    }
    create() {
        //Light direction is up and left
        var light = new BABYLON.HemisphericLight("hemiLight", new BABYLON.Vector3(-10, 1, 0), this.scene);
        //light.diffuse = new BABYLON.Color3(1, 0, 0);
        //light.specular = new BABYLON.Color3(0, 1, 0);
        //light.groundColor = new BABYLON.Color3(0, 1, 0);
    }
}