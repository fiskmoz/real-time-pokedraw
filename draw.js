const canvas_element = document.getElementById("draw_canvas");
const timer_element = document.getElementById("timer");
const context = canvas_element.getContext("2d");
const users_list_element = document.getElementById("users_list");
const users_timestamp_list_element = document.getElementById(
  "users_timestamp_list"
);
const users_score_list_element = document.getElementById("users_score_list");
const lobbyIds = document
  .getElementById("lobby_identifier")
  .getAttribute("name")
  .split(",");
const XSITE = lobbyIds[0];
const YSITE = lobbyIds[1];
const WIDTH = canvas_element.clientWidth;
const HEIGHT = canvas_element.clientWidth;
const PIXELSIZE = WIDTH / DIMENSION;

let clientIdentifier = "";
let filledPixels = {};
let previousPixel = [-1, -1];
let timeout;
let timer = TIMERDEFAULT;
let isWatching = true;
let isDrawing = false;
let selectedColor = "#42445A";
let usersInLobby = "";
let hasLeft = false;
let updateUserScoreTimeout = null;

context.translate(0.5, 0.5);

function init() {
  ClearCanvas();
  db.collection("app")
    .doc(XSITE + "," + YSITE)
    .onSnapshot(function (doc) {
      if (isDrawing) return;
      if (!isWatching) return;
      let data = doc.data();
      if (data == null) return;
      let pixelData;
      try {
        pixelData = JSON.parse(data["pixels"]);
      } catch {
        pixelData = null;
      }
      // Handle pixel data.
      if (pixelData != null) {
        if (Object.keys(pixelData["data"]).length === 0) {
          for (let x = 1; x < DIMENSION - 1; x++) {
            for (let y = 1; y < DIMENSION - 1; y++) {
              ClearPixel([x, y]);
            }
          }
        } else {
          for (let subkey in pixelData["data"]) {
            let subcoordniate = subkey.split(",");
            let color = pixelData["data"][subcoordniate];
            FillPixel(subcoordniate, color);
          }
        }
      }
      // Handle user data.
      let newUsers = JSON.stringify(data["users"]);
      if (
        usersInLobby == newUsers ||
        newUsers == "{}" ||
        updateUserScoreTimeout != null
      )
        return;
      usersInLobby = newUsers;
      if (users_list_element.getElementsByTagName("li").length > 1) {
        ClearUserList();
      }
      let userIndex = 1;
      for (let _identifier in data["users"]) {
        AppendUsersToList(data, _identifier, userIndex);
        userIndex++;
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

  canvas_element.addEventListener("mousemove", Fill, false);
  canvas_element.addEventListener("mousedown", Fill, false);
  pickr.on("change", function () {
    selectedColor = pickr.getColor().toHEXA().toString();
  });

  window.stop_drawing = function () {
    save();
    this.StopDrawing();
  };

  window.clear_canvas = function () {
    this.ClearCanvas();
    save();
  };

  window.start_countdown = function () {
    timer = TIMERDEFAULT;
    timer_element.innerHTML = timer.toString();
    this.GetRandomPokemon();
  };

  window.addEventListener("beforeunload", async function (e) {
    let res = await asyncXhrRequest(
      "GET",
      "endpoints/leaving.php?x=" +
        XSITE +
        "&y=" +
        YSITE +
        "&user=" +
        clientIdentifier,
      null
    );
    return;
  });

  window.addEventListener("DOMContentLoaded", async function (e) {
    await asyncXhrRequest(
      "GET",
      "endpoints/joining.php?x=" +
        XSITE +
        "&y=" +
        YSITE +
        "&user=" +
        globalUser,
      null
    ).then((res) => {
      clientIdentifier = JSON.parse(res).identifier;
    });
  });
  window.addEventListener("mouseup", (e) => {
    if (event.srcElement.id != canvas_element.id) return;
    isDrawing = false;
    save();
    previousPixel = [-1, -1];
    return;
  });

  window.addEventListener("mousedown", (e) => {
    if (event.srcElement.id != canvas_element.id) return;
    isDrawing = true;
    Fill(e);
  });
}

function Fill(event) {
  if (isWatching) return;
  if (event.srcElement.id != canvas_element.id || !isDrawing) return;
  let pixel = [
    Math.floor(event.offsetX / PIXELSIZE),
    Math.floor(event.offsetY / PIXELSIZE),
  ];
  if (pixel[0] == previousPixel[0] && pixel[1] == previousPixel[1]) return;
  event.ctrlKey ? ClearPixel(pixel) : FillPixel(pixel, selectedColor);
  previousPixel = pixel;
}

function FillPixel(pixel, color) {
  filledPixels[pixel[0] + "," + pixel[1]] = color;
  context.fillStyle = color;
  context.fillRect(
    Math.floor(pixel[0] * PIXELSIZE) + 0.5,
    Math.floor(pixel[1] * PIXELSIZE) + 0.5,
    Math.floor(PIXELSIZE - 1.5) + 0.5,
    Math.floor(PIXELSIZE - 1.5) + 0.5
  );
}

function ClearPixel(pixel) {
  filledPixels[pixel[0] + "," + pixel[1]] = DEFAULTWHITE;
  let cpx = Math.floor(pixel[0] * PIXELSIZE) + 0.5;
  let cpy = Math.floor(pixel[1] * PIXELSIZE) + 0.5;
  let cps = Math.floor(PIXELSIZE - 1.2) + 0.5;
  context.fillStyle = DEFAULTWHITE;
  for (let i = 0; i < 3; i++) {
    context.fillRect(cpx, cpy, cps, cps);
  }
}

function ClearCanvas() {
  filledPixels = {};
  context.clearRect(0, 0, canvas_element.width, canvas_element.height);
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
  this.clearInterval(timeout);
  timeout = this.setInterval(() => {
    timer--;
    timer_element.innerHTML = timer.toString();
    if (timer <= 10) {
      timer % 2 == 0
        ? canvas_element.setAttribute("class", "draw-canvas watching")
        : canvas_element.setAttribute("class", "draw-canvas drawing");
    }
    if (timer <= 0) {
      StopDrawing();
    }
  }, 1000);
  isWatching = false;
  canvas_element.setAttribute("class", "draw-canvas drawing");
}

function StopDrawing() {
  canvas_element.setAttribute("class", "draw-canvas watching");
  isWatching = true;
  isDrawing = false;
  timer = TIMERDEFAULT;
  timer_element.innerHTML = "";
  this.clearInterval(timeout);
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
    { data: filledPixels }
  );
  // Handle reponses and errors.
}

function SetDefaultCheckboxes(choices) {
  for (let gen = 1; gen < NOOFGENERATIONS + 1; gen++) {
    let checkbox = document.getElementById("gen" + gen.toString());
    !!choices[gen] ? (checkbox.checked = true) : (checkbox.checked = false);
  }
}

async function AdjustScore(_identifier, newScore, index) {
  if (newScore < 0) {
    return;
  }
  SetInnerHtmlLiScore(
    document.getElementById("userLi" + index),
    _identifier,
    newScore,
    index
  );
  if (updateUserScoreTimeout != null) {
    clearTimeout(updateUserScoreTimeout);
  }
  updateUserScoreTimeout = setTimeout(() => {
    let res = asyncXhrRequest(
      "GET",
      "endpoints/adjust_score.php?x=" +
        XSITE +
        "&y=" +
        YSITE +
        "&user=" +
        _identifier +
        "&score=" +
        newScore.toString(),
      null
    );
    updateUserScoreTimeout = null;
  }, 1500);
}

function ClearUserList() {
  users_list_element.innerHTML = "<li><b>Names: </b> </li> </br>";
  users_timestamp_list_element.innerHTML = "<li><b>Joined: </b> </li> </br>";
  users_score_list_element.innerHTML = "<li><b>Score: </b> </li> </br>";
}

function AppendUsersToList(data, _identifier, index) {
  let offsetTime = new Date(
    data["users"][_identifier]["timestamp"].toDate().getTime()
  );
  let li = document.createElement("li");
  li.appendChild(document.createTextNode(data["users"][_identifier]["user"]));
  users_list_element.appendChild(li);
  let liTime = document.createElement("li");
  liTime.appendChild(
    document.createTextNode(
      offsetTime
        .toLocaleTimeString()
        .substr(0, offsetTime.toLocaleTimeString().length - 3)
    )
  );
  users_timestamp_list_element.appendChild(liTime);
  let liScore = document.createElement("li");
  liScore.setAttribute("id", "userLi" + index);
  SetInnerHtmlLiScore(
    liScore,
    _identifier,
    data["users"][_identifier]["score"],
    index
  );
  users_score_list_element.appendChild(
    document.createElement("li").appendChild(liScore)
  );
}

function SetInnerHtmlLiScore(element, _identifier, score, index) {
  element.innerHTML =
    '<input type="button" class="button small" value="-" onclick="AdjustScore(' +
    "'" +
    _identifier +
    "'," +
    (score - 1) +
    "," +
    index +
    ')">' +
    '<span class="score-span">' +
    score +
    "</span>" +
    '<input type="button" class="button small" value="+" onclick="AdjustScore(' +
    "'" +
    _identifier +
    "'," +
    (parseInt(score) + 1) +
    "," +
    index +
    ')">';
}

init();
