function carinfo_create(numCar) {
    var arrType = [1, 2, 4];
    var arrBbox = [
        [180, 144, 455],
        [200, 265, 630],
        [200, 350, 910]
    ];
    var arrColor = [0, 1, 2, 3, 4, 5]; // BLUE=0 YELLOW=1  WHITE=2 BLACK=3 GREEN=4 BKAIR=5

    var payloadJSON = [[], [], []];

    // Define Ord, Random functions
    var funcOrd = function(str){return str.charCodeAt(0);};
    var funcGetRandomInt = function(min, max) {return Math.floor(Math.random() * (max + 1 - min)) + min};

    for (var i = 0; i < numCar; i ++) {
        // Generate Plate number
        var platH = (20 << 24) + (2 << 16) + (funcGetRandomInt(funcOrd('0'), funcOrd('9')) << 8) + funcGetRandomInt(funcOrd('0'), funcOrd('9'));
        var platL = (funcGetRandomInt(funcOrd('0'), funcOrd('9')) << 24) + (funcGetRandomInt(funcOrd('0'), funcOrd('9')) << 16) + (funcGetRandomInt(funcOrd('0'), funcOrd('9')) << 8);

        var id64 = new Long(platH);
        id64 = id64.shiftLeft(32);
        id64 = id64.add(platL);

        // Push to JSON
        payloadJSON[i % 3].push({
            'typ' : arrType[i % 3],
            'bbox' : arrBbox[i % 3],
            'clr' : funcGetRandomInt(0, 5),
            'logo' : 0,
            'id64' : id64.toString()
        });
    }

    return payloadJSON;
}

var CAR_INFO = carinfo_create(3000);