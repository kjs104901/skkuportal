const { remote } = require('electron');
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
