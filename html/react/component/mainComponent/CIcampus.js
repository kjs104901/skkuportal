import React from 'react';

const { ipcRenderer } = require('electron');

export default class CIcampus extends React.Component {
    state = {
        classListLoaded: false,
        classList: []
    }

    componentDidMount() {
        this.setState({
            classListLoaded: false
        })

        ipcRenderer.send("icampusClassListReq", true);
        console.log("icampusClassListReq send");
        ipcRenderer.on("icampusClassListRes", (event, message) => {
            console.log(message);
            console.log("icampusClassListRes get from CIcampus", event);
        })
    }

    componentWillUnmount() {
        ipcRenderer.removeAllListeners("icampusClassListRes");
    }


    render() {
        return (
            <button>로딩중</button>
        )
    }
}