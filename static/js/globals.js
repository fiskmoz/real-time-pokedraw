const TIMERDEFAULT = 45;
const AMOUNTOFPOKEMON = 810;
const DIMENSION = 35;
const PADDINGTOP = 5;
const DEFAULTWHITE = "#FFFFFF";
const GEN1INTERVALS = [1, 151];
const GEN2INTERVALS = [152, 251];
const GEN3INTERVALS = [252, 386];
const GEN4INTERVALS = [387, 493];
const GEN5INTERVALS = [494, 649];
const GEN6INTERVALS = [650, 721];
const GEN7INTERVALS = [722, 809];
const NOOFGENERATIONS = 7;
const NICKNAMEREGEX = /^[a-zA-Z0-9_ ]*$/g;

let modal = document.getElementById("user_modal");
let modal_text_input = document.getElementById("modal_text_input");
let modal_close = document.getElementById("modal_close_btn");
let rename_button = document.getElementById("rename_button");
let modal_error_msg = document.getElementById("modal_error_msg");
let globalUser;

modal_close.onclick = function () {
  if (
    modal_text_input.value == "" ||
    !modal_text_input.value.match(NICKNAMEREGEX)
  ) {
    modal_error_msg.innerHTML =
      "Nickname cannot be empty or contains invalid characters";
    modal_error_msg.setAttribute("class", "error-container");
    return;
  }
  globalUser = modal_text_input.value;
  localStorage.setItem("user", globalUser);
  modal.style.display = "none";
  document.body.style.overflow = "";
};

rename_button.onclick = function () {
  localStorage.removeItem("user");
  window.location = "/";
};

globalUser = localStorage.getItem("user");
if (globalUser == null) {
  modal.style.display = "block";
  document.body.style.overflow = "hidden";
}

function asyncXhrRequest(method, url, data) {
  return new Promise(function (resolve, reject) {
    var xhr = new XMLHttpRequest();
    xhr.open(method, url, true);
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhr.onload = function () {
      if (this.status >= 200 && this.status < 300) {
        resolve({
          response: xhr.response,
          status: this.status,
          statusText: this.statusText,
        });
      } else {
        reject({
          response: xhr.response,
          status: this.status,
          statusText: this.statusText,
        });
      }
    };
    xhr.onerror = function () {
      reject({
        response: xhr.response,
        status: this.status,
        statusText: this.statusText,
      });
    };
    if (data) {
      xhr.send(JSON.stringify(data));
    } else {
      xhr.send();
    }
  });
}
