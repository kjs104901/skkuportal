const { app, BrowserWindow } = require('electron');

const colorSkkuBackground = "#184247";

app.on('ready', () => {
    win = new BrowserWindow({
        width: 1200,
        height: 600,
        frame: false,
        show: false,
        backgroundColor: colorSkkuBackground,
    });

    win.loadFile('./html/login.html');

    win.once('ready-to-show', () => {
        win.show();
        win.webContents.openDevTools();
    })
});