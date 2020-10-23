// (function () {
console.log("sanity");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const hidden = document.getElementById("hiddenSignature");

canvas.addEventListener("mousedown", penDown);
canvas.addEventListener("mouseup", penUp);
canvas.addEventListener("mousemove", sketch);
canvas.addEventListener("touchstart", penDown);
canvas.addEventListener("touchend", penUp);

var mouse = {
    x: 0,
    y: 0,
};

let isSigning = false;

function getPosition(draw) {
    mouse.x = draw.clientX - canvas.getBoundingClientRect().left;
    mouse.y = draw.clientY - canvas.getBoundingClientRect().top;
}

function penDown(draw) {
    draw.preventDefault();
    isSigning = true;
    getPosition(draw);
}

function sketch(draw) {
    if (isSigning === false) return;
    ctx.beginPath();
    ctx.lineWidth = 1;
    ctx.strokeStyle = "black";
    ctx.moveTo(mouse.x, mouse.y);
    getPosition(draw);
    ctx.lineTo(mouse.x, mouse.y);
    ctx.stroke();
}

function penUp() {
    isSigning = false;
    ctx.closePath();
    const imageUrl = canvas.toDataURL();
    hidden.value = imageUrl;
}
// })();
