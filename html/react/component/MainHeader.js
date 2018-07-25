import React from 'react';

const { shell } = require('electron');

let openHompage = () => {
    shell.openExternal("http://lemon-puppy.com");
}

let openSkkuHomepage = () => {
    shell.openExternal("http://www.skku.edu");
}

export default class MainHeader extends React.Component {

    render() {
        let menuGoto = this.props.menuGoto;
        let menuIndex = this.props.menuIndex;

        return (
            <div className="header" style={{ padding: '0px' }}>
                <div>
                    <div className="brand inline" style={{ height: "40px", width: "180px" }}>
                        <h1 style={{ marginLeft: "10px", marginTop: "-2px", marginBottom: "0px", height:"40px", fontSize:"25px" }}>SKKU Portal</h1>
                    </div>
                    <ul className="hidden-md-down notification-list no-margin hidden-sm-down b-grey b-l b-r no-style p-l-20 p-r-20" id = "header-link">
                        <li className="p-r-10 inline">
                            <a href="#" className="header-icon fas fa-home" onClick={openHompage}></a>
                        </li>
                        <li className="p-r-10 inline">
                            <a href="#" className="header-icon fas fa-university" onClick={openSkkuHomepage}></a>
                        </li>
                    </ul>
                    <ul className="hidden-md-down notification-list no-margin hidden-sm-down b-grey b-l b-r no-style p-l-20 p-r-20" id = "header-link">
                        <li className="p-r-10 inline">
                            <a href="#" className="header-icon fas fa-home" onClick={openHompage}></a>
                        </li>
                        <li className="p-r-10 inline">
                            <a href="#" className="header-icon fas fa-university" onClick={openSkkuHomepage}></a>
                        </li>
                    </ul>
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