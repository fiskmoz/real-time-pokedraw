const canvas_element = document.getElementById("preview_canvas");
const context = canvas_element.getContext("2d");
const PIXELSIZE = 2;
const XREPEAT = 20;
const YREPEAT = 15;
const WIDTH = DIMENSION * XREPEAT * PIXELSIZE;
const HEIGHT = DIMENSION * YREPEAT * PIXELSIZE;
let selectedBox = null;

canvas_element.setAttribute("width", WIDTH);
canvas_element.setAttribute("height", HEIGHT);

function init() {
  clear();
  let isSelected = false;
  db.collection("app").onSnapshot(function (grid) {
    for (let change of grid.docChanges()) {
      if (!change.doc) continue;
      let key = change.doc.id;
      let data = change.doc.data();
      let coordinate = key.split(",");
      let pixelData = JSON.parse(data[key]);
      if (Object.keys(pixelData["data"]).length === 0) {
        for (let x = 1; x < DIMENSION - 1; x++) {
          for (let y = 1; y < DIMENSION - 1; y++) {
            fillPixel(coordinate, [x, y], DEFAULTWHITE);
          }
        }
        continue;
      }
      for (let subkey in pixelData["data"]) {
        let subcoordniate = subkey.split(",");
        let color = pixelData["data"][subcoordniate];
        fillPixel(coordinate, subcoordniate, color);
      }
    }
  });

  document.body.addEventListener("mousemove", function (event) {
    var viewportOffset = canvas_element.getBoundingClientRect();
    if (event.srcElement.id != canvas_element.id) return;
    let pixel = [
      Math.floor(event.offsetX / (PIXELSIZE * DIMENSION)),
      Math.floor(event.offsetY / (PIXELSIZE * DIMENSION)),
    ];
    pixel = EnforceConstraints(pixel);

    if (!selectedBox) {
      selectedBox = document.createElement("div");
      selectedBox.setAttribute("id", "selectedBox");
      selectedBox.setAttribute("class", "selected-box");
      let size = DIMENSION * PIXELSIZE - 2;
      selectedBox.style.width = size.toString() + "px";
      selectedBox.style.height = size.toString() + "px";
      document.getElementById("canvas_wrapper").prepend(selectedBox);
    }
    let pixelOffset = pixel[0] * PIXELSIZE * DIMENSION + 1;
    selectedBox.style.top =
      (pixel[1] * PIXELSIZE * DIMENSION + 1 + PADDINGTOP).toString() + "px";
    selectedBox.style.left =
      (pixelOffset + viewportOffset.left).toString() + "px";
  });

  canvas_element.addEventListener("click", function (event) {
    if (isSelected) return;
    isSelected = true;
    let pixel = [
      Math.floor(event.offsetX / (PIXELSIZE * DIMENSION)),
      Math.floor(event.offsetY / (PIXELSIZE * DIMENSION)),
    ];
    window.location =
      "draw.php?x=" + pixel[0] + "&y=" + pixel[1] + "&user=" + globalUser;
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

function clear() {
  context.clearRect(0, 0, canvas_element.width, canvas_element.height);
  context.strokeStyle = "rgba(0,0,0,0.1)";
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
}

init();
