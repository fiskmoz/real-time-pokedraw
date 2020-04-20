const canvas = document.getElementById("draw_canvas");
const context = canvas.getContext("2d");
let DIMENSION = 35;
let WIDTH = canvas.clientWidth;
let HEIGHT = canvas.clientWidth;
let PIXELSIZE = WIDTH / DIMENSION;
let COLOR = "#42445A";
let FILLED = {};
let previousPixel = [0, 0];

function init() {
  clear();

  db.collection("app")
    .doc(canvas.getAttribute("name"))
    .onSnapshot(function (doc) {
      let data = doc.data();
      for (let key in data) {
        let pixelData = JSON.parse(data[key]);
        for (let subkey in pixelData["data"]) {
          let subcoordniate = subkey.split(",");
          let color = pixelData["data"][subcoordniate];
          fillPixel(subcoordniate, color);
        }
      }
    });

  const pickr = Pickr.create({
    el: "#picker",
    theme: "classic",
    comparison: false,
    showAlways: false,
    swatches: [
      "rgba(0,0,0,1)",
      "rgba(255,255,255, 1)",
      "rgba(255, 0, 0, 1)",
      "rgba(244, 67, 54, 1)",
      "rgba(233, 30, 99, 1)",
      "rgba(156, 39, 176, 1)",
      "rgba(103, 58, 183, 1)",
      "rgba(63, 81, 181, 1)",
      "rgba(33, 150, 243, 1)",
      "rgba(3, 169, 244, 1)",
      "rgba(0, 188, 212, 1)",
      "rgba(0, 150, 136, 1)",
      "rgba(76, 175, 80, 1)",
      "rgba(139, 195, 74, 1)",
      "rgba(255, 235, 59, 1)",
      "rgba(255, 193, 7, 1)",
    ],
    components: {
      preview: true,
      opacity: false,
      hue: false,
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

  window.save = function (x, y) {
    var data = { data: FILLED };
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "draw.php?submit=1&x=" + x + "&y=" + y, true);
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhr.send(JSON.stringify(data));
  };

  window.clear_canvas = function () {
    this.clear();
  };
}

function fill(event) {
  if (event.which == 0) return;
  if (event.srcElement.id != canvas.id) return;
  let pixel = [
    Math.floor(event.offsetX / PIXELSIZE),
    Math.floor(event.offsetY / PIXELSIZE),
  ];
  if (pixel[0] == previousPixel[0] && pixel[1] == previousPixel[1]) return;
  fillPixel(pixel, COLOR);
  previousPixel = pixel;
}

function fillPixel(pixel, color) {
  FILLED[pixel[0] + "," + pixel[1]] = color;
  context.fillStyle = color;
  context.fillRect(
    pixel[0] * PIXELSIZE,
    pixel[1] * PIXELSIZE,
    PIXELSIZE - 1,
    PIXELSIZE - 1
  );
}

function clear() {
  FILLED = {};
  context.clearRect(0, 0, canvas.width, canvas.height);
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
}

init();
