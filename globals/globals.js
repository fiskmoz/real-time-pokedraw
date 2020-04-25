const TIMERDEFAULT = 45;
const AMOUNTOFPOKEMON = 810;
const DIMENSION = 35;
const PADDINGLEFT = 16;
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

const modal = document.getElementById("user_modal");
const modal_text_input = document.getElementById("modal_text_input");
const modal_close = document.getElementById("modal_close_btn");
const rename_button = document.getElementById("rename_button");

modal_close.onclick = function () {
  if (
    modal_text_input.value == "" ||
    !modal_text_input.matches(/^[a-zA-Z0-9_]*$/)
  ) {
    // GIVE ERROR MSG, NICKNAME NEEDS TO BE SET.
    return;
  }
  USER = modal_text_input.value;
  localStorage.setItem("user", USER);
  modal.style.display = "none";
  document.body.style.overflow = "";
};

rename_button.onclick = function () {
  localStorage.removeItem("user");
  window.location = "/";
};

let USER = localStorage.getItem("user");
if (USER == null) {
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
        resolve(xhr.response);
      } else {
        reject({
          status: this.status,
          statusText: xhr.statusText,
        });
      }
    };
    xhr.onerror = function () {
      reject({
        status: this.status,
        statusText: xhr.statusText,
      });
    };
    if (data) {
      xhr.send(JSON.stringify(data));
    } else {
      xhr.send();
    }
  });
}
