const { remote, ipcRenderer } = require('electron');
const { BrowserWindow } = remote;

const { saveSetting, loadSetting, encrypt, decrypt } = require("../node_my_modules/util.js");

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
let autoSwitchery = new Switchery(autoCheckBox, {
  color: '#3D7178',
  size: 'small',
  disabled: false
});

let idSaveCheckBox = document.querySelector("#id-save-check-box");
let idSaveSwitchery = new Switchery(idSaveCheckBox, {
  color: '#3D7178',
  size: 'small',
  disabled: false
});

autoCheckBox.onchange = function() {
    if (autoCheckBox.checked) {
        if (idSaveCheckBox.checked === false) {
            $("#id-save-check-box").click();
        }
    }
};

idSaveCheckBox.onchange = function() {
    if (autoCheckBox.checked) {
        if (idSaveCheckBox.checked === false) {
            $("#id-save-check-box").click();
        }
    }
};

/// load switchery setting ///
const settingAutoLogin = loadSetting("auto_login");
if ((settingAutoLogin === true) && (autoCheckBox.checked == false)) {
    $("#auto-check-box").click();
} 
else if ((settingAutoLogin === false) && (autoCheckBox.checked == true)) {
    $("#auto-check-box").click();
}

const settingSaveId = loadSetting("save_id");
if ((settingSaveId === true) && (idSaveCheckBox.checked == false)) {
    $("#id-save-check-box").click();
} 
else if ((settingSaveId === false) && (idSaveCheckBox.checked == true)) {
    $("#id-save-check-box").click();
}

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
loginButton.addEventListener("click", loginTry)

$("#login-form-group").keypress(function(event) {
    if (event.which == 13) {
        event.preventDefault();
        loginTry();
    }
});

function loginTry() {
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
        saveSetting("save_id", userIdSave);
        saveSetting("auto_login", userAuto);

        if (userIdSave || userAuto) {
            saveSetting("user_id", userId)
        }
        if (userAuto) {
            sv = encrypt(userPass);
            saveSetting("user_pass", sv);
        }

        loginRequest(userId, userPass);
    }
}

let isLoginRequest = false;

/// id save // auto login ///
if (settingSaveId || settingAutoLogin) {
    const loadUserId = loadSetting("user_id");
    $("#userId").val(loadUserId);
}
if (settingAutoLogin) {
    const enLoadUserPass = loadSetting("user_pass");
    if (0 < enLoadUserPass.length) {
        const loadUserPass = decrypt(enLoadUserPass);
        $("#userPass").val(loadUserPass);
    
        loginTry();
    }
}

/// ######################### electron ######################### ////

function loginRequest(userId, userPass) {
    if (isLoginRequest === false) {
        loginButton.innerHTML = '<div class="progress-circle-indeterminate" style="width:25%; height:100%;"></div>';
        document.querySelector("#userId").readOnly = true; 
        document.querySelector("#userPass").readOnly = true;
        autoSwitchery.disable();
        idSaveSwitchery.disable();
        isLoginRequest = true;
        
        ipcRenderer.send("loginReq", {
            userId: userId,
            userPass: userPass
        });
    }
}

ipcRenderer.on("loginRes", (event, message) => {
    if (message.err) {
        $('body').pgNotification({
            style: "circle",
            timeout: 2000,
            message: message.errMessage,
            type: "danger"
        }).show();

        loginButton.innerHTML = '로그인';
        document.querySelector("#userId").readOnly = false; 
        document.querySelector("#userPass").readOnly = false;
        $("#userPass").val("")
        autoSwitchery.enable();
        idSaveSwitchery.enable();
        isLoginRequest = false;
        
        saveSetting("user_pass", "");
        return;
    }
    else {
        $('body').pgNotification({
            style: "circle",
            timeout: 2000,
            message: "로그인 성공",
            type: "success"
        }).show();

        if (message.data.success) {
            ipcRenderer.send("gotoMain", true);
        }
    }
});