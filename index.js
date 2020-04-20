const canvas = document.getElementById("preview_canvas");
const context = canvas.getContext("2d");
let PIXELSIZE = 2;
let XREPEAT = 20;
let YREPEAT = 15;
let DIMENSION = 35;
let WIDTH = DIMENSION * XREPEAT * PIXELSIZE;
let HEIGHT = DIMENSION * YREPEAT * PIXELSIZE;
let selectedBox = null;

canvas.setAttribute("width", WIDTH);
canvas.setAttribute("height", HEIGHT);

function init() {
  for (let i = 0; i < DIMENSION * XREPEAT; i++) {
    if (i % DIMENSION != 0) {
      continue;
    }
    margin = i * PIXELSIZE;
    context.beginPath();
    context.moveTo(margin, 0);
    context.lineTo(margin, HEIGHT);
    context.stroke();

    context.beginPath();
    context.moveTo(0, margin);
    context.lineTo(WIDTH, margin);
    context.stroke();
  }

  let isSelected = false;

  document.body.addEventListener("mousemove", function (event) {
    var viewportOffset = canvas.getBoundingClientRect();
    if (event.srcElement.id != canvas.id) return;
    let pixel = [
      Math.floor(event.offsetX / (PIXELSIZE * DIMENSION)),
      Math.floor(event.offsetY / (PIXELSIZE * DIMENSION)),
    ];
    pixel = EnforceConstraints(pixel);

    if (!selectedBox) {
      selectedBox = document.createElement("div");
      selectedBox.setAttribute("id", "selectedBox");
      let size = DIMENSION * PIXELSIZE - 2;
      selectedBox.style.width = size.toString() + "px";
      selectedBox.style.height = size.toString() + "px";
      document.getElementById("canvas_wrapper").prepend(selectedBox);
    }
    let pixelOffset = pixel[0] * PIXELSIZE * DIMENSION + 1;
    selectedBox.style.top =
      (pixel[1] * PIXELSIZE * DIMENSION + 1).toString() + "px";
    selectedBox.style.left =
      (pixelOffset + viewportOffset.left - 16).toString() + "px";
  });

  canvas.addEventListener("click", function (event) {
    if (isSelected) return;
    isSelected = true;
    let pixel = [
      Math.floor(event.offsetX / (PIXELSIZE * DIMENSION)),
      Math.floor(event.offsetY / (PIXELSIZE * DIMENSION)),
    ];
    window.location = "draw.php?x=" + pixel[0] + "&y=" + pixel[1];
  });

  db.collection("app").onSnapshot(function (grid) {
    for (let change of grid.docChanges()) {
      if (!change.doc) continue;
      let key = change.doc.id;
      let data = change.doc.data();
      let coordinate = key.split(",");
      let pixelData = JSON.parse(data[key]);
      for (let subkey in pixelData["data"]) {
        let subcoordniate = subkey.split(",");
        let color = pixelData["data"][subcoordniate];
        fillPixel(coordinate, subcoordniate, color);
      }
    }
  });
}

function EnforceConstraints(pixel) {
  if (pixel[0] < 0) {
    pixel[0] = 0;
  }
  if (pixel[0] > XREPEAT - 1) {
    pixel[0] = XREPEAT - 1;
  }
  if (pixel[1] < 0) {
    pixel[1] = 0;
  }
  if (pixel[1] > YREPEAT - 1) {
    pixel[1] = YREPEAT - 1;
  }
  return pixel;
}

function fillPixel(coordinate, subcoordinate, color) {
  let coordX = parseInt(coordinate[0]);
  let coordY = parseInt(coordinate[1]);
  let subCoordX = parseInt(subcoordinate[0]);
  let subCoordY = parseInt(subcoordinate[1]);
  if (
    coordX < 0 ||
    coordY < 0 ||
    coordX >= XREPEAT ||
    coordY >= YREPEAT ||
    subCoordX < 0 ||
    subCoordX >= DIMENSION ||
    subCoordY < 0 ||
    subCoordY >= DIMENSION
  ) {
    return;
  }
  context.fillStyle = color;
  let x = (coordX * DIMENSION + subCoordX) * PIXELSIZE;
  let y = (coordY * DIMENSION + subCoordY) * PIXELSIZE;
  context.fillRect(x, y, PIXELSIZE, PIXELSIZE);
}

init();
