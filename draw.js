const canvas = document.getElementById("draw_canvas");
const context = canvas.getContext("2d");
let DIMENSION = 25;
let WIDTH = canvas.clientWidth;
let HEIGHT = canvas.clientWidth;
let PIXELSIZE = WIDTH / DIMENSION;

function init() {
  context.strokeStyle = "rgba(0,0,0,0.1)";
  for (let i = 0; i < DIMENSION; i++) {
    x = Math.floor((i * WIDTH) / DIMENSION);
    context.beginPath();
    context.moveTo(x, 0);
    context.lineTo(x, HEIGHT);
    context.stroke();

    y = Math.floor((i * HEIGHT) / DIMENSION);
    context.beginPath;
    context.moveTo(0, y);
    context.lineTo(WIDTH, y);
    context.stroke();
  }

  canvas.addEventListener("mousemove", fill, false);
  canvas.addEventListener("mousedown", fill, false);
}

function fill(event) {
  if (event.which == 0) return;
  fillPixel([
    Math.floor(event.offsetX / PIXELSIZE),
    Math.floor(event.offsetY / PIXELSIZE),
  ]);
}

function fillPixel(pixel) {
  context.fillStyle = "#000000";
  context.fillRect(
    pixel[0] * PIXELSIZE,
    pixel[1] * PIXELSIZE,
    PIXELSIZE - 1,
    PIXELSIZE - 1
  );
}

init();
