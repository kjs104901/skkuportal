const { app, BrowserWindow } = require('electron');

const colorSkkuBackground = "#184247";
const colorSkkuBackgroundDoom = "#3D7178";
const colorSkkuLogo = "#FFD661";

app.on('ready', () => {
    win = new BrowserWindow({
        width: 1200,
        height: 600,
        frame: false,
        show: false,
        resizable: false,
        backgroundColor: colorSkkuBackground,
    });

    win.loadFile('./html/login.html');

    win.once('ready-to-show', () => {
        win.show();
        win.webContents.openDevTools();
    })
});