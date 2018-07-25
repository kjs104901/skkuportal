const { app, BrowserWindow, ipcMain } = require('electron');

const icampus = require("./node_my_modules/icampus");
const gls = require("./node_my_modules/gls");
const portal = require("./node_my_modules/portal");

const colorSkkuBackground = "#1B484F";
const colorSkkuBackgroundDoom = "#3D7178";
const colorSkkuBackgroundDeep = "#1C414A";
const colorSkkuLogo = "#FFD661";

//// ------------ Windows ------------ ////
let loginWindow;
const loginWindowSetting = {
    //width: 500, height: 600,
    width: 1200, height: 600,
    frame: false,
    show: false,
    resizable: false,
    backgroundColor: colorSkkuBackground,
    icon: "./html/icon.ico"
};
let mainWindow;
const mainWindowSetting = {
    //width: 790, height: 650,
    width: 1600, height: 900,
    frame: false,
    show: false,
    //resizable: false,
    //minWidth: 600, minHeight: 400,
    backgroundColor: "#F0F0F0",
    icon: "./html/icon.ico"
};

const loginWindowOpen = () => {
    loginWindow = new BrowserWindow(loginWindowSetting);
    loginWindow.loadFile('./html/login.html');

    loginWindow.once('ready-to-show', () => {
        loginWindow.show();
        loginWindow.webContents.openDevTools();
    })

    if (mainWindow) {
        if (!mainWindow.isDestroyed()){
            mainWindow.close();
        }
    }
}

const mainWindowOpen = () => {
    mainWindow = new BrowserWindow(mainWindowSetting);
    mainWindow.loadFile('./html/main.html');

    mainWindow.once('ready-to-show', () => {
        setTimeout(() => {
            mainWindow.show();
        }, 500);

        mainWindow.webContents.openDevTools();
    })

    if (loginWindow) {
        if (!loginWindow.isDestroyed()){
            loginWindow.close();
        }
    }
}

//// ------------ User Info ------------ ////
let userId;
let userPass;

process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true';

app.on('ready', () => {
    loginWindowOpen();
});

const reserveTimeoutSend = (sender, messageType, timeoutSecond, callback) => {
    const timeout = setTimeout(() => {
        timeoutSent = true;
        sender.send(messageType, {
            err: "timeOut",
            errMessage: "요청 시간이 초과되었습니다"
        })
        callback();
    }, timeoutSecond * 1000);

    return timeout;
};

const reLoginFailed = () => {
    loginWindowOpen();
}

//// ------------ checkLoginElseTry ------------ ////

const checkLoginElseTryIcampus = (callback) => {
    icampus.loginCheck((result) => {
        if (result == true) {
            callback(true);
        }
        else {
            icampus.loginDirect(userId, userPass, (result) => {
                if (result) {
                    callback(true);
                }
                else {
                    callback(false);
                }
            });
        }
    })
}

const checkLoginElseTryPortal = (callback) => {
    portal.loginCheck((result) => {
        if (result == true) {
            callback(true);
        }
        else {
            portal.login(userId, userPass, (result) => {
                if (result) {
                    callback(true);
                }
                else {
                    callback(false);
                }
            });
        }
    })
}

//// ------------ IPC frontend ------------ ////
ipcMain.on("loginReq", (event, message) => {
    userId = message.userId;
    userPass = message.userPass;

    let timeoutSent = false;
    const timeout = reserveTimeoutSend(event.sender, "loginRes", 10, () => {
        timeoutSent = true;
    })

    loginReqest(userId, userPass, (result)=>{
        clearTimeout(timeout);
        if (timeoutSent === false) {
            event.sender.send("loginRes", result);
        }
    });
});

ipcMain.on("gotoMain", (event, message) => {
    mainWindowOpen();
});

ipcMain.on("openGLSReq", (event, message) => {
    let timeoutSent = false;
    const timeout = reserveTimeoutSend(event.sender, "openGLSRes", 10, () => {
        timeoutSent = true;
    });

    openGLSRequest((result)=>{
        clearTimeout(timeout);
        if (timeoutSent === false) {
            event.sender.send("openGLSRes", result);
        }
    });
});

ipcMain.on("icampusClassListReq", (event, message) => {
    let timeoutSent = false;
    const timeout = reserveTimeoutSend(event.sender, "openGLSRes", 10, () => {
        timeoutSent = true;
    });

    icampusClassListRequest((result) => {
        clearTimeout(timeout);
        if (timeoutSent === false) {
            event.sender.send("icampusClassListRes", result);
        }
    });
})

//// ------------ IPC backend functions ------------ ////

const loginReqest = (userId, userPass, callback) => {
    portal.login(userId, userPass, (result) => {});
    icampus.loginDirect(userId, userPass, (result) => {
        if (result) {
            callback({
                data: {
                    success: true
                }
            });
        }
        else {
            callback({
                err: "loginFailed",
                errMessage: "로그인에 실패했습니다"
            });
        }
    });
}

const openGLSRequest = (callback) => {
    checkLoginElseTryPortal((result) => {
        if (result) {
            gls.setGlobalVal(portal.getGlobalVal(), (result) => {
                if (result == true) {
                    gls.setImage();
                    gls.executeGLS((result) => {});

                    callback({
                        data: {
                            success: true
                        }
                    })
                }
            });
        }
        else {
            reLoginFailed();
        }
    });
}

const icampusClassListRequest = (callback) => {
    checkLoginElseTryIcampus((result) => {
        if (result) {
            icampus.getClassList(2018, 10, (result)=>{
                callback({
                    data: result
                });
            })
        }
        else {
            reLoginFailed();
        }
    });
}