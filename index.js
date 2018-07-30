const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');

const {download} = require('electron-dl');

const icampus = require("./node_my_modules/icampus");
const library = require("./node_my_modules/library");
const gls = require("./node_my_modules/gls");
const smartgls = require("./node_my_modules/smartgls");
const portal = require("./node_my_modules/portal");
const weather = require("./node_my_modules/weather");
const path = require('path')

const { loadSetting, saveSetting } = require("./node_my_modules/util");

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

let glsInstallWindow;
const glsInstallWindowSetting = {
    width: 500, height: 250,
    frame: false,
    show: false,
    resizable: false,
    backgroundColor: "#FFFFFF",
    icon: "./html/icon.ico"
};

//// ------------ Application ------------ ////

process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true';

app.on('ready', () => {
    loginWindowOpen();
});

//// ------------ Windows ------------ ////

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
        
        if (mainWindow) {
            if (!mainWindow.isDestroyed()){
                mainWindow.close();
            }
        }
    })
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
        
        if (loginWindow) {
            if (!loginWindow.isDestroyed()){
                loginWindow.close();
            }
        }
    })
}

const icampusFileDownload = (url, filename, saveFilename) => {
    let fullUrl = "http://www.icampus.ac.kr/FileManager.do?method=downloadOld&pathInfo=";
    fullUrl += url;
    fullUrl += "&fileinfo=01|"+filename+"|"+saveFilename+"|0";

    dialog.showSaveDialog({
        title: "Download file",
        defaultPath: filename
    },(filepath)=>{
        if (filepath){
            let saveFilepath = filepath;
            if (! path.extname(filepath)) {
                saveFilepath += path.extname(filename);
            }
            
            download(BrowserWindow.getFocusedWindow(), fullUrl, {
                saveAs: false,
                directory: path.dirname(saveFilepath),
                filename: path.basename(saveFilepath)
            })
            .catch();
        }
    })
}

const installGLSOpen = () => {
    if (glsInstallWindow) {
        if (!glsInstallWindow.isDestroyed()){
            glsInstallWindow.close();
        }
    }
    glsInstallWindow = new BrowserWindow(glsInstallWindowSetting);
    glsInstallWindow.loadFile('./html/glsInstall.html');

    glsInstallWindow.once('ready-to-show', () => {
        glsInstallWindow.show();
    })
}

const installGLSClose = () => {
    if (glsInstallWindow) {
        if (!glsInstallWindow.isDestroyed()){
            glsInstallWindow.close();
        }
    }
}

const glsDownloadStart = (callback) =>{
    const glsInstallURL = "https://admin.skku.edu/co/jsp/installer/MiPlatformInstallEngine320U_SKKU.exe";
    if (glsInstallWindow) {
        if (!glsInstallWindow.isDestroyed()){
            download(glsInstallWindow, glsInstallURL, {
                onProgress: (percent) => {
                    if (glsInstallWindow) {
                        if (!glsInstallWindow.isDestroyed()){
                            glsInstallWindow.webContents.send('glsProgress', percent);
                        }
                    }
                }
            })
            .then((dl) => {
                if (glsInstallWindow) {
                    if (!glsInstallWindow.isDestroyed()){
                        glsInstallWindow.webContents.send('glsFinished', dl.getSavePath());
                    }
                }
            })
            .catch(()=>{
                callback({
                    err: "downloadFailed",
                    errMessage: "다운로드 실패"
                })
            })
        }
    }
}

//// ------------ User Info ------------ ////
let userId = "";
let userPass = "";

let userName = "";
let userDepartment = "";

let userCampusType = 0; // 0:seoul 1:suwon

//// ------------ Timeout ------------ ////

const reserveTimeoutSend = (sender, messageType, timeoutSecond, callback) => {
    const timeout = setTimeout(() => {
        timeoutSent = true;
        if (!sender.isDestroyed()) {
            sender.send(messageType, {
                err: "timeOut",
                errMessage: "요청 시간이 초과되었습니다"
            })
        }
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

const checkLoginElseTrySmart = (callback) => {
    smartgls.loginCheck((result) => {
        if (result == true) {
            callback(true);
        }
        else {
            smartgls.login(userId, userPass, (result) => {
                if (result) {
                    callback(true);
                }
                else {
                    callback(false);
                }
            })
        }
    })
}

//// ------------ IPC frontend ------------ ////
////// for action
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

ipcMain.on("openIcampusGateReq", (event, message) => {
    openIcampusGate((result)=>{
        event.sender.send("openIcampusGateRes", result);
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

ipcMain.on("icampusFileDownload", (event, message) => {
    icampusFileDownload(message.url, message.name, message.saveName);
});

ipcMain.on("glsDownloadStartReq", (event, message) => {
    glsDownloadStart((result)=>{
            event.sender.send("glsDownloadStartRes", result);
    });
})

ipcMain.on("glsInstallFinished", (event, message) => {
    installGLSClose();
});

////// for information
// icampus
ipcMain.on("studentInfoReq", (event, message) => {
    event.sender.send("studentInfoRes", {
        data: {
            name: userName,
            department: userDepartment
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

// gls
ipcMain.on("scoreListReq", (event, message) => {
    let timeoutSent = false;
    const timeout = reserveTimeoutSend(event.sender, "scoreListRes", 10, () => {
        timeoutSent = true;
    });

    scoreListRequest((result) => {
        clearTimeout(timeout);
        if (timeoutSent === false) {
            event.sender.send("scoreListRes", result);
        }
    })
});

ipcMain.on("scoreReq", (event, message) => {
    let timeoutSent = false;
    const timeout = reserveTimeoutSend(event.sender, "scoreRes", 10, () => {
        timeoutSent = true;
    });

    scoreRequest(message.year, message.semester, (result) => {
        clearTimeout(timeout);
        if (timeoutSent === false) {
            event.sender.send("scoreRes", result);
        }
    })
});

// weather
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
////// for action
const loginReqest = (userId, userPass, callback) => {
    portal.login(userId, userPass, (result) => {
        if (result) {
            userName = portal.getName();
            userDepartment = portal.getDepartment();
        }
    });
    
    library.loginDirect(userId, userPass, (result) => {
        if (result) {
            if (!loadSetting("campus_type")) {
                userCampusType = library.getCampusType();
                saveSetting("campus_type", userCampusType);
            }
        }
    })

    if (loadSetting("campus_type")) {
        userCampusType = loadSetting("campus_type");
    }

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
    const isInstalled = gls.checkInstalled();
    if (isInstalled){
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
    else {
        callback({
            err: "glsNotInstalled",
            errMessage: "GLS가 설치되어 있지 않습니다"
        })

        installGLSOpen();
    }
}

const openIcampusGate = (callback) => {
    checkLoginElseTryPortal((result) => {
        if (result) {
            portal.gateIcampus(true, (result) => {
                if (result) {
                    shell.openExternal(portal.getGateIcampus(), {}, (error) => {
                        if (error) {
                            callback({
                                err: "openGateFailed",
                                errMessage: "Gate 실행 실패"
                            });
                        }
                    });
                }
                else {
                    callback({
                        err: "gateFailed",
                        errMessage: "통합 로그인 실패"
                    });
                }
            });
        }
        else {
            reLoginFailed();
        }
    });
}

////// for information
// icampus
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

// gls
const scoreListRequest = (callback) => {
    checkLoginElseTrySmart((result) => {
        if (result) {
            smartgls.getScores((result) => {
                callback({
                    data: result
                });
            })
        }
        else {
            reLoginFailed();
        }
    })
}

const scoreRequest = (year, semester, callback) => {
    checkLoginElseTrySmart((result) => {
        if (result) {
            smartgls.getScoreDetail(year, semester, (result) => {
                callback({
                    data: result
                });
            })
        }
        else {
            reLoginFailed();
        }
    })
}
// weather
const weatherRequest = (callback) => {
    weather.getWeather(userCampusType, (result) => {
        callback({
            data: result,
            campusType: userCampusType
        });
    });
}