const { remote } = require('electron');
const { BrowserWindow } = remote;

/// header buttons ///
let minButton = document.querySelector("#minimize-button");
let closeButton = document.querySelector("#close-button");

minButton.addEventListener("click", ()=>{
    let currentBrowser = BrowserWindow.getFocusedWindow();
    currentBrowser.minimize();
});

closeButton.addEventListener("click", ()=>{
    let currentBrowser = BrowserWindow.getFocusedWindow();
    currentBrowser.close();
});

/// switchery ///
let autoCheckBox = document.querySelector("#auto-check-box");
new Switchery(autoCheckBox, {
  color: '#3D7178',
  size: 'small'
});

let idSaveCheckBox = document.querySelector("#id-save-check-box");
new Switchery(idSaveCheckBox, {
  color: '#3D7178',
  size: 'small'
});

/// pop ove ///
let idOptions = {
    content: "아이디는 필수로 입력해야 합니다",
    trigger: "manual",
    html: true,
    placement: 'top'
};
$('#userId').popover(idOptions); //Init all input.email-test with popover

let passOptions = {
    content: "비밀번호는 필수로 입력해야 합니다",
    trigger: "manual",
    html: true,
    placement: 'top'
};
$('#userPass').popover(passOptions); //Init all input.email-test with popover

$(document).mouseup((e) => {
    $('#userId').popover('hide'); //hide
    $('#userId').popover('hide'); //hide
});

/// login button ///
let loginButton = document.querySelector("#login-button");
loginButton.addEventListener("click", ()=>{
    let userId = $("#userId").val();
    let userIdSave = $("#id-save-check-box").is(":checked");
    let userPass = $("#userPass").val();
    let userAuto = $("#auto-check-box").is(":checked");

    if (userId.length === 0){
        $('#userId').popover('show');
        setTimeout(()=>{
            $('#userId').popover('hide');
        }, 2000);
    }
    else if (userPass.length === 0) {
        $('#userPass').popover('show');
        setTimeout(()=>{
            $('#userPass').popover('hide');
        }, 2000);
    }
    else {
        console.log("login: ", userId, userIdSave, userPass, userAuto);
    }
})