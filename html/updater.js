const { remote, ipcRenderer } = require('electron');
const { BrowserWindow } = remote;

const executor = require('child_process').execFile;

/// header buttons ///
let minButton = document.querySelector("#minimize-button");
let closeButton = document.querySelector("#close-button");

minButton.addEventListener("click", () => {
    let currentBrowser = BrowserWindow.getFocusedWindow();
    currentBrowser.minimize();
});

closeButton.addEventListener("click", () => {
    let currentBrowser = BrowserWindow.getFocusedWindow();
    currentBrowser.close();
});

/// start button ///
let downloading = false;
let downloaded = false;
let installing = false;

let startButton = document.querySelector("#start-button");
let progressBar = document.querySelector("#progress-bar");
let downloadPercent = document.querySelector("#download-percent");

startButton.addEventListener("click", () => {
    if (downloaded) {
        if (installing == false) {
            ipcRenderer.send("installUpdaterReq", true);

            startButton.innerText = "설치 중";
            installing = true;
        }
    }
    else {
        if (downloading === false) {
            ipcRenderer.send("downUpdaterReq", true);

            startButton.innerText = "다운 중";
            downloading = true;
        }
    }
});

ipcRenderer.on("updaterProgress", (event, percent) => {
    progressBar.style.width = (percent * 1) + "%";
    downloadPercent.innerText = (Math.floor(percent * 1)) + "%";
});

ipcRenderer.on("updaterFinished", (event, savepath) => {
    downloadedPath = savepath;
    downloaded = true;
    
    progressBar.style.width = "100%";
    downloadPercent.innerText = "100%";

    startButton.innerText = "설치";
    downloading = false;
});

const releaseNote =  document.querySelector("#releaseNote");
ipcRenderer.send("updateInfoReq", true);
ipcRenderer.on("updateInfoRes", (event, message) => {
    releaseNote.innerHTML = message.data.updateReleaseNotes;
})