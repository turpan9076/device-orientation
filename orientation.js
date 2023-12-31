// OS識別用
let os;

// DOM構築完了イベントハンドラ登録
window.addEventListener("DOMContentLoaded", init);

// 初期化
function init() {
    // 簡易的なOS判定
    os = detectOSSimply();
    if (os == "iphone") {
        // safari用。DeviceOrientation APIの使用をユーザに許可して貰う
        document.querySelector("#permit").addEventListener("click", permitDeviceOrientationForSafari);

        window.addEventListener(
            "deviceorientation",
            orientation,
            true
        );
    } else if (os == "android") {
        window.addEventListener(
            "deviceorientationabsolute",
            orientation,
            true
        );
    } else{
        window.alert("Sample not supported by PC");
    }
}


// ジャイロスコープと地磁気をセンサーから取得
function orientation(event) {
    let absolute = event.absolute;
    let alpha = event.alpha;
    let beta = event.beta;
    let gamma = event.gamma;
    const needle = document.getElementById("needle");

    let degrees;
    if(os == "iphone") {
        // webkitCompasssHeading値を採用
        degrees = event.webkitCompassHeading;

    }else{
        // deviceorientationabsoluteイベントのalphaを補正
        degrees = compassHeading(alpha, beta, gamma);
    }
    if (degrees > 0 && degrees < 180){
        needle.style.transform = `rotate(${-(180+degrees)}deg)`;
    }else if (degrees > 180 && degrees < 360){
        needle.style.transform = `rotate(${180-degrees}deg)`;
    }
    let direction;
    if (
        (degrees > 337.5 && degrees < 360) ||
        (degrees > 0 && degrees < 22.5)
    ) {
        direction = "N";
    } else if (degrees > 22.5 && degrees < 67.5) {
        direction = "NE";
    } else if (degrees > 67.5 && degrees < 112.5) {
        direction = "E";
    } else if (degrees > 112.5 && degrees < 157.5) {
        direction = "SE";
    } else if (degrees > 157.5 && degrees < 202.5) {
        direction = "S";
    } else if (degrees > 202.5 && degrees < 247.5) {
        direction = "SW";
    } else if (degrees > 247.5 && degrees < 292.5) {
        direction = "W";
    } else if (degrees > 292.5 && degrees < 337.5) {
        direction = "NW";
    }

    document.querySelector("#direction").innerHTML =
        direction + " : " + degrees;
    document.querySelector("#absolute").innerHTML = absolute;
    document.querySelector("#alpha").innerHTML = alpha;
    document.querySelector("#beta").innerHTML = beta;
    document.querySelector("#gamma").innerHTML = gamma;
}

// 端末の傾き補正（Android用）
// https://www.w3.org/TR/orientation-event/
function compassHeading(alpha, beta, gamma) {
    var degtorad = Math.PI / 180; // Degree-to-Radian conversion

    var _x = beta ? beta * degtorad : 0; // beta value
    var _y = gamma ? gamma * degtorad : 0; // gamma value
    var _z = alpha ? alpha * degtorad : 0; // alpha value

    var cX = Math.cos(_x);
    var cY = Math.cos(_y);
    var cZ = Math.cos(_z);
    var sX = Math.sin(_x);
    var sY = Math.sin(_y);
    var sZ = Math.sin(_z);

    // Calculate Vx and Vy components
    var Vx = -cZ * sY - sZ * sX * cY;
    var Vy = -sZ * sY + cZ * sX * cY;

    // Calculate compass heading
    var compassHeading = Math.atan(Vx / Vy);

    // Convert compass heading to use whole unit circle
    if (Vy < 0) {
        compassHeading += Math.PI;
    } else if (Vx < 0) {
        compassHeading += 2 * Math.PI;
    }

    return compassHeading * (180 / Math.PI); // Compass Heading (in degrees)
}

// 簡易OS判定
function detectOSSimply() {
    let ret;
    if (
        navigator.userAgent.indexOf("iPhone") > 0 ||
        navigator.userAgent.indexOf("iPad") > 0 ||
        navigator.userAgent.indexOf("iPod") > 0
    ) {
        // iPad OS13のsafariはデフォルト「Macintosh」なので別途要対応
        ret = "iphone";
    } else if (navigator.userAgent.indexOf("Android") > 0) {
        ret = "android";
    } else {
        ret = "pc";
    }

    return ret;
}

// iPhone + Safariの場合はDeviceOrientation APIの使用許可をユーザに求める
function permitDeviceOrientationForSafari() {
    DeviceOrientationEvent.requestPermission()
        .then(response => {
            if (response === "granted") {
                window.addEventListener(
                    "deviceorientation",
                    detectDirection
                );
            }
        })
        .catch(console.error);
}