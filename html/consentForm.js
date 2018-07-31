const { remote, ipcRenderer } = require('electron');
const { BrowserWindow } = remote;

let cancleButton = document.querySelector("#cancle-btn");
cancleButton.addEventListener("click", ()=>{
    ipcRenderer.send("consentDisagree", true);
});

let agreeButton = document.querySelector("#agree-btn");
agreeButton.addEventListener("click", ()=>{
    ipcRenderer.send("consentAgree", true);
});
