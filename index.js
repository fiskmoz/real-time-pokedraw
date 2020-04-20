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
    let pixel = [
      Math.floor(event.offsetX / (PIXELSIZE * DIMENSION)),
      Math.floor(event.offsetY / (PIXELSIZE * DIMENSION)),
    ];
    pixel = enforceConstraints(pixel);

    if (!selectedBox) {
      selectedBox = document.createElement("div");
      selectedBox.setAttribute("id", "selectedBox");
      let size = DIMENSION * PIXELSIZE - 2;
      selectedBox.style.width = size.toString() + "px";
      selectedBox.style.height = size.toString() + "px";
      document.getElementById("canvas_wrapper").prepend(selectedBox);
    }
    selectedBox.style.top =
      (pixel[1] * PIXELSIZE * DIMENSION + 1).toString() + "px";
    selectedBox.style.left =
      (pixel[0] * PIXELSIZE * DIMENSION + 1).toString() + "px";
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

  // Your web app's Firebase configuration
  var firebaseConfig = {
    apiKey: "AIzaSyAWiqFCByM9LxsLDqq71YgVCpmXhqJTyNI",
    authDomain: "real-time-pokedraw.firebaseapp.com",
    databaseURL: "https://real-time-pokedraw.firebaseio.com",
    projectId: "real-time-pokedraw",
    storageBucket: "real-time-pokedraw.appspot.com",
    messagingSenderId: "710326983039",
    appId: "1:710326983039:web:5a8aa14aa69555db2c624a",
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  let db = firebase.firestore();
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

function enforceConstraints(pixel) {
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
  context.fillStyle = color;
  let coordX = parseInt(coordinate[0]);
  let coordY = parseInt(coordinate[1]);
  let subCoordX = parseInt(subcoordinate[0]);
  let subCoordY = parseInt(subcoordinate[1]);
  let x = (coordX * DIMENSION + subCoordX) * PIXELSIZE;
  let y = (coordY * DIMENSION + subCoordY) * PIXELSIZE;
  context.fillRect(x, y, PIXELSIZE, PIXELSIZE);
}

init();
