class Ground {
    constructor(scene) {
        this.scene = scene;
        this.create();
    }
    create() {
        var ground = BABYLON.Mesh.CreateBox("Mirror", 1.0, this.scene);
        ground.scaling = new BABYLON.Vector3(GROUND_X, GROUND_Y, GROUND_Z);
        ground.material = new BABYLON.StandardMaterial("ground", this.scene);
        ground.material.diffuseTexture = new BABYLON.Texture("assets/images/material_road.png", this.scene);
        ground.material.diffuseTexture.uScale = GROUND_TEXTURE_SCALE;
        ground.material.diffuseTexture.vScale = GROUND_TEXTURE_SCALE;
        ground.position = new BABYLON.Vector3(0, 0, 0);
        return ground;
    }
}