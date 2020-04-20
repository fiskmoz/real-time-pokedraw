const canvas = document.getElementById("draw_canvas");
const context = canvas.getContext("2d");
let DIMENSION = 35;
let WIDTH = canvas.clientWidth;
let HEIGHT = canvas.clientWidth;
let PIXELSIZE = WIDTH / DIMENSION;
let COLOR = "#42445A";
let previousPixel = [0, 0];

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

  const pickr = Pickr.create({
    el: "#picker",
    theme: "classic",
    comparison: false,
    swatches: [
      "rgba(244, 67, 54, 1)",
      "rgba(233, 30, 99, 0.95)",
      "rgba(156, 39, 176, 0.9)",
      "rgba(103, 58, 183, 0.85)",
      "rgba(63, 81, 181, 0.8)",
      "rgba(33, 150, 243, 0.75)",
      "rgba(3, 169, 244, 0.7)",
      "rgba(0, 188, 212, 0.7)",
      "rgba(0, 150, 136, 0.75)",
      "rgba(76, 175, 80, 0.8)",
      "rgba(139, 195, 74, 0.85)",
      "rgba(205, 220, 57, 0.9)",
      "rgba(255, 235, 59, 0.95)",
      "rgba(255, 193, 7, 1)",
    ],
    components: {
      preview: true,
      opacity: true,
      hue: true,
      palette: true,
      interaction: {
        input: true,
      },
    },
  });

  canvas.addEventListener("mousemove", fill, false);
  canvas.addEventListener("mousedown", fill, false);
  pickr.on("change", function () {
    COLOR = pickr.getColor().toHEXA().toString();
  });
}

function fill(event) {
  if (event.which == 0) return;
  let pixel = [
    Math.floor(event.offsetX / PIXELSIZE),
    Math.floor(event.offsetY / PIXELSIZE),
  ];
  if (pixel[0] == previousPixel[0] && pixel[1] == previousPixel[1]) return;
  fillPixel(pixel);
  previousPixel = pixel;
}

function fillPixel(pixel) {
  context.fillStyle = COLOR;
  context.fillRect(
    pixel[0] * PIXELSIZE,
    pixel[1] * PIXELSIZE,
    PIXELSIZE - 1,
    PIXELSIZE - 1
  );
}

init();
