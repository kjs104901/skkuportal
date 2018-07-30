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
let downloadedPath = "";
let installing = false;

let startButton = document.querySelector("#start-button");
let progressBar = document.querySelector("#progress-bar");
let downloadPercent = document.querySelector("#download-percent");

startButton.addEventListener("click", () => {
    if (downloaded) {
        if (installing == false) {
            executor(downloadedPath, [], (err, data) => {
                if (err) {
                    $('body').pgNotification({
                        style: "circle",
                        timeout: 2000,
                        message: "설치 실패",
                        type: "danger"
                    }).show();

                    startButton.innerText = "설치";
                    installing = false;
                }
                else {
                    ipcRenderer.send("glsInstallFinished", true);
                }
            });

            startButton.innerText = "설치 중";
            installing = true;
        }
    }
    else {
        if (downloading === false) {
            ipcRenderer.send("glsDownloadStartReq", true);

            startButton.innerText = "다운 중";
            downloading = true;
        }
    }
});

ipcRenderer.on("glsDownloadStartRes", (event, message) => {
    if (message.err) {
        $('body').pgNotification({
            style: "circle",
            timeout: 2000,
            message: message.errMessage,
            type: "danger"
        }).show();

        startButton.innerText = "다운로드";
        downloading = false;
    }
});

ipcRenderer.on("glsProgress", (event, percent) => {
    progressBar.style.width = (percent * 100) + "%";
    downloadPercent.innerText = (Math.floor(percent * 100)) + "%";
});

ipcRenderer.on("glsFinished", (event, savepath) => {
    downloadedPath = savepath;
    downloaded = true;

    startButton.innerText = "설치";
    downloading = false;
});