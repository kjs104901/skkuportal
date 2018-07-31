const { remote, ipcRenderer } = require('electron');
const { BrowserWindow } = remote;

const cancleButton = document.querySelector("#cancle-btn");
cancleButton.addEventListener("click", ()=>{
    ipcRenderer.send("consentDisagree", true);
});

const agreeButton = document.querySelector("#agree-btn");
agreeButton.addEventListener("click", ()=>{
    ipcRenderer.send("consentAgree", true);
});