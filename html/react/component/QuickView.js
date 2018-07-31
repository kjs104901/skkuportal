import React from 'react';

const { ipcRenderer } = require('electron');

export default class QuickView extends React.Component {
    constructor() {
        super();

        this.state = {
            campusType: 0
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
    }

    componentWillUnmount() {
        ipcRenderer.removeAllListeners("studentInfoRes");
    }

    campusChange(changeEvent) {
        this.setState({
            campusType: changeEvent.target.value
        });
        ipcRenderer.send("settingCampusType", changeEvent.target.value * 1);
    }

    render() {
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
                            <div className="radio radio-default">
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
                    </div>

                    <div className="tab-pane p-l-10 p-r-10" id="quickview-agree">
                        <h1>Hello 2</h1>
                    </div>

                    <div className="tab-pane p-l-10 p-r-10" id="quickview-info">
                        <h1>Hello 3</h1>
                    </div>
                </div>
            </div>
        )
    }
}