const { remote, ipcRenderer } = require('electron');
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

/// start button ///
let downloading = false;

let startButton = document.querySelector("#start-button");
startButton.addEventListener("click", ()=>{
    if (downloading === false) {
        startButton.innerText = "다운 중";

        ipcRenderer.send("")

        downloading = true;
    }
});