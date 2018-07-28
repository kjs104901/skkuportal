const { app, BrowserWindow, ipcMain, dialog } = require('electron');

const {download} = require('electron-dl');

const icampus = require("./node_my_modules/icampus");
const gls = require("./node_my_modules/gls");
const portal = require("./node_my_modules/portal");
const weather = require("./node_my_modules/weather");

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
    width: 1600, height: 630,
    frame: false,
    show: false,
    //resizable: false,
    //minWidth: 600, minHeight: 400,
    backgroundColor: "#F0F0F0",
    icon: "./html/icon.ico"
};

const loginWindowOpen = () => {
    if (loginWindow) {
        if (!loginWindow.isDestroyed()){
            loginWindow.close();
        }
    }
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
    if (mainWindow) {
        if (!mainWindow.isDestroyed()){
            mainWindow.close();
        }
    }
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

const icampusFileDownload = (url, filename, saveFilename) => {
    let fullUrl = "http://www.icampus.ac.kr/FileManager.do?method=downloadOld&pathInfo=";
    fullUrl += url;
    fullUrl += "&fileinfo=01|"+filename+"|"+saveFilename+"|0";

    download(BrowserWindow.getFocusedWindow(), fullUrl, {
        saveAs: true,
        filename: filename
    })
    .catch();
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
// for action
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

ipcMain.on("icampusFileDownload", (event, message) => {
    icampusFileDownload(message.url, message.name, message.saveName);
});

// for infor
ipcMain.on("studentInfoReq", (event, message) => {
    event.sender.send("studentInfoRes", {
        data: {
            name: portal.getName(),
            department: portal.getDepartment()
        }
    });
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

ipcMain.on("classListReq", (event, message) => {
    let timeoutSent = false;
    const timeout = reserveTimeoutSend(event.sender, "classListRes", 10, () => {
        timeoutSent = true;
    });

    classListRequest((result) => {
        clearTimeout(timeout);
        if (timeoutSent === false) {
            event.sender.send("classListRes", result);
        }
    });
});

ipcMain.on("postListReq", (event, message) => {
    let timeoutSent = false;
    const timeout = reserveTimeoutSend(event.sender, "postListRes", 10, () => {
        timeoutSent = true;
    });

    postListRequest(message, (result) => {
        clearTimeout(timeout);
        if (timeoutSent === false) {
            event.sender.send("postListRes", result);
        }
    });
});

ipcMain.on("messageListReq", (event, message) => {
    let timeoutSent = false;
    const timeout = reserveTimeoutSend(event.sender, "messageListRes", 10, () => {
        timeoutSent = true;
    });

    messageListRequest((result) => {
        clearTimeout(timeout);
        if (timeoutSent === false) {
            event.sender.send("messageListRes", result);
        }
    });
});

ipcMain.on("postReq", (event, message) => {
    let timeoutSent = false;
    const timeout = reserveTimeoutSend(event.sender, "postRes", 10, () => {
        timeoutSent = true;
    });

    postRequest(message.url, message.type, (result) => {
        clearTimeout(timeout);
        if (timeoutSent === false) {
            event.sender.send("postRes", result);
        }
    })
});

ipcMain.on("messageReq", (event, message) => {
    let timeoutSent = false;
    const timeout = reserveTimeoutSend(event.sender, "messageRes", 10, () => {
        timeoutSent = true;
    });

    messageRequest(message.messageId, (result) => {
        clearTimeout(timeout);
        if (timeoutSent === false) {
            event.sender.send("messageRes", result);
        }
    })
});

ipcMain.on("weatherReq", (event, message) => {
    let timeoutSent = false;
    const timeout = reserveTimeoutSend(event.sender, "weatherRes", 10, () => {
        timeoutSent = true;
    });

    weatherRequest((result) => {
        clearTimeout(timeout);
        if (timeoutSent === false) {
            event.sender.send("weatherRes", result);
        }
    });
});


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
            portal.getGlobalVal((globalVal) => {
                if (0 < globalVal.length) {
                    gls.setGlobalVal(globalVal, (result) => {
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
                    callback({
                        err: "getGlobalValFailed",
                        errMessage: "인증정보를 얻지 못했습니다"
                    });
                }
            })
        }
        else {
            reLoginFailed();
        }
    });
}

const classListRequest = (callback) => {
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

const postListRequest = (identity, callback) => {
    let postList = [];

    checkLoginElseTryIcampus((result) => {
        if (result) {
            icampus.getPostList(identity, icampus.NOTICE, (result)=>{
                result.forEach(post => {
                    postList.push({
                        type: "notice",
                        post: post
                    })
                });

                icampus.getPostList(identity, icampus.MATERIAL, (result) => {
                    result.forEach(post => {
                        postList.push({
                            type: "material",
                            post: post
                        })
                    });

                    icampus.getPostList(identity, icampus.ASSIGNMENT, (result) => {
                        result.forEach(post => {
                            postList.push({
                                type: "assignment",
                                post: post
                            })
                        });
                        
                        postList.sort((a, b) => {
                            let aDate = new Date();
                            let bDate = new Date();
                            if (a.post.date) {
                                aDate = new Date(a.post.date);
                            }
                            else if (a.post.startTime) {
                                aDate = new Date(a.post.startTime);
                            }
                            if (b.post.date) {
                                bDate = new Date(b.post.date);
                            }
                            else if (b.post.startTime) {
                                bDate = new Date(b.post.startTime);
                            }
                            return aDate > bDate ? -1 : aDate < bDate ? 1 : 0;
                        });
                        callback({
                            data: postList
                        });
                    })
                })
            });
        }
        else {
            reLoginFailed();
        }
    });
};

const messageListRequest = (callback) => {
    checkLoginElseTryIcampus((result) => {
        if (result) {
            icampus.getMessageList((result) => {
                callback({
                    data: result
                })
            })
        }
        else {
            reLoginFailed();
        }
    });
}

const postRequest = (url, type, callback) => {
    checkLoginElseTryIcampus((result) => {
        if (result) { 
            let iType = -1;
            if (type === "notice") {
                iType = icampus.NOTICE;
            }
            else if (type === "material") {
                iType = icampus.MATERIAL;
            }
            else if (type === "assignment") {
                iType = icampus.ASSIGNMENT;
            }

            if (-1 < iType) {
                icampus.getPost(url, iType, (result) => {
                    callback({
                        data: result
                    })
                })
            }
        }
        else {
            reLoginFailed();
        }
    });
}

const messageRequest = (messageId, callback) => {
    checkLoginElseTryIcampus((result) => {
        if (result) { 
            icampus.getMessage(messageId, (result) => {
                callback({
                    data: result
                })
            })
        }
        else {
            reLoginFailed();
        }
    });
}

const weatherRequest = (callback) => {
    weather.getWeather(0, (result) => {
        callback({
            data: result
        });
    });
}