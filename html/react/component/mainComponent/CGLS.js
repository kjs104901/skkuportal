import React from 'react';

export default class CGLS extends React.Component {
    render() {
        return (
            <button onClick={openGLSRequest}>GLS 실행</button>
        )
    }
}

const { ipcRenderer } = require('electron');

const openGLSRequest = () => {
    ipcRenderer.send("openGLSReq", true);
}