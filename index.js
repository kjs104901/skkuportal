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

const reserveTimeoutSend = (event, messageType, timeoutSecond, callback) => {
    const timeout = setTimeout(() => {
        timeoutSent = true;
        event.sender.send(messageType, {
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

//// ------------ IPC ------------ ////
ipcMain.on("loginReq", (event, message) => {
    userId = message.userId;
    userPass = message.userPass;

    let timeoutSent = false;
    const timeout = reserveTimeoutSend(event, "loginRes", 10, () => {
        timeoutSent = true;
    })

    icampus.loginDirect(userId, userPass, (result) => {
        clearTimeout(timeout);
        if (timeoutSent === false) {
            if (result) {
                event.sender.send("loginRes", {
                    data: {
                        success: true
                    }
                })
            }
            else {
                event.sender.send("loginRes", {
                    err: "loginFailed",
                    errMessage: "로그인에 실패했습니다"
                })
            }
        }
    });
});

ipcMain.on("gotoMain", (event, message) => {
    mainWindowOpen();
});

ipcMain.on("openGLSReq", (event, message) => {
    let timeoutSent = false;
    const timeout = reserveTimeoutSend(event, "openGLSRes", 10, () => {
        timeoutSent = true;
    });

    portal.portalLogin(userId, userPass, (result) => {
        if (result) {
            console.log("login success");
            gls.setGlobalVal(portal.getGlobalVal(), (result) => {
                if (result == true) {
                    clearTimeout(timeout);
                    if (timeoutSent === false) {
                        gls.setImage();
                        gls.executeGLS((result) => {
                            if (result == true) {
                                console.log("Well finished")
                            }
                        });

                        event.sender.send("openGLSRes", {
                            data: {
                                success: true
                            }
                        })
                    }
                }
            });
        }
        else {
            console.log("login failed");
            event.sender.send("openGLSRes", {
                err: "loginFailed",
                errMessage: "로그인에 실패했습니다"
            })
        }
    });
});


ipcMain.on("icampusClassListReq", (event, message) => {
    let timeoutSent = false;
    const timeout = reserveTimeoutSend(event, "openGLSRes", 10, () => {
        timeoutSent = true;
    });

    console.log("icampusClassListReq get");

    icampus.loginCheck((result) => {
        if (result == true) {
            getClassList();
        }
        else {
            icampus.loginDirect(userId, userPass, (result) => {
                clearTimeout(timeout);
                if (timeoutSent === false) {
                    if (result) {
                        getClassList();
                    }
                    else {
                        reLoginFailed();
                    }
                }
            });
        }
    })
    console.log("Login..");

    let getClassList = () => {
        icampus.getClassList(2018, 1, (result)=>{
            clearTimeout(timeout);
            if (timeoutSent === false) {
                event.sender.send("icampusClassListRes", {
                    data: result
                })
                console.log("icampusClassListRes send");
            }
        })
    }
})