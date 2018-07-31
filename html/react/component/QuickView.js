import React from 'react';

const { ipcRenderer } = require('electron');

export default class QuickView extends React.Component {
    constructor() {
        super();

        this.state = {
            campusType: 0,

            updateLoading: true,

            updateError: false,
            updateAvailable: false,

            updateVersion: "Loading...",
            currentVersion: ""
        }
        this.campusChange = this.campusChange.bind(this);
    }

    componentDidMount() {
        ipcRenderer.send("studentInfoReq", true);
        ipcRenderer.on("studentInfoRes", (event, message) => {
            if (!message.err) {
                this.setState({
                    campusType: message.data.campusType * 1
                });
            }
        });

        ipcRenderer.send("updateInfoReq", true);
        ipcRenderer.on("updateInfoRes", (event, message) => {
            console.log("updateInfoRes", message);

            if (message.data.updateLoading) {
                this.setState({
                    currentVersion: message.data.currentVersion
                });
                setTimeout(()=>{
                    ipcRenderer.send("updateInfoReq", true);
                }, 1000);
            }
            else {
                this.setState({
                    updateLoading: false,
                    
                    updateError: message.data.updateError,
                    updateAvailable: message.data.updateAvailable,

                    updateVersion: message.data.updateVersion,
                    currentVersion: message.data.currentVersion
                });
            }
        });
    }

    componentWillUnmount() {
        ipcRenderer.removeAllListeners("studentInfoRes");
        ipcRenderer.removeAllListeners("updateInfoRes");
    }

    campusChange(changeEvent) {
        this.setState({
            campusType: changeEvent.target.value
        });
        ipcRenderer.send("settingCampusType", changeEvent.target.value * 1);
    }

    logout() {
        ipcRenderer.send("logoutReq", true);
    }

    clearCache() {
        ipcRenderer.send("clearCacheReq", true);
    }

    openUpdater() {
        if (this.state.updateAvailable) {
            ipcRenderer.send("openUpdaterReq", true);
        }
        else {
            $('body').pgNotification({
                style: "circle",
                timeout: 2000,
                message: "업데이트 할 수 없습니다",
                type: "danger"
            }).show();
        }
    }

    render() {
        let updateStr = "";
        let updateButtonColor = "#FFFFFF";
        let updateButtonFontColor = "#575757";
        if (this.state.updateLoading) {
            updateStr = "업데이트 검사 중"
        }
        else {
            if (this.state.updateAvailable) {
                updateButtonColor = "#F35958";
                updateButtonFontColor = "#FFFFFF";
                updateStr = "업데이트 다운로드"
            }
            else if (this.state.updateError) {
                updateStr = "업데이트 오류"
            }
            else {
                updateStr = "최신버전 입니다"
            }
        }

        return (
            <div id="quickview" className="quickview-wrapper" data-pages="quickview" style={{ height: "70%" }}>
                <ul className="nav nav-tabs" role="tablist">
                    <li className="">
                        <a href="#" data-target="#quickview-setting" data-toggle="tab" role="tab">
                            설정
                        </a>
                    </li>
                    <li>
                        <a href="#" data-target="#quickview-agree" data-toggle="tab" role="tab">
                            동의
                        </a>
                    </li>
                    <li className="">
                        <a href="#" data-target="#quickview-info" data-toggle="tab" role="tab">
                            정보
                        </a>
                    </li>
                </ul>

                <div className="tab-content">
                    <div className="tab-pane p-l-10 p-r-10 active" id="quickview-setting">
                        <h5>캠퍼스 전환</h5>
                        <form>
                            <div className="radio radio-warning">
                                <input type="radio" value={0}
                                    checked={this.state.campusType == 0 ? "checked" : ""}
                                    onChange={this.campusChange}
                                    id="campusM" />
                                <label htmlFor="campusM">명륜</label>

                                <input type="radio" value={1}
                                    checked={this.state.campusType == 1 ? "checked" : ""}
                                    onChange={this.campusChange}
                                    id="campusY" />
                                <label htmlFor="campusY">율전</label>
                            </div>
                        </form>
                        <h5 className="m-t-10">사용자 정보</h5>
                        <a href="#" className="btn btn-block btn-compose m-t-10"
                            onClick={() => { this.logout() }}
                            style={{ backgroundColor: "#DDDDDD"}}>
                            로그아웃
                        </a>
                        <a href="#" className="btn btn-block btn-compose m-t-10"
                            onClick={() => { this.clearCache() }}
                            style={{ backgroundColor: "#DDDDDD"}}>
                            캐시 삭제
                        </a>
                        <h5 className="m-t-10">업데이트</h5>
                        <a href="#" className="btn btn-block btn-compose m-t-10"
                            onClick={() => { this.openUpdater() }}
                            style={{ backgroundColor: updateButtonColor, color: updateButtonFontColor}}>
                            {updateStr}
                        </a>
                        <div className="m-t-10" style={{textAlign: "center"}}>
                            <p className="no-margin large-text">현재 버전: [{this.state.currentVersion}]</p>
                            <p className="no-margin large-text">최신 버전: [{this.state.updateVersion}]</p>
                        </div>
                    </div>

                    <div className="tab-pane p-l-10 p-r-10" id="quickview-agree">
                        <h1>Hello 2</h1>
                    </div>

                    <div className="tab-pane p-l-10 p-r-10" id="quickview-info">
                        <div style={{textAlign: "center"}}>
                            <h4>SKKU portal</h4>
                            <img src='./assets/img/skkulogoback.png' width="100" height="100"/>
                            <p className="m-t-10">License</p>
                            <p className="text-danger no-margin">학교 정보: www.skku.edu</p>
                            <p className="small-text no-margin">.</p>
                            <p className="small-text no-margin">버스 정보: CC BY 경기도</p>
                            <p className="small-text no-margin">[MIT] xml2js: Leonidas-from-XIV</p>
                            <p className="small-text no-margin">[MIT] iconv-lite: ashtuchkin</p>
                            <p className="small-text no-margin">[MIT] charset: node-modules</p>
                            <p className="small-text no-margin">[MIT] regedit: ironSource</p>
                            <p className="small-text no-margin">[MIT] node-machine-id: automation-stack</p>
                            <p className="small-text no-margin">[MIT] parse-multipart: freesoftwarefactory</p>
                            <p className="small-text no-margin">[UPL-1.1+] mailparser: nodemailer</p>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}