const canvas_element = document.getElementById("preview_canvas");
const active_users_element = document.getElementById("active_users");
const context = canvas_element.getContext("2d");
const PIXELSIZE = 2;
const XREPEAT = 20;
const YREPEAT = 15;
const WIDTH = DIMENSION * XREPEAT * PIXELSIZE;
const HEIGHT = DIMENSION * YREPEAT * PIXELSIZE;
let selectedBox = null;
let tooltip = null;
let usersInRoomsDict = {};
let previouslySelectedBox = [];

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
      let pixelData;
      let userData;
      try {
        pixelData = JSON.parse(data["pixels"]);
      } catch (error) {
        continue;
      }
      try {
        userData = data["users"];
      } catch (error) {
        userData = {};
      }
      if (JSON.stringify(userData) == "{}") {
        usersInRoomsDict[key] = ["0", true];
      } else {
        let isRoomActive = true;
        let usersLen = 0;
        for (let _identifier in userData) {
          if (
            new Date(
              userData[_identifier]["timestamp"].toDate().getTime() +
                180 * 60 * 1000
            ).getTime() > Date.now()
          ) {
            isRoomActive = false;
          }
          usersLen++;
        }
        usersInRoomsDict[key] = [usersLen, isRoomActive];
      }
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
    let total = 0;
    for (let key in usersInRoomsDict) {
      if (!usersInRoomsDict[key][1]) {
        total += parseInt(usersInRoomsDict[key][0]);
      }
    }
    active_users_element.innerText = "Active users in rooms: " + total + "  ツ";
  });

  document.body.addEventListener("mousemove", function (event) {
    if (event.srcElement.id != canvas_element.id) {
      if (selectedBox == null) return;
      if (tooltip.classList.contains("tooltiptext")) {
        selectedBox.setAttribute("class", "hidden");
        tooltip.setAttribute("class", "hidden");
      }
      previouslySelectedBox = [];
      return;
    }
    let pixel = [
      Math.floor(event.offsetX / (PIXELSIZE * DIMENSION)),
      Math.floor(event.offsetY / (PIXELSIZE * DIMENSION)),
    ];
    pixel = EnforceConstraints(pixel);
    if (
      previouslySelectedBox[0] == pixel[0] &&
      previouslySelectedBox[1] == pixel[1]
    )
      return;
    let viewportOffset = canvas_element.getBoundingClientRect();
    previouslySelectedBox = pixel;
    if (!selectedBox) {
      selectedBox = document.createElement("div");
      selectedBox.setAttribute("id", "selected_box");
      selectedBox.setAttribute("class", "selected-box");
      let size = DIMENSION * PIXELSIZE - 2;
      selectedBox.style.width = size.toString() + "px";
      selectedBox.style.height = size.toString() + "px";
      document.getElementById("canvas_wrapper").prepend(selectedBox);
      selectedBox.innerHTML =
        '<span id = "selected_box_tooltip" class="tooltiptext"></span>';
      tooltip = document.getElementById("selected_box_tooltip");
    }
    let usersInRoom =
      usersInRoomsDict[pixel[0].toString() + "," + pixel[1].toString()];
    if (usersInRoom == null) usersInRoom = ["0", true];
    tooltip.innerHTML =
      "Room: " +
      (pixel[0] + 1 + pixel[1] * 20) +
      "</br>" +
      "Players: " +
      usersInRoom[0];
    tooltip.setAttribute("class", "tooltiptext");
    usersInRoom[1]
      ? selectedBox.setAttribute("class", "selected-box-active")
      : selectedBox.setAttribute("class", "selected-box");
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
      "draw?x=" + pixel[0] + "&y=" + pixel[1] + "&user=" + globalUser;
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
