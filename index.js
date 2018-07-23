const { app, BrowserWindow, ipcMain } = require('electron');

const icampus = require("./node_my_modules/icampus");

const colorSkkuBackground = "#184247";
const colorSkkuBackgroundDoom = "#3D7178";
const colorSkkuLogo = "#FFD661";

let loginWindow;
let mainWindow;

app.on('ready', () => {
    loginWindow = new BrowserWindow({
        width: 1200,
        height: 600,
        frame: false,
        show: false,
        resizable: false,
        backgroundColor: colorSkkuBackground,
    });

    loginWindow.loadFile('./html/login.html');

    loginWindow.once('ready-to-show', () => {
        loginWindow.show();
        loginWindow.webContents.openDevTools();
    })
});

//// ---- IPC ---- ////
ipcMain.on("loginReq", (event, message) => {
    const timeoutSecond = 10;
    let timeoutSent = false;

    const userId = message.userId;
    const userPass = message.userPass;

    const timeout = setTimeout(() => {
        timeoutSent = true;
        event.sender.send("loginRes", {
            err: "timeOut",
            errMessage: "요청 시간이 초과되었습니다"
        })

    }, timeoutSecond * 1000);

    icampus.loginDirect(userId, userPass, (result) => {
        clearTimeout(timeout);
        if (timeoutSent === false){
            if (result) {
                event.sender.send("loginRes", {
                    data: {
                        success: true
                    }
                })
            }
            else {
                event.sender.send("loginRes", {
                    err: "loingFailed",
                    errMessage: "로그인에 실패했습니다"
                })
            }
        }
    });
});

ipcMain.on("gotoMain", (event, message) => {
    mainWindow = new BrowserWindow({
        width: 1500,
        height: 800,
        frame: false,
        show: false,
        resizable: false,
        backgroundColor: "#FFFFFF",
    });

    loginWindow.close();

    mainWindow.loadFile('./html/temp.html');
    
    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
        mainWindow.webContents.openDevTools();
    })
});