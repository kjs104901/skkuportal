import React from 'react';

import $ from 'jquery';
import '../js/jquery.scrollbar.js';

const { ipcRenderer } = require('electron');

export default class CTransportation extends React.Component {
    state = {
        menuIndex: 0,

        suttleLoading: true, // 2009(0) 2002(1) 2004(2)
        suttle: [],
        suttleError: false,
        suttleErrorMessage: "",

        busLoading: false,
        bus: [],
        busError: false,
        busErrorMessage: "",

        subwayLoading: false,
        subway: {},
        subwayError: false,
        subwayErrorMessage: ""
    }

    componentDidMount() {
        const warningMessage = this.props.warningMessage;

        ipcRenderer.send("suttleReq", {
            route: 2009
        });

        ipcRenderer.on("suttleRes", (event, message) => {
            if (!message.err) {
                console.log("suttleRes", message.data);
                this.setState({
                    suttleLoading: false,
                    suttle: message.data,
                    suttleError: false,
                    suttleErrorMessage: "",
                });
            }
            else {
                warningMessage(message.errMessage);
                this.setState({
                    suttleLoading: false,
                    suttle: [],
                    suttleError: true,
                    suttleErrorMessage: message.errMessage,
                });
            }
        });
        ipcRenderer.on("busRes", (event, message) => {
            if (!message.err) {
                console.log("busRes", message.data);
                this.setState({
                    busLoading: false,
                    bus: message.data,
                    busError: false,
                    busErrorMessage: "",
                });
            }
            else {
                warningMessage(message.errMessage);
                this.setState({
                    busLoading: false,
                    bus: [],
                    busError: true,
                    busErrorMessage: message.errMessage,
                });
            }
        });
        ipcRenderer.on("subwayRes", (event, message) => {
            if (!message.err) {
                console.log("subwayRes", message.data);
                this.setState({
                    subwayLoading: false,
                    subway: message.data,
                    subwayError: false,
                    subwayErrorMessage: "",
                });
            }
            else {
                warningMessage(message.errMessage);
                this.setState({
                    subwayLoading: false,
                    subway: [],
                    subwayError: true,
                    subwayErrorMessage: message.errMessage,
                });
            }
        });

        /// jQuery plugin - scroll 
        this.$el = $(this.el)
        this.$el.scrollbar({
            ignoreOverlay: false
        });
    }

    componentWillUnmount() {
        ipcRenderer.removeAllListeners("suttleRes");
        ipcRenderer.removeAllListeners("busRes");
        ipcRenderer.removeAllListeners("subwayRes");
        
        /// jQuery plugin - scroll 
        this.$el.scrollbar('destroy');
    }

    menuSelect = (menuIndex) => {
        if (menuIndex <= 2) {
            this.setState({
                menuIndex: menuIndex,
                suttleLoading: true
            })

            let route = 2009;
            if (menuIndex === 1) {
                route = 2002;
            }
            else if (menuIndex === 2) {
                route = 2004;
            }

            ipcRenderer.send("suttleReq", {
                route: route
            });
        }
        else if (menuIndex <= 6) {
            this.setState({
                menuIndex: menuIndex,
                busLoading: true
            })

            ipcRenderer.send("busReq", {
                type: menuIndex - 2
            });
        }
        else if (menuIndex <= 10) {
            this.setState({
                menuIndex: menuIndex,
                subwayLoading: true
            })

            let campusType = 0;
            let direction = 0
            if (menuIndex === 9 || menuIndex === 10) {
                campusType = 1;
            }
            if (menuIndex === 8 || menuIndex === 10) {
                direction = 1;
            }

            ipcRenderer.send("subwayReq", {
                campusType: campusType,
                direction: direction
            });
        }
    }

    contentRender = () => {
        if ((this.state.suttleLoading && this.state.menuIndex <= 2)
            || (this.state.busLoading && this.state.menuIndex <= 6)
            || (this.state.subwayLoading && this.state.menuIndex <= 10)) {
            return (
                <React.Fragment>
                    {this.contentLoadingRender()}
                </React.Fragment>
            )
        }
        else if (this.state.menuIndex <= 2) {
            return (
                <React.Fragment>
                    {this.suttleRender()}
                </React.Fragment>
            )
        }
        else if (this.state.menuIndex <= 6) {
            return (
                <React.Fragment>
                    {this.busRender()}
                </React.Fragment>
            )
        }
        else if (this.state.menuIndex <= 10) {
            return (
                <React.Fragment>
                    {this.subwayRender()}
                </React.Fragment>
            )
        }
    }

    contentLoadingRender = () => {
        return (
            <div className="row justify-content-center align-items-center no-gutters" style={{ width: "100%", height: "590px" }}>
                <div className="col-4" style={{ textAlign: "center" }}>
                    <div className="progress-circle-indeterminate"></div>
                </div>
            </div>
        );
    }

    suttleRender = () => {

    }

    busRender = () => {
        let rows = [];
        this.state.bus.forEach((route, index) => {
            let busList = [];
            route.resultArray.forEach((bus, index) => {
                if (0 < bus.location) {
                    busList.push(
                        <div className="col-6 p-l-10" key={index}>
                            <div className="card card-default card-condensed" style={{ height: "150px" }}>
                                <div className="card-header">
                                    <div className="card-title">{bus.plate}</div>
                                </div>
                                <div className="card-body" ref={el => this.el = el}>
                                    <p>{bus.location}정류장 전</p>
                                    <p>약 {bus.predictTime}분 후 도착</p>
                                    <p>{bus.remainSeats}좌석 남음</p>
                                </div>
                            </div>
                        </div>
                    )
                }
            })

            rows.push(
                <div className="row no-gutters p-r-10" key={index}>
                    <div className="col-12">
                        <h5 className="p-l-10">
                            {route.routeName + " - " + route.stationName + " 출발 " + route.destinationName}
                        </h5>
                    </div>
                    {busList}
                </div>
            )
        })

        return (
            <React.Fragment>
                {rows}
            </React.Fragment>
        )
    }

    subwayRender = () => {
        let rows = [];

        const length = this.state.subway.referenceArray.length;

        for (let index = 0; index < length; index++) {
            const referenceElement = this.state.subway.referenceArray[index];
            const trainArray = this.state.subway.trainArray[index];

            const trainList = [];
            let trainSrc = "./assets/img/line1train.png";
            if (this.state.menuIndex === 7 || this.state.menuIndex === 8) {
                trainSrc = "./assets/img/line4train.png";
            }

            trainArray.forEach((train, index) => {
                trainList.push(
                    <div className="col-3" key={index}>
                        <img src={trainSrc} />
                        {train.destination + (train.isExpress ? "(급}" : "")}
                    </div>
                )
            });

            let lineSrc = "";
            if (0 < referenceElement.length) {
                if (this.state.menuIndex === 7 || this.state.menuIndex === 8) {
                    lineSrc = "./assets/img/line4station.png"
                }
                else {
                    lineSrc = "./assets/img/line1station.png"
                }
            }
            else {
                if (this.state.menuIndex === 7 || this.state.menuIndex === 8) {
                    lineSrc = "./assets/img/line4line.png"
                }
                else {
                    lineSrc = "./assets/img/line1line.png"
                }
            }

            rows.push(
                <div className="row no-gutters align-items-center" key={index} style={{ height: "30px" }}>
                    <div className="col-2" style={{ textAlign: "right" }}>
                        {referenceElement}
                    </div>
                    <div className="col-1" style={{ textAlign: "center" }}>
                        <img src={lineSrc} />
                    </div>
                    {trainList}
                </div>
            )
        }

        return (
            <React.Fragment>
                {rows}
            </React.Fragment >
        )
    }

    render() {
        return (
            <React.Fragment>
                <nav className="secondary-sidebar">
                    <p className="menu-title" style={{ marginBottom: "0px", marginTop: "10px" }}>셔틀 버스</p>
                    <ul className="main-menu">
                        <li className={this.state.menuIndex === 0 ? "active" : ""}>
                            <a href="#" onClick={() => { this.menuSelect(0) }}>
                                <span className="title"><i className="fas fa-bus-alt"></i> 인문캠 순환</span>
                                <span className="badge pull-right">{this.state.messageUnchecked}</span>
                            </a>
                        </li>
                        <li className={this.state.menuIndex === 1 ? "active" : ""}>
                            <a href="#" onClick={() => { this.menuSelect(1) }}>
                                <span className="title"><i className="fas fa-bus-alt"></i> 자과 ↔ 사당</span>
                                <span className="badge pull-right">{this.state.messageUnchecked}</span>
                            </a>
                        </li>
                        <li className={this.state.menuIndex === 2 ? "active" : ""}>
                            <a href="#" onClick={() => { this.menuSelect(2) }}>
                                <span className="title"><i className="fas fa-bus-alt"></i> 자과 ↔ 분당</span>
                                <span className="badge pull-right">{this.state.messageUnchecked}</span>
                            </a>
                        </li>
                    </ul>
                    <p className="menu-title" style={{ marginBottom: "0px", marginTop: "10px" }}>광역버스</p>
                    <ul className="main-menu">
                        <li className={this.state.menuIndex === 3 ? "active" : ""}>
                            <a href="#" onClick={() => { this.menuSelect(3) }}>
                                <span className="title"><i className="fas fa-bus"></i> 자과 → 사당</span>
                                <span className="badge pull-right">{this.state.messageUnchecked}</span>
                            </a>
                        </li>
                        <li className={this.state.menuIndex === 4 ? "active" : ""}>
                            <a href="#" onClick={() => { this.menuSelect(4) }}>
                                <span className="title"><i className="fas fa-bus"></i> 사당 → 자과</span>
                                <span className="badge pull-right">{this.state.messageUnchecked}</span>
                            </a>
                        </li>
                        <li className={this.state.menuIndex === 5 ? "active" : ""}>
                            <a href="#" onClick={() => { this.menuSelect(5) }}>
                                <span className="title"><i className="fas fa-bus"></i> 자과 → 강남</span>
                                <span className="badge pull-right">{this.state.messageUnchecked}</span>
                            </a>
                        </li>
                        <li className={this.state.menuIndex === 6 ? "active" : ""}>
                            <a href="#" onClick={() => { this.menuSelect(6) }}>
                                <span className="title"><i className="fas fa-bus"></i> 강남 → 자과</span>
                                <span className="badge pull-right">{this.state.messageUnchecked}</span>
                            </a>
                        </li>
                    </ul>
                    <p className="menu-title" style={{ marginBottom: "0px", marginTop: "10px" }}>실시간 지하철</p>
                    <ul className="main-menu">
                        <li className={this.state.menuIndex === 7 ? "active" : ""}>
                            <a href="#" onClick={() => { this.menuSelect(7) }}>
                                <span className="title"><i className="fas fa-subway"></i> 혜화역 상행</span>
                                <span className="badge pull-right">{this.state.messageUnchecked}</span>
                            </a>
                        </li>
                        <li className={this.state.menuIndex === 8 ? "active" : ""}>
                            <a href="#" onClick={() => { this.menuSelect(8) }}>
                                <span className="title"><i className="fas fa-subway"></i> 혜화역 하행</span>
                                <span className="badge pull-right">{this.state.messageUnchecked}</span>
                            </a>
                        </li>
                        <li className={this.state.menuIndex === 9 ? "active" : ""}>
                            <a href="#" onClick={() => { this.menuSelect(9) }}>
                                <span className="title"><i className="fas fa-subway"></i> 성대역 상행</span>
                                <span className="badge pull-right">{this.state.messageUnchecked}</span>
                            </a>
                        </li>
                        <li className={this.state.menuIndex === 10 ? "active" : ""}>
                            <a href="#" onClick={() => { this.menuSelect(10) }}>
                                <span className="title"><i className="fas fa-subway"></i> 성대역 하행</span>
                                <span className="badge pull-right">{this.state.messageUnchecked}</span>
                            </a>
                        </li>
                    </ul>
                </nav>
                <div className="inner-content full-height">
                    <div ref={el => this.el = el}>
                        <div style={{ width: "100%", height: "590px" }}>
                            {this.contentRender()}
                        </div>
                    </div>
                </div>
            </React.Fragment>
        );
    }
}