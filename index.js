const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const { autoUpdater } = require('electron-updater')
const { download } = require('electron-dl');

const icampus = require("./node_my_modules/icampus");
const library = require("./node_my_modules/library");
const gls = require("./node_my_modules/gls");
const smartgls = require("./node_my_modules/smartgls");
const portal = require("./node_my_modules/portal");
const weather = require("./node_my_modules/weather");
const mail = require("./node_my_modules/mail");
const notice = require("./node_my_modules/notice");
const meal = require("./node_my_modules/meal");
const transportation = require("./node_my_modules/transportation");
const calendar = require("./node_my_modules/calendar");

const path = require('path')

const { loadSetting, saveSetting } = require("./node_my_modules/util");

const colorSkkuBackground = "#1B484F";
const colorSkkuBackgroundDoom = "#3D7178";
const colorSkkuBackgroundDeep = "#1C414A";
const colorSkkuLogo = "#FFD661";

//// ------------ Development ------------ ////

const isDevelopment = false;

//// ------------ Windows ------------ ////
let loginWindow;
let loginWindowSetting = {
    width: 500, height: 600,
    frame: false,
    show: false,
    resizable: false,
    backgroundColor: colorSkkuBackground,
    icon: "./html/icon.ico"
};

let mainWindow;
let mainWindowSetting = {
    width: 840, height: 630,
    frame: false,
    show: false,
    resizable: false,
    backgroundColor: "#F0F0F0",
    icon: "./html/icon.ico"
};

let glsInstallWindow;
let glsInstallWindowSetting = {
    width: 500, height: 250,
    frame: false,
    show: false,
    resizable: false,
    backgroundColor: "#FFFFFF",
    icon: "./html/icon.ico"
};

let updaterWindow;
let updaterWindowSetting = {
    width: 500, height: 410,
    frame: false,
    show: false,
    resizable: false,
    backgroundColor: "#FFFFFF",
    icon: "./html/icon.ico"
}

let consentWindow;
const consentWindowSetting = {
    width: 600, height: 430,
    frame: true,
    autoHideMenuBar: true,
    show: false,
    resizable: false,
    backgroundColor: "#FFFFFF",
    icon: "./html/icon.ico"
}

//// ------------ Application ------------ ////

process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true';

// single instance
var shouldQuit = app.makeSingleInstance(function (commandLine, workingDirectory) {
    let windowCount = 0;
    if (loginWindow) {
        if (!loginWindow.isDestroyed()) {
            windowCount += 1;

            if (loginWindow.isMinimized()) loginWindow.restore();
            loginWindow.focus();
        }
    }
    if (mainWindow) {
        if (!mainWindow.isDestroyed()) {
            windowCount += 1;

            if (mainWindow.isMinimized()) mainWindow.restore();
            mainWindow.focus();
        }
    }
    if (windowCount === 0) {
        loginWindowOpen();
    }
});

if (shouldQuit) {
    app.quit();
    return;
}

app.on('ready', () => {
    const isConsented = loadSetting("consent");
    if (isConsented) {
        loginWindowOpen();
    }
    else {
        consentWindowOpen();
    }

    autoUpdater.autoDownload = false;
    autoUpdater.checkForUpdates();
});

app.on('window-all-closed', () => {
    loginWindow = null;
    mainWindow = null;
    glsInstallWindow = null;
    updaterWindow = null;
    consentWindow = null;
    app.quit();
})

//// ------------ updater ------------ ////

const packageJson = require('./package.json');
const currentVersion = packageJson.version;

let updateVersion = "";
let updateLoading = true;

let updateError = false;
let updateAvailable = false;

let updateReleaseNotes = "";

autoUpdater.on('checking-for-update', () => { });

autoUpdater.on('update-available', (info) => {
    updateLoading = false;
    updateAvailable = true;
    updateVersion = info.version;
    updateReleaseNotes = info.releaseNotes;
});

autoUpdater.on('update-not-available', (info) => {
    updateLoading = false;
    updateAvailable = false;
    updateVersion = info.version;
});

autoUpdater.on('error', (err) => {
    updateLoading = false;
    updateError = true;
});

autoUpdater.on('download-progress', (progressObj) => {
    if (updaterWindow) {
        if (!updaterWindow.isDestroyed()) {
            updaterWindow.webContents.send('updaterProgress', progressObj.percent);
        }
    }
});

autoUpdater.on('update-downloaded', (info) => {
    if (updaterWindow) {
        if (!updaterWindow.isDestroyed()) {
            updaterWindow.webContents.send('updaterFinished', true);
        }
    }
})

//// ------------ Windows ------------ ////

const loginWindowOpen = () => {
    if (loginWindow) {
        if (!loginWindow.isDestroyed()) {
            loginWindow.close();
        }
    }
    if (isDevelopment) {
        loginWindowSetting.width = 1200;
        loginWindowSetting.height = 600;
    }

    loginWindow = new BrowserWindow(loginWindowSetting);
    loginWindow.loadFile('./html/login.html');

    loginWindow.once('ready-to-show', () => {
        loginWindow.show();
        if (isDevelopment) {
            loginWindow.webContents.openDevTools();
        }

        if (mainWindow) {
            if (!mainWindow.isDestroyed()) {
                mainWindow.close();
            }
        }
        if (consentWindow) {
            if (!consentWindow.isDestroyed()) {
                consentWindow.close();
            }
        }
    })
}

const mainWindowOpen = () => {
    if (mainWindow) {
        if (!mainWindow.isDestroyed()) {
            mainWindow.close();
        }
    }
    if (isDevelopment) {
        mainWindowSetting.width = 1600;
        mainWindowSetting.height = 630;
    }
    mainWindow = new BrowserWindow(mainWindowSetting);
    mainWindow.loadFile('./html/main.html');

    mainWindow.once('ready-to-show', () => {
        setTimeout(() => {
            mainWindow.show();
        }, 500);

        if (isDevelopment) {
            loginWindowSetting.width = 1200;
            loginWindowSetting.height = 600;
            mainWindow.webContents.openDevTools();
        }

        if (loginWindow) {
            if (!loginWindow.isDestroyed()) {
                loginWindow.close();
            }
        }
    })
}

const updaterWindowOpen = () => {
    if (updaterWindow) {
        if (!updaterWindow.isDestroyed()) {
            updaterWindow.close();
        }
    }
    updaterWindow = new BrowserWindow(updaterWindowSetting);
    updaterWindow.loadFile('./html/updater.html');

    updaterWindow.once('ready-to-show', () => {

        updaterWindow.show();
    })
}

const consentWindowOpen = () => {
    if (consentWindow) {
        if (!consentWindow.isDestroyed()) {
            consentWindow.close();
        }
    }
    consentWindow = new BrowserWindow(consentWindowSetting);
    consentWindow.loadFile('./html/consentForm.html');
    consentWindow.setMenu(null);

    consentWindow.once('ready-to-show', () => {
        consentWindow.show();
    })
}

const closeAllWindows = () => {
    if (consentWindow) {
        if (!consentWindow.isDestroyed()) {
            consentWindow.close();
        }
    }
    if (updaterWindow) {
        if (!updaterWindow.isDestroyed()) {
            updaterWindow.close();
        }
    }
    if (mainWindow) {
        if (!mainWindow.isDestroyed()) {
            mainWindow.close();
        }
    }
    if (loginWindow) {
        if (!loginWindow.isDestroyed()) {
            loginWindow.close();
        }
    }
    if (glsInstallWindow) {
        if (!glsInstallWindow.isDestroyed()) {
            glsInstallWindow.close();
        }
    }
}

const icampusFileDownload = (url, filename, saveFilename) => {
    let fullUrl = "http://www.icampus.ac.kr/FileManager.do?method=downloadOld&pathInfo=";
    fullUrl += url;
    fullUrl += "&fileinfo=01|" + filename + "|" + saveFilename + "|0";

    dialog.showSaveDialog({
        title: "Download file",
        defaultPath: filename
    }, (filepath) => {
        if (filepath) {
            let saveFilepath = filepath;
            if (!path.extname(filepath)) {
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

const fileDownload = (url, filename) => {
    dialog.showSaveDialog({
        title: "Download file",
        defaultPath: filename
    }, (filepath) => {
        if (filepath) {
            let saveFilepath = filepath;
            if (!path.extname(filepath)) {
                saveFilepath += path.extname(filename);
            }

            download(BrowserWindow.getFocusedWindow(), url, {
                saveAs: false,
                directory: path.dirname(saveFilepath),
                filename: path.basename(saveFilepath)
            })
                .catch();
        }
    })
}

const mailFileDownloadRequest = (mailIndex, attachIndex, filename) => {
    dialog.showSaveDialog({
        title: "Download file",
        defaultPath: filename
    }, (filepath) => {
        if (filepath) {
            let saveFilepath = filepath;
            if (!path.extname(filepath)) {
                saveFilepath += path.extname(filename);
            }

            mail.attachmentDownload(mailIndex, attachIndex, saveFilepath);
        }
    })
}

const installGLSOpen = () => {
    if (glsInstallWindow) {
        if (!glsInstallWindow.isDestroyed()) {
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
        if (!glsInstallWindow.isDestroyed()) {
            glsInstallWindow.close();
        }
    }
}

const glsDownloadStart = (callback) => {
    const glsInstallURL = "https://admin.skku.edu/co/jsp/installer/MiPlatformInstallEngine320U_SKKU.exe";
    if (glsInstallWindow) {
        if (!glsInstallWindow.isDestroyed()) {
            download(glsInstallWindow, glsInstallURL, {
                onProgress: (percent) => {
                    if (glsInstallWindow) {
                        if (!glsInstallWindow.isDestroyed()) {
                            glsInstallWindow.webContents.send('glsProgress', percent);
                        }
                    }
                }
            })
                .then((dl) => {
                    if (glsInstallWindow) {
                        if (!glsInstallWindow.isDestroyed()) {
                            glsInstallWindow.webContents.send('glsFinished', dl.getSavePath());
                        }
                    }
                })
                .catch(() => {
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
let userUniversity = "";
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

const checkLoginElseTryLibrary = (callback) => {
    library.loginCheck((result) => {
        if (result == true) {
            callback(true);
        }
        else {
            library.loginDirect(userId, userPass, (result) => {
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
////// for action
//login
ipcMain.on("loginReq", (event, message) => {
    userId = message.userId;
    userPass = message.userPass;

    let timeoutSent = false;
    const timeout = reserveTimeoutSend(event.sender, "loginRes", 10, () => {
        timeoutSent = true;
    })

    loginReqest(userId, userPass, (result) => {
        clearTimeout(timeout);
        if (timeoutSent === false) {
            event.sender.send("loginRes", result);
        }
    });
});

ipcMain.on("logoutReq", (event, message) => {
    saveSetting("auto_login", false);
    saveSetting("user_pass", "");
    loginWindowOpen();
});

ipcMain.on("gotoMain", (event, message) => {
    mainWindowOpen();
});

//gate
ipcMain.on("openIcampusGateReq", (event, message) => {
    openIcampusGate((result) => {
        event.sender.send("openIcampusGateRes", result);
    });
});

ipcMain.on("openWebMailReq", (event, message) => {
    openWebMailRequest((result) => {
        event.sender.send("openWebMailRes", result);
    });
});

ipcMain.on("openLibraryReq", (event, message) => {
    openLibraryRequest((result) => {
        event.sender.send("openLibraryRes", result);
    });
})

//consent
ipcMain.on("consentAgree", (event, message) => {
    saveSetting("consent", true);
    saveSetting("consentDate", new Date());

    if (mainWindow) {
        if (!mainWindow.isDestroyed()) {
            if (consentWindow) {
                if (!consentWindow.isDestroyed()) {
                    consentWindow.close();
                }
            }
        }
        else {
            loginWindowOpen();
        }
    }
    else {
        loginWindowOpen();
    }
});

ipcMain.on("consentDisagree", (event, message) => {
    saveSetting("consent", false);
    closeAllWindows();
});

ipcMain.on("consentDateReq", (event, message) => {
    event.sender.send("consentDateRes", {
        data: {
            consentDate: loadSetting("consentDate")
        }
    });
});

ipcMain.on("consentShow", (event, message) => {
    consentWindowOpen();
});

// updater
ipcMain.on("updateInfoReq", (event, message) => {
    event.sender.send("updateInfoRes", {
        data: {
            currentVersion: currentVersion,
            updateVersion: updateVersion,
            updateLoading: updateLoading,
            updateError: updateError,
            updateAvailable: updateAvailable,
            updateReleaseNotes: updateReleaseNotes
        }
    });
});

ipcMain.on("openUpdaterReq", (event, message) => {
    updaterWindowOpen();
});

ipcMain.on("downUpdaterReq", (event, message) => {
    autoUpdater.downloadUpdate();
});

ipcMain.on("installUpdaterReq", (event, message) => {
    autoUpdater.quitAndInstall();
});

// file donwload
ipcMain.on("icampusFileDownload", (event, message) => {
    icampusFileDownload(message.url, message.name, message.saveName);
});

ipcMain.on("fileDownload", (event, message) => {
    fileDownload(message.url, message.name)
});

ipcMain.on("mailFileDownloadReq", (event, message) => {
    mailFileDownloadRequest(message.mailIndex, message.attachIndex, message.filename);
});

// setting
ipcMain.on("settingCampusType", (event, message) => {
    userCampusType = message;
    saveSetting("campus_type", userCampusType);
});

// etc
ipcMain.on("clearCacheReq", (event, message) => {
    icampus.clearGatePath();
    mail.clearGatePath();
    library.clearGatePath();

    mail.clearMailbox();
    saveSetting("campus_type", null);
});

ipcMain.on("openGLSReq", (event, message) => {
    let timeoutSent = false;
    const timeout = reserveTimeoutSend(event.sender, "openGLSRes", 10, () => {
        timeoutSent = true;
    });

    openGLSRequest((result) => {
        clearTimeout(timeout);
        if (timeoutSent === false) {
            event.sender.send("openGLSRes", result);
        }
    });
});

ipcMain.on("glsDownloadStartReq", (event, message) => {
    glsDownloadStart((result) => {
        event.sender.send("glsDownloadStartRes", result);
    });
})

ipcMain.on("glsInstallFinished", (event, message) => {
    installGLSClose();
});

ipcMain.on("openUnivNoticeRequest", (event, message) => {
    const univNoticeURL = notice.getUniversityNoticeURL(userUniversity);

    shell.openExternal(univNoticeURL);
});

////// for information
// icampus
ipcMain.on("studentInfoReq", (event, message) => {
    event.sender.send("studentInfoRes", {
        data: {
            name: userName,
            userUniversity: userUniversity,
            department: userDepartment,
            campusType: userCampusType
        }
    });
});

ipcMain.on("semesterListGLSReq", (event, message) => {
    let timeoutSent = false;
    const timeout = reserveTimeoutSend(event.sender, "semesterListGLSRes", 10, () => {
        timeoutSent = true;
    });

    semesterListGLSRequest((result) => {
        clearTimeout(timeout);
        if (timeoutSent === false) {
            event.sender.send("semesterListGLSRes", result);
        }
    });
})

ipcMain.on("classListReq", (event, message) => {
    let timeoutSent = false;
    const timeout = reserveTimeoutSend(event.sender, "classListRes", 10, () => {
        timeoutSent = true;
    });

    classListRequest(message.year, message.semester, (result) => {
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

ipcMain.on("semesterListReq", (event, message) => {
    let timeoutSent = false;
    const timeout = reserveTimeoutSend(event.sender, "semesterListRes", 10, () => {
        timeoutSent = true;
    });

    semesterListRequest((result) => {
        clearTimeout(timeout);
        if (timeoutSent === false) {
            event.sender.send("semesterListRes", result);
        }
    });
});

ipcMain.on("searchClassReq", (event, message) => {
    let timeoutSent = false;
    const timeout = reserveTimeoutSend(event.sender, "searchClassRes", 20, () => {
        timeoutSent = true;
    });

    searchClassRequest(
        message.campusType,
        message.searchType,
        message.searchStr,
        message.year,
        message.semester,
         (result) => {
        clearTimeout(timeout);
        if (timeoutSent === false) {
            event.sender.send("searchClassRes", result);
        }
    });
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

// notice
ipcMain.on("noticeListReq", (event, message) => {
    let timeoutSent = false;
    const timeout = reserveTimeoutSend(event.sender, "noticeListRes", 10, () => {
        timeoutSent = true;
    });

    noticeListRequest(message.type, message.offset, (result) => {
        clearTimeout(timeout);
        if (timeoutSent === false) {
            event.sender.send("noticeListRes", result);
        }
    });
});

ipcMain.on("noticeReq", (event, message) => {
    let timeoutSent = false;
    const timeout = reserveTimeoutSend(event.sender, "noticeRes", 10, () => {
        timeoutSent = true;
    });

    noticeRequest(message.type, message.url, (result) => {
        clearTimeout(timeout);
        if (timeoutSent === false) {
            event.sender.send("noticeRes", result);
        }
    });
});

// mail
let mailList = [];
ipcMain.on("mailTotalReq", (event, message) => {
    let timeoutSent = false;
    const timeout = reserveTimeoutSend(event.sender, "mailTotalRes", 10, () => {
        timeoutSent = true;
    });

    mailTotalRequest((result) => {
        clearTimeout(timeout);
        if (timeoutSent === false) {
            event.sender.send("mailTotalRes", result);
        }
    });

    let mailRepeatID = setInterval(mailRepeat, 100)
    function mailRepeat() {
        if (0 <= mail.getTotalNumber()) {
            mailList = [];
            if (mail.getTotalNumber() <= mail.getCurrentNumber() || !mail.checkProcessing()) {
                for (let index = 1; index <= mail.getTotalNumber(); index++) {
                    mailList[index - 1] = mail.getEmail(index);
                }
                event.sender.send("mail", {
                    data: mailList
                });

                clearInterval(mailRepeatID);
            }
        }
    }
});


// library
ipcMain.on("libraryListReq", (event, message) => {
    let timeoutSent = false;
    const timeout = reserveTimeoutSend(event.sender, "libraryListRes", 10, () => {
        timeoutSent = true;
    });

    libraryListRequest((result) => {
        clearTimeout(timeout);
        if (timeoutSent === false) {
            event.sender.send("libraryListRes", result);
        }
    });
});

ipcMain.on("seatListReq", (event, message) => {
    let timeoutSent = false;
    const timeout = reserveTimeoutSend(event.sender, "seatListRes", 10, () => {
        timeoutSent = true;
    });

    seatListRequest(message.campusType, (result) => {
        clearTimeout(timeout);
        if (timeoutSent === false) {
            event.sender.send("seatListRes", result);
        }
    });
});

// meal
ipcMain.on("resturantReq", (event, message) => {
    let timeoutSent = false;
    const timeout = reserveTimeoutSend(event.sender, "resturantRes", 10, () => {
        timeoutSent = true;
    });

    resturantRequest((result) => {
        clearTimeout(timeout);
        if (timeoutSent === false) {
            event.sender.send("resturantRes", result);
        }
    });
})

ipcMain.on("mealListReq", (event, message) => {
    let timeoutSent = false;
    const timeout = reserveTimeoutSend(event.sender, "mealListRes", 10, () => {
        timeoutSent = true;
    });

    mealListRequest(message.resturant, message.category, message.year, message.month, message.day, (result) => {
        clearTimeout(timeout);
        if (timeoutSent === false) {
            event.sender.send("mealListRes", result);
        }
    });
})

// transportation
ipcMain.on("suttleReq", (event, message) => {
    let timeoutSent = false;
    const timeout = reserveTimeoutSend(event.sender, "suttleRes", 10, () => {
        timeoutSent = true;
    });

    suttleRequest(message.route, (result) => {
        clearTimeout(timeout);
        if (timeoutSent === false) {
            event.sender.send("suttleRes", result);
        }
    });
})

ipcMain.on("suttleInfoReq", (event, message) => {
    let timeoutSent = false;
    const timeout = reserveTimeoutSend(event.sender, "suttleInfoRes", 10, () => {
        timeoutSent = true;
    });

    suttleInfoRequest((result) => {
        clearTimeout(timeout);
        if (timeoutSent === false) {
            event.sender.send("suttleInfoRes", result);
        }
    });
})

ipcMain.on("busReq", (event, message) => {
    let timeoutSent = false;
    const timeout = reserveTimeoutSend(event.sender, "busRes", 10, () => {
        timeoutSent = true;
    });

    busRequest(message.type, (result) => {
        clearTimeout(timeout);
        if (timeoutSent === false) {
            event.sender.send("busRes", result);
        }
    });
})

ipcMain.on("subwayReq", (event, message) => {
    let timeoutSent = false;
    const timeout = reserveTimeoutSend(event.sender, "subwayRes", 10, () => {
        timeoutSent = true;
    });

    subwayRequest(message.campusType, message.direction, (result) => {
        clearTimeout(timeout);
        if (timeoutSent === false) {
            event.sender.send("subwayRes", result);
        }
    });
})

// calendar
ipcMain.on("calendarReq", (event, message) => {
    let timeoutSent = false;
    const timeout = reserveTimeoutSend(event.sender, "calendarRes", 10, () => {
        timeoutSent = true;
    });

    calendarRequest(message.calendar, message.year, message.month, (result) => {
        clearTimeout(timeout);
        if (timeoutSent === false) {
            event.sender.send("calendarRes", result);
        }
    });
})

ipcMain.on("todayCalendarReq", (event, message) => {
    let timeoutSent = false;
    const timeout = reserveTimeoutSend(event.sender, "todayCalendarRes", 10, () => {
        timeoutSent = true;
    });

    todayCalendarRequest((result) => {
        clearTimeout(timeout);
        if (timeoutSent === false) {
            event.sender.send("todayCalendarRes", result);
        }
    });
})

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
            userUniversity = library.getUniversity();
            if (!loadSetting("campus_type")) {
                userCampusType = library.getCampusType();
                saveSetting("campus_type", userCampusType);
            }
        }
    })

    if (loadSetting("campus_type")) {
        userCampusType = loadSetting("campus_type");
    }

    mail.init();

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
    if (isInstalled) {
        checkLoginElseTryPortal((result) => {
            if (result) {
                portal.getGlobalVal((globalVal) => {
                    if (0 < globalVal.length) {
                        gls.setGlobalVal(globalVal, (result) => {
                            if (result == true) {
                                gls.setImage();
                                gls.executeGLS((result) => { });

                                callback({
                                    data: {
                                        success: true
                                    }
                                })
                            }
                            else ({
                                err: "regFailed",
                                errMessage: "레지스트리 수정 불가"
                            })
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

//gate
const openIcampusGate = (callback) => {
    checkLoginElseTryPortal((result) => {
        if (result) {
            portal.getGate((result) => {
                if (result) {
                    icampus.setGate(result);
                    shell.openExternal(icampus.getGatePath(), {}, (error) => {
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

const openWebMailRequest = (callback) => {
    portal.getGate((result) => {
        if (result) {
            mail.setGate(result);
            shell.openExternal(mail.getGatePath(), {}, (error) => {
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

const openLibraryRequest = (callback) => {
    portal.getGate((result) => {
        if (result) {
            library.setGate(result);
            shell.openExternal(library.getGatePath(), {}, (error) => {
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

////// for information
// icampus
const semesterListRequest = (callback) => {
    checkLoginElseTryIcampus((result) => {
        if (result) {
            callback({
                data: icampus.getSemesterList()
            });
        }
        else {
            reLoginFailed();
        }
    });
}

const classListRequest = (year, semester, callback) => {
    checkLoginElseTryIcampus((result) => {
        if (result) {
            icampus.getClassList(year, semester, (result) => {
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
            icampus.getPostList(identity, icampus.NOTICE, (result) => {
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

const semesterListGLSRequest = (callback) => {
    checkLoginElseTrySmart((result) => {
        if (result) {
            smartgls.getSemesterList((result) => {
                callback({
                    data: result
                });
            });
        }
        else {
            reLoginFailed();
        }
    })
}

const searchClassRequest = (campusType, searchType, searchStr, year, semester, callback) => {
    checkLoginElseTrySmart((result) => {
        if (result) {
            smartgls.searchClass(campusType, searchType, searchStr, year, semester, (result) => {
                callback({
                    data: result
                });
            });
        }
        else {
            reLoginFailed();
        }
    })
}

// weather
const weatherRequest = (callback) => {
    weather.getWeather(userCampusType, (result) => {
        if (result.weather.length === 0) {
            callback({
                err: "WeatherFailed",
                errMessage: "날씨 정보 불러오기 실패"
            });
        }
        else {
            callback({
                data: result,
                campusType: userCampusType
            });
        }
    });
}

// notice
const noticeListRequest = (type, offset, callback) => {
    if (type === 9) {
        notice.getDomNoticeList(0, offset, (result) => {
            callback({
                data: result
            });
        })
    }
    else if (type === 10) {
        notice.getDomNoticeList(1, offset, (result) => {
            callback({
                data: result
            });
        })
    }
    else {
        notice.getNoticeList(type, offset, (result) => {
            callback({
                data: result
            });
        })
    }
}

const noticeRequest = (type, url, callback) => {
    if (9 <= type) {
        notice.getDomNotice(url, (result) => {
            callback({
                data: result
            })
        })
    }
    else {
        notice.getNotice(url, (result) => {
            callback({
                data: result
            })
        })
    }
}

// mail
const mailTotalRequest = (callback) => {
    if (!mail.checkProcessing()) {
        mail.retreiveStart(userId, userPass, (result) => {
            callback({
                err: result,
                errMessage: "메일 서버 통신 실패" + result
            })
        })
    }

    let intervalID = setInterval(getTotalNumberRepeat, 100);

    function getTotalNumberRepeat() {
        if (0 <= mail.getTotalNumber()) {
            callback({
                data: mail.getTotalNumber()
            });
            clearInterval(intervalID);
        }
    }
}

// library
const libraryListRequest = (callback) => {
    let chargeList = [];
    let overDueList = [];
    let holdList = [];
    let loadCount = 0;
    let intvCount = 0;

    checkLoginElseTryLibrary((result) => {
        if (result) {
            library.getCharge((result) => {
                loadCount += 1;
                if (0 < result.length) {
                    chargeList = result;
                }
            })
            library.getOverDue((result) => {
                loadCount += 1;
                if (0 < result.length) {
                    overDueList = result;
                }
            })
            library.getHold((result) => {
                loadCount += 1;
                if (0 < result.length) {
                    holdList = result;
                }
            })
        }
        else {
            reLoginFailed();
        }
    })

    let intv = setInterval(() => {
        intvCount += 1;
        if (3 <= loadCount) {
            clearInterval(intv);

            callback({
                data: {
                    chargeList: chargeList,
                    overDueList: overDueList,
                    holdList: holdList
                }
            });
        }
        if (10 < intvCount) {
            clearInterval(intv);
        }
    }, 1000)
}

const seatListRequest = (campusType, callback) => {
    library.getSeats(campusType, (result) => {
        callback({
            data: result
        })
    })
}

// meal
const resturantRequest = (callback) => {
    const restaurantList = meal.getRestaurantList();
    const currentCategory = meal.getCurrentCategory();
    let initialResturant = 0
    if (userCampusType === 1) {
        initialResturant = 5
    }

    callback({
        data: {
            initialResturant: initialResturant,
            currentCategory: currentCategory,
            restaurantList: restaurantList,
        }
    })
}

const mealListRequest = (resturant, category, year, month, day, callback) => {
    meal.getMealList(resturant, category, year, month, day, (result) => {
        callback({
            data: result
        })
    })
}

// transportation
const suttleRequest = (route, callback) => {
    transportation.getSuttle(route, (result) => {
        callback({
            data: result
        });
    })
}

const suttleInfoRequest = (callback) => {
    transportation.getSuttleInfo((result) => {
        callback({
            data: result
        });
    });
}

const busRequest = (type, callback) => {
    let busList = [];
    let loadCount = 0;
    let loadCountMax = 1;
    let intvCount = 0;

    if (type === 1 || type === 2) {
        loadCountMax = 2;
    }

    if (type === 1) {
        transportation.getBus(2, (result) => {
            loadCount += 1;
            busList.push(result)
        })
        transportation.getBus(4, (result) => {
            loadCount += 1;
            busList.push(result)
        })
    }
    if (type === 2) {
        transportation.getBus(1, (result) => {
            loadCount += 1;
            busList.push(result)
        })
        transportation.getBus(3, (result) => {
            loadCount += 1;
            busList.push(result)
        })
    }
    if (type === 3) {
        transportation.getBus(6, (result) => {
            loadCount += 1;
            busList.push(result)
        })
    }
    if (type === 4) {
        transportation.getBus(5, (result) => {
            loadCount += 1;
            busList.push(result)
        })
    }

    let intv = setInterval(() => {
        intvCount += 1;
        if (loadCountMax <= loadCount) {
            clearInterval(intv);

            callback({
                data: busList
            });
        }
        if (10 < intvCount) {
            clearInterval(intv);
        }
    }, 1000)
}

const subwayRequest = (campusType, direction, callback) => {
    transportation.getSubway(campusType, direction, (result) => {
        callback({
            data: result
        })
    })
}

// calendar
const calendarRequest = (calendarIndex, year, month, callback) => {
    if (calendarIndex === 0) {
        calendar.getCalendar(year, month, (result) => {
            callback({
                data: result
            });
        });
    }
    else if (calendarIndex === 1) {
        calendar.getDomCalendar(0, year, month, (result) => {
            callback({
                data: result
            });
        });
    }
    else if (calendarIndex === 2) {
        calendar.getDomCalendar(1, year, month, (result) => {
            callback({
                data: result
            });
        });
    }
}

const todayCalendarRequest = (callback) => {
    calendar.getTodayCalendar((result) => {
        callback({
            data: result
        });
    });
}