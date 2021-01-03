const canvas_element = document.getElementById("draw_canvas");
const timer_element = document.getElementById("timer");
const context = canvas_element.getContext("2d");
const stop_drawing_button = document.getElementById("stop_drawing_button");
const users_list_element = document.getElementById("users_list");
const how_to_button = document.getElementById("how_to_button");
const how_to_div = document.getElementById("how_to_div");
const user_already_drawing_element = document.getElementById(
  "user_already_drawing"
);
const users_score_list_element = document.getElementById("users_score_list");
const users_status_list_element = document.getElementById("users_status_list");
const XSITE = get("x");
const YSITE = get("y");
const WIDTH = canvas_element.clientWidth;
const HEIGHT = canvas_element.clientWidth;
canvas_element.setAttribute("width", WIDTH);
canvas_element.setAttribute("height", HEIGHT);
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
let howToHidden = false;
let colorJustSelected = false;

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
      } catch (error) {
        pixelData = null;
      }
      // Handle pixel data.
      if (pixelData != null) {
        if (Object.keys(pixelData["data"]).length === 0) {
          ClearCanvas();
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
  let tutorialBoolean = JSON.parse(localStorage.getItem("tutorial"));
  if (typeof tutorialBoolean === "boolean") howToHidden = tutorialBoolean;
  ToggleHowToPlay();

  canvas_element.addEventListener(
    "touchstart",
    (e) => {
      e.preventDefault();
      if (event.srcElement.id != canvas_element.id || colorJustSelected == true)
        return;
      isDrawing = true;
      Fill(e);
      return false;
    },
    false
  );
  canvas_element.addEventListener(
    "touchmove",
    (e) => {
      e.preventDefault();
      Fill(e);
      return false;
    },
    false
  );
  canvas_element.addEventListener(
    "touchend",
    (e) => {
      e.preventDefault();
      if (
        event.srcElement.id != canvas_element.id ||
        colorJustSelected == true ||
        isWatching == true
      )
        return;
      isDrawing = false;
      save();
      previousPixel = [-1, -1];
      return false;
    },
    false
  );
  canvas_element.addEventListener("mousemove", Fill, false);
  canvas_element.addEventListener("mousedown", Fill, false);
  pickr.on("change", function () {
    selectedColor = pickr.getColor().toHEXA().toString();
    pickr.hide();
    colorJustSelected = true;
    setTimeout(() => {
      colorJustSelected = false;
    }, 100);
  });

  window.stop_drawing = function () {
    save();
    this.StopDrawing();
  };

  window.clear_canvas = function () {
    this.ClearCanvas();
    save();
  };

  window.start_countdown = async function () {
    await asyncXhrRequest(
      "GET",
      "endpoints/adjust_status?x=" +
        XSITE +
        "&y=" +
        YSITE +
        "&user=" +
        clientIdentifier +
        "&isDrawing=true",
      null
    )
      .then((response) => {
        if (!howToHidden) ToggleHowToPlay();
        user_already_drawing_element.setAttribute(
          "class",
          "user-already-drawing hidden"
        );
        stop_drawing_button.setAttribute("class", "button");
        ChangeDrawStatus();
        timer = TIMERDEFAULT;
        timer_element.innerHTML = timer.toString();
        this.GetRandomPokemon();
      })
      .catch((response) => {
        if (response.status == "409") {
          user_already_drawing_element.setAttribute(
            "class",
            "user-already-drawing"
          );
        }
      });
  };

  window.addEventListener("beforeunload", async function (e) {
    var firefox = /Firefox[\/\s](\d+)/.test(navigator.userAgent);

    if (firefox) {
      setTimeout(async function () {
        await UserLeaving();
      }, 0);
    } else {
      await UserLeaving();
    }
  });

  window.addEventListener("DOMContentLoaded", async function (e) {
    await asyncXhrRequest(
      "GET",
      "endpoints/joining?x=" + XSITE + "&y=" + YSITE + "&user=" + globalUser,
      null
    ).then((res) => {
      clientIdentifier = JSON.parse(res.response).id;
    });
  });
  window.addEventListener("mouseup", (e) => {
    if (
      event.srcElement.id != canvas_element.id ||
      colorJustSelected == true ||
      isWatching == true
    ) {
      isDrawing = false;
      return;
    }
    isDrawing = false;
    save();
    previousPixel = [-1, -1];
    return;
  });

  window.addEventListener("mousedown", (e) => {
    if (event.srcElement.id != canvas_element.id) {
      isDrawing = false;
      return;
    }
    isDrawing = true;
    Fill(e);
  });
}

function Fill(event) {
  if (isWatching) return;
  if (!isDrawing) return;
  let pixel = [
    Math.floor(
      (!!event.offsetX
        ? event.offsetX
        : event.targetTouches[0].clientX -
          event.target.getBoundingClientRect().x) / PIXELSIZE
    ),
    Math.floor(
      (!!event.offsetY
        ? event.offsetY
        : event.targetTouches[0].clientY -
          event.target.getBoundingClientRect().y) / PIXELSIZE
    ),
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
  if (filledPixels[pixel[0] + "," + pixel[1]] == DEFAULTWHITE) return;
  filledPixels[pixel[0] + "," + pixel[1]] = DEFAULTWHITE;
  let cpx = Math.floor(pixel[0] * PIXELSIZE) + 0.5;
  let cpy = Math.floor(pixel[1] * PIXELSIZE) + 0.5;
  let cps = Math.floor(PIXELSIZE - 1.3) + 0.5;
  context.fillStyle = DEFAULTWHITE;
  context.fillRect(cpx, cpy, cps, cps);
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
    "endpoints/pokedex?id=" + pokemon_index_str,
    null
  );
  pokemon_name_dto = JSON.parse(pokemon_name_dto.response);
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
  asyncXhrRequest(
    "GET",
    "endpoints/adjust_status?x=" +
      XSITE +
      "&y=" +
      YSITE +
      "&user=" +
      clientIdentifier +
      "&isDrawing=false",
    null
  );
  canvas_element.setAttribute("class", "draw-canvas watching");
  stop_drawing_button.setAttribute("class", "button hidden");
  isWatching = true;
  isDrawing = false;
  timer = TIMERDEFAULT;
  timer_element.innerHTML = "";
  this.clearInterval(timeout);
}

async function UserLeaving() {
  await asyncXhrRequest(
    "GET",
    "endpoints/leaving?x=" +
      XSITE +
      "&y=" +
      YSITE +
      "&user=" +
      clientIdentifier,
    null
  );
}

function GetPokedexIdMultipleGenerations() {
  let possiblePokemon = [];
  let gen1 = document.getElementById("gen1").checked
    ? possiblePokemon.push(Math.floor(Math.random() * GEN1INTERVALS[1] + 1))
    : null;
  let gen2 = document.getElementById("gen2").checked
    ? possiblePokemon.push(GetRandomFromInterval(GEN2INTERVALS))
    : null;
  let gen3 = document.getElementById("gen3").checked
    ? possiblePokemon.push(GetRandomFromInterval(GEN3INTERVALS))
    : null;
  let gen4 = document.getElementById("gen4").checked
    ? possiblePokemon.push(GetRandomFromInterval(GEN4INTERVALS))
    : null;
  let gen5 = document.getElementById("gen5").checked
    ? possiblePokemon.push(GetRandomFromInterval(GEN5INTERVALS))
    : null;
  let gen6 = document.getElementById("gen6").checked
    ? possiblePokemon.push(GetRandomFromInterval(GEN6INTERVALS))
    : null;
  let gen7 = document.getElementById("gen7").checked
    ? possiblePokemon.push(GetRandomFromInterval(GEN7INTERVALS))
    : null;
  localStorage.setItem(
    "generations",
    JSON.stringify({
      1: gen1,
      2: gen2,
      3: gen3,
      4: gen4,
      5: gen5,
      6: gen6,
      7: gen7,
    })
  );
  return possiblePokemon.length
    ? possiblePokemon[
        Math.floor(Math.random() * possiblePokemon.length)
      ].toString()
    : "-1";
}

function GetRandomFromInterval(interval) {
  return Math.floor(Math.random() * (interval[1] - interval[0]) + interval[0]);
}

async function save() {
  let response = await this.asyncXhrRequest(
    "POST",
    "endpoints/submit_drawing?x=" + XSITE + "&y=" + YSITE,
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
      "endpoints/adjust_score?x=" +
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
  users_score_list_element.innerHTML = "<li><b>Score: </b> </li> </br>";
  users_status_list_element.innerHTML = "<li><b>Status: </b> </li> </br>";
}

function AppendUsersToList(data, _identifier, index) {
  let li = document.createElement("li");
  li.appendChild(document.createTextNode(data["users"][_identifier]["user"]));
  users_list_element.appendChild(li);
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

  let liStatus = document.createElement("li");
  liStatus.appendChild(
    document.createTextNode(
      data["users"][_identifier]["isDrawing"] ? "Drawing" : "Watching"
    )
  );
  users_status_list_element.appendChild(
    document.createElement("li").appendChild(liStatus)
  );
}

function SetInnerHtmlLiScore(element, _identifier, score, index) {
  element.innerHTML =
    '<input type="button" class="button small" value="-" onclick="AdjustScore(' +
    "'" +
    _identifier +
    "'," +
    (parseInt(score) - 1) +
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

how_to_button.onclick = function () {
  ToggleHowToPlay();
  localStorage.setItem("tutorial", !howToHidden);
};

function ChangeDrawStatus() {
  let userIndex = 0;
  let users = JSON.parse(usersInLobby);
  for (user in users) {
    if (user == clientIdentifier) {
      break;
    }
    userIndex++;
  }
  let statuses = users_status_list_element.getElementsByTagName("li");
  statuses[userIndex + 1].innerHTML = "Drawing";
}

function ToggleHowToPlay() {
  if (howToHidden) {
    how_to_div.setAttribute("class", "");
    how_to_button.value = "Hide Tutorial";
  } else {
    how_to_div.setAttribute("class", "hidden");
    how_to_button.value = "Show Tutorial";
  }
  howToHidden = !howToHidden;
}

function get(name) {
  if (
    (name = new RegExp("[?&]" + encodeURIComponent(name) + "=([^&]*)").exec(
      location.search
    ))
  )
    return decodeURIComponent(name[1]);
}

init();
