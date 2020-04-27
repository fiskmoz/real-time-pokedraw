const canvas = document.getElementById("draw_canvas");
const timerElement = document.getElementById("timer");
const statusElement = document.getElementById("drawing_status");
const context = canvas.getContext("2d");
const users_list = document.getElementById("users_list");

let WIDTH = canvas.clientWidth;
let HEIGHT = canvas.clientWidth;
let PIXELSIZE = WIDTH / DIMENSION;
let COLOR = "#42445A";
let FILLED = {};
let previousPixel = [-1, -1];
let TIMEOUT;
let TIMER = TIMERDEFAULT;
let XSITE = canvas.getAttribute("name").split(",")[0];
let YSITE = canvas.getAttribute("name").split(",")[1];
let isWatching = true;
let isDrawing = false;

function init() {
  clear();
  db.collection("app")
    .doc(XSITE + "," + YSITE)
    .onSnapshot(function (doc) {
      if (isDrawing) return;
      if (!isWatching) return;
      let data = doc.data();
      for (let key in data) {
        let pixelData = JSON.parse(data[key]);
        if (Object.keys(pixelData["data"]).length === 0) {
          for (let x = 1; x < DIMENSION - 1; x++) {
            for (let y = 1; y < DIMENSION - 1; y++) {
              fillPixel([x, y], DEFAULTWHITE);
            }
          }
          continue;
        }
        for (let subkey in pixelData["data"]) {
          let subcoordniate = subkey.split(",");
          let color = pixelData["data"][subcoordniate];
          fillPixel(subcoordniate, color);
        }
      }
    });

  db.collection("users")
    .doc(XSITE + "," + YSITE)
    .onSnapshot(function (doc) {
      users_list.innerHTML = "";
      let data = doc.data();
      for (let key in data) {
        var li = document.createElement("li");
        li.appendChild(document.createTextNode(data[key]["user"]));
        users_list.appendChild(li);
      }
    });

  const pickr = Pickr.create({
    el: "#picker",
    theme: "classic",
    comparison: false,
    showAlways: false,
    swatches: [
      "white",
      "silver",
      "gray",
      "black",
      "maroon",
      "red",
      "crimson",
      "orangered",
      "darkorange",
      "orange",
      "yellow",
      "gold",
      "greenyellow",
      "lime",
      "olive",
      "darkgreen",
      "forestgreen",
      "aquamarine",
      "aqua",
      "teal",
      "skyblue",
      "blue",
      "navy",
      "deeppink",
      "hotpink",
      "fuchsia",
      "blueviolet",
      "purple",
      "brown",
      "saddlebrown",
      "coral",
      "khaki",
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
  let checkboxJson = JSON.parse(localStorage.getItem("generations"));
  if (!!checkboxJson) SetDefaultCheckboxes(checkboxJson);

  canvas.addEventListener("mousemove", fill, false);
  canvas.addEventListener("mousedown", fill, false);
  pickr.on("change", function () {
    COLOR = pickr.getColor().toHEXA().toString();
  });

  window.stop_drawing = function () {
    save();
    this.StopDrawing();
  };

  window.clear_canvas = function () {
    this.clear();
    save();
  };

  window.start_countdown = function () {
    TIMER = TIMERDEFAULT;
    timerElement.innerHTML = TIMER.toString();
    this.GetRandomPokemon();
  };

  window.addEventListener("beforeunload", async function (e) {
    let res = await asyncXhrRequest(
      "GET",
      "endpoints/leaving.php?x=" + XSITE + "&y=" + YSITE + "&user=" + USER,
      null
    );
    return;
  });

  window.addEventListener("DOMContentLoaded", async function (e) {
    let res = await asyncXhrRequest(
      "GET",
      "endpoints/joining.php?x=" + XSITE + "&y=" + YSITE + "&user=" + USER,
      null
    );
  });
}

function fill(event) {
  if (isWatching) return;
  if (event.which == 0 || event.srcElement.id != canvas.id) {
    if (isDrawing) {
      save();
      previousPixel = [-1, -1];
    }
    isDrawing = false;
    return;
  }
  isDrawing = true;
  let pixel = [
    Math.floor(event.offsetX / PIXELSIZE),
    Math.floor(event.offsetY / PIXELSIZE),
  ];
  if (pixel[0] == previousPixel[0] && pixel[1] == previousPixel[1]) return;
  event.ctrlKey ? fillPixel(pixel, DEFAULTWHITE) : fillPixel(pixel, COLOR);
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

async function GetRandomPokemon() {
  let pokemon_index = GetPokedexIdMultipleGenerations();
  if (pokemon_index == "-1") return;
  let pokemon_index_str = pokemon_index.toString();
  let pokemon_name_dto = await asyncXhrRequest(
    "GET",
    "pokedex/pokedex.php?id=" + pokemon_index_str,
    null
  );
  pokemon_name_dto = JSON.parse(pokemon_name_dto);
  if (pokemon_index < 100) pokemon_index_str = "0" + pokemon_index_str;
  if (pokemon_index < 10) pokemon_index_str = "0" + pokemon_index_str;
  document.getElementById("pokemon_image").src =
    "https://assets.pokemon.com/assets/cms2/img/pokedex/full/" +
    pokemon_index_str +
    ".png";
  document.getElementById("pokemon_name").innerHTML =
    pokemon_name_dto.name.english;
  this.clearInterval(TIMEOUT);
  TIMEOUT = this.setInterval(() => {
    TIMER--;
    timerElement.innerHTML = TIMER.toString();
    if (TIMER <= 10) {
      TIMER % 2 == 0
        ? canvas.setAttribute("class", "draw_canvas_watching")
        : canvas.setAttribute("class", "draw_canvas_drawing");
    }
    if (TIMER <= 0) {
      StopDrawing();
    }
  }, 1000);
  isWatching = false;
  canvas.setAttribute("class", "draw_canvas_drawing");
}

function StopDrawing() {
  canvas.setAttribute("class", "draw_canvas_watching");
  isWatching = true;
  isDrawing = false;
  TIMER = TIMERDEFAULT;
  timerElement.innerHTML = "";
  this.clearInterval(TIMEOUT);
}

function GetPokedexIdMultipleGenerations() {
  let possiblePokemon = [];
  let gen1 = document.getElementById("gen1").checked
    ? possiblePokemon.push(Math.floor(Math.random() * GEN1INTERVALS[1] + 1))
    : null;
  let gen2 = document.getElementById("gen2").checked
    ? possiblePokemon.push(
        Math.floor(
          Math.random() * (GEN2INTERVALS[1] - GEN2INTERVALS[0]) +
            GEN2INTERVALS[0]
        )
      )
    : null;
  let gen3 = document.getElementById("gen3").checked
    ? possiblePokemon.push(
        Math.floor(
          Math.random() * (GEN3INTERVALS[1] - GEN3INTERVALS[0]) +
            GEN3INTERVALS[0]
        )
      )
    : null;
  let gen4 = document.getElementById("gen4").checked
    ? possiblePokemon.push(
        Math.floor(
          Math.random() * (GEN4INTERVALS[1] - GEN4INTERVALS[0]) +
            GEN4INTERVALS[0]
        )
      )
    : null;
  let gen5 = document.getElementById("gen5").checked
    ? possiblePokemon.push(
        Math.floor(
          Math.random() * (GEN5INTERVALS[1] - GEN5INTERVALS[0]) +
            GEN5INTERVALS[0]
        )
      )
    : null;
  let gen6 = document.getElementById("gen6").checked
    ? possiblePokemon.push(
        Math.floor(
          Math.random() * (GEN6INTERVALS[1] - GEN6INTERVALS[0]) +
            GEN6INTERVALS[0]
        )
      )
    : null;
  let gen7 = document.getElementById("gen7").checked
    ? possiblePokemon.push(
        Math.floor(
          Math.random() * (GEN7INTERVALS[1] - GEN7INTERVALS[0]) +
            GEN7INTERVALS[0]
        )
      )
    : null;
  localStorage.setItem(
    "generations",
    JSON.stringify({
      "1": gen1,
      "2": gen2,
      "3": gen3,
      "4": gen4,
      "5": gen5,
      "6": gen6,
      "7": gen7,
    })
  );
  return possiblePokemon.length
    ? possiblePokemon[
        Math.floor(Math.random() * possiblePokemon.length)
      ].toString()
    : "-1";
}

async function save() {
  let response = await this.asyncXhrRequest(
    "POST",
    "endpoints/submit_drawing.php?x=" + XSITE + "&y=" + YSITE,
    { data: FILLED }
  );
  // Handle reponses and errors.
}

function SetDefaultCheckboxes(choices) {
  for (let gen = 1; gen < NOOFGENERATIONS + 1; gen++) {
    let checkbox = document.getElementById("gen" + gen.toString());
    !!choices[gen] ? (checkbox.checked = true) : (checkbox.checked = false);
  }
}

init();
