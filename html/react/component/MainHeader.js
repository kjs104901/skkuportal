import React from 'react';
const { ipcRenderer } = require('electron');


const { shell } = require('electron');

let openHompage = () => {
    shell.openExternal("http://lemon-puppy.com");
}

let openSkkuHomepage = () => {
    shell.openExternal("http://www.skku.edu");
}

export default class MainHeader extends React.Component {
    state={
    }

    componentDidMount() {
        ipcRenderer.send("studentInfoReq", true);
        ipcRenderer.on("studentInfoRes", (event, message) => {
            if (!message.err) {
                this.setState({
                    studentName: message.data.name,
                    studentDepartment: message.data.department
                })
            }
        });
    }

    render() {
        let menuGoto = this.props.menuGoto;
        let menuIndex = this.props.menuIndex;

        return (
            <div className="header" style={{ padding: '0px' }}>
                <div>
                    <div className="brand inline" style={{ height: "40px", width: "180px" }}>
                        <h1 style={{ marginLeft: "10px", marginTop: "-2px", marginBottom: "0px", height: "40px", fontSize: "25px" }}>SKKU Portal</h1>
                    </div>
                    <ul className="hidden-md-down notification-list no-margin hidden-sm-down b-grey b-l b-r no-style p-l-20 p-r-20" id="header-link">
                        <li className="p-l-5 p-r-5 inline">
                            <a href="#" className="header-icon fas fa-home" onClick={openHompage}></a>
                        </li>
                        <li className="p-l-5 p-r-5 inline">
                            <a href="#" className="header-icon fas fa-university" onClick={openSkkuHomepage}></a>
                        </li>
                    </ul>
                    <ul className="hidden-md-down notification-list no-margin hidden-sm-down b-grey b-r no-style p-l-20 p-r-20">
                        <li className="p-l-5 p-r-5 inline">
                            {this.state.studentName? this.state.studentName: ""}
                        </li>
                        <li className="p-l-5 p-r-5 inline">
                            {this.state.studentDepartment? this.state.studentDepartment: ""}
                        </li>
                    </ul>
                    {shortcut(menuIndex)}
                </div>

                <div className="d-flex align-items-center">
                    <div id="setting-button" className="col-auto" style={{ textAlign: "center", height: "40px" }} data-toggle="quickview" data-toggle-element="#quickview">
                        <img src="./assets/img/settingbuttonB.png" style={{ paddingTop: "12px" }} />
                    </div>
                    <div id="minimize-button" className="col-auto" style={{ textAlign: "center", height: "40px" }}>
                        <img src="./assets/img/minimizebuttonB.png" style={{ paddingTop: "11px" }} />
                    </div>
                    <div id="close-button" className="col-auto" style={{ textAlign: "center", height: "40px" }}>
                        <img src="./assets/img/closebuttonB.png" style={{ paddingTop: "11px" }} />
                    </div>
                </div>
            </div>
        )
    }
}

const shortcut = (menuIndex) => {
    if (menuIndex === 2) {
        return (
            <ul className="hidden-md-down notification-list no-margin hidden-sm-down b-grey no-style p-l-20 p-r-20"
                id="header-link-button"
                style={{ height:"27px", backgroundColor: "#1B484F", color: "#FFFFFF" }}
                onClick={openGLS}>
                <li className="p-l-5 p-r-5 inline">
                    <i className="fas fa-play"></i>
                </li>
                <li className="p-l-5 p-r-5 inline">
                    GLS 실행
                </li>
            </ul>
        )
    }
};

const openGLS = () => {
    ipcRenderer.send("openGLSReq", true);
}

ipcRenderer.on("openGLSRes", (event, message) => {
    if (message.err) {
        $('body').pgNotification({
            style: "circle",
            timeout: 2000,
            message: message.errMessage,
            type: "danger"
        }).show();
        return;
    }
});
