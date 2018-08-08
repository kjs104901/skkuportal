import React from 'react';

import $ from 'jquery';
import '../js/jquery.scrollbar.js';

import { Line } from 'rc-progress';

const { ipcRenderer } = require('electron');

const warningMessage = (errMessage) => {
    $('body').pgNotification({
        style: "circle",
        timeout: 2000,
        message: errMessage,
        type: "danger"
    }).show();
};

export default class CLibrary extends React.Component {
    state = {
        menuIndex: 0,

        libraryListLoading: true,
        chargeList: [],
        overDueList: [],
        holdList: [],
        libraryListError: false,
        libraryListErrorMessage: "",

        seatListLoading: false,
        seatList: [],
        seatListError: false,
        seatListErrorMessage: "",
    }

    componentDidMount() {
        ipcRenderer.send("libraryListReq", true);
        ipcRenderer.on("libraryListRes", (event, message) => {
            if (!message.err) {
                this.setState({
                    libraryListLoading: false,
                    holdList: message.data.holdList,
                    overDueList: message.data.overDueList,
                    chargeList: message.data.chargeList,
                    libraryListError: false,
                    libraryListErrorMessage: ""
                });
            }
            else {
                warningMessage(message.errMessage);
                this.setState({
                    libraryListLoading: false,
                    holdList: [],
                    overDueList: [],
                    chargeList: [],
                    libraryListError: true,
                    libraryListErrorMessage: message.errMessage
                });
            }
        });

        ipcRenderer.on("seatListRes", (event, message) => {
            if (!message.err) {
                this.setState({
                    seatListLoading: false,
                    seatList: message.data,
                    seatListError: false,
                    seatListErrorMessage: ""
                });
            }
            else {
                warningMessage(message.errMessage);
                this.setState({
                    seatListLoading: false,
                    seatList: [],
                    seatListError: true,
                    seatListErrorMessage: message.errMessage
                });
            }
        });

        ipcRenderer.on("openLibraryRes", (event, message) => {
            if (message.err) {
                warningMessage(message.errMessage);
            }
        });

        /// jQuery plugin - scroll 
        this.$el = $(this.el)
        this.$el.scrollbar({
            ignoreOverlay: false
        });
    }

    componentWillUnmount() {
        ipcRenderer.removeAllListeners("libraryListRes");
        ipcRenderer.removeAllListeners("seatListRes");
        ipcRenderer.removeAllListeners("openLibraryRes");
    }

    menuSelect = (menuIndex) => {
        if (menuIndex === 3 || menuIndex === 4) {
            ipcRenderer.send("seatListReq", {
                campusType: menuIndex - 3
            });

            this.setState({
                menuIndex: menuIndex,

                seatListLoading: true,
                seatList: [],
                seatListError: false,
                seatListErrorMessage: "",
            })
        }
        else {
            this.setState({
                menuIndex: menuIndex
            })

        }
    }
    
    openLibraryRequest = () => {
        ipcRenderer.send("openLibraryReq", true);
    }

    contentRender = () => {
        if (this.state.menuIndex < 3) {
            if (this.state.libraryListLoading) {
                return (
                    <React.Fragment>
                        {this.contentLoadingRender()}
                    </React.Fragment>
                )
            }
            else {
                return (
                    <React.Fragment>
                        {this.bookListRender()}
                    </React.Fragment>
                )
            }
        }
        else {
            if (this.state.seatListLoading) {
                return (
                    <React.Fragment>
                        {this.contentLoadingRender()}
                    </React.Fragment>
                )
            }
            else {
                return (
                    <React.Fragment>
                        {this.seatListRender()}
                    </React.Fragment>
                )
            }
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

    bookListRender = () => {
        let targetList = this.state.chargeList;
        if (this.state.menuIndex === 1) {
            targetList = this.state.overDueList;
        }
        else if (this.state.menuIndex === 2) {
            targetList = this.state.holdList;
        }

        let rows = [];

        targetList.forEach((booklist, index) => {
            rows.push(
                <div className="row no-gutters align-items-center b-b"
                    key={index} style={{ minHeight: "36px" }}>
                    <p className="col-6 large-text no-margin text-center">{booklist.biblio.titleStatement}</p>
                    <p className="col-3 large-text no-margin text-center">{booklist.biblio.author}</p>
                    <p className="col-3 large-text no-margin text-center">{booklist.biblio.publication}</p>
                </div>
            );
        })
        
        if (rows.length === 0) {
            rows.push(
                <div className="row no-gutters align-items-center b-b" key={0} style={{ minHeight: "46px" }}>
                    <p className="col-2 large-text no-margin text-center"></p>
                    <p className="col-8 large-text no-margin text-center">
                        표시할 내용이 없습니다
                    </p>
                    <p className="col-2 large-text no-margin text-center"></p>
                </div>
            );
        }

        return (
            <React.Fragment>
                <div className="row no-gutters align-items-center b-b" style={{ minHeight: "36px" }}>
                    <p className="col-6 large-text no-margin text-center">이름</p>
                    <p className="col-3 large-text no-margin text-center">저자</p>
                    <p className="col-3 large-text no-margin text-center">출판사</p>
                </div>
                {rows}
            </React.Fragment>
        );
    }

    seatListRender = () => {
        let rows = [];
        this.state.seatList.forEach((seat, index) => {
            if (seat.disablePeriod) {
                rows.push(
                    <div className="row no-gutters align-items-center"
                        key={index} style={{ minHeight: "36px" }}>
                        <p className="col-4 large-text no-margin text-center">{seat.name}</p>
                        <p className="col-8 large-text no-margin text-center">
                            운영중지: {seat.disablePeriodName}
                        </p>
                    </div>
                );
            }
            else {
                rows.push(
                    <div className="row no-gutters align-items-center"
                        key={index} style={{ minHeight: "36px" }}>
                        <p className="col-4 large-text no-margin text-center">{seat.name}</p>
                        <p className="col-2 large-text no-margin text-center">{seat.total}</p>
                        <p className="col-2 large-text no-margin text-center">{seat.occupied}</p>
                        <p className="col-4 large-text no-margin text-center">
                            <Line percent={seat.percent} strokeWidth="4" strokeColor="#3D7178" />
                        </p>
                    </div>
                );
            }
        });
        if (rows.length === 0) {
            rows.push(
                <div className="row no-gutters align-items-center b-b" key={0} style={{ minHeight: "46px" }}>
                    <p className="col-2 large-text no-margin text-center"></p>
                    <p className="col-8 large-text no-margin text-center">
                        표시할 내용이 없습니다
                    </p>
                    <p className="col-2 large-text no-margin text-center"></p>
                </div>
            );
        }

        return (
            <React.Fragment>
                <div className="row no-gutters align-items-center" style={{ minHeight: "36px" }}>
                    <p className="col-4 large-text no-margin text-center">이름</p>
                    <p className="col-2 large-text no-margin text-center">총 좌석</p>
                    <p className="col-2 large-text no-margin text-center">사용 좌석</p>
                    <p className="col-4 large-text no-margin text-center">이용율</p>
                </div>
                {rows}
            </React.Fragment>
        );
    }

    render() {
        return (
            <React.Fragment>
                <nav className="secondary-sidebar">
                    <div className=" m-b-20 m-l-10 m-r-10 d-sm-none d-md-block d-lg-block d-xl-block">
                        <a href="#" onClick={() => { this.openLibraryRequest() }} className="btn btn-block btn-compose">도서관 사이트</a>
                    </div>
                    <p className="menu-title" style={{ marginBottom: "0px", marginTop: "10px" }}>도서 목록</p>
                    <ul className="main-menu">
                        <li className={this.state.menuIndex === 0 ? "active" : ""}>
                            <a href="#" onClick={() => { this.menuSelect(0) }}>
                                <span className="title"><i className="fas fa-book"></i> 대여 목록</span>
                                <span className="badge pull-right">{this.state.chargeList.length}</span>
                            </a>
                        </li>
                        <li className={this.state.menuIndex === 1 ? "active" : ""}>
                            <a href="#" onClick={() => { this.menuSelect(1) }}>
                                <span className="title"><i className="fas fa-book"></i> 연체 목록</span>
                                <span className="badge pull-right">{this.state.overDueList.length}</span>
                            </a>
                        </li>
                        <li className={this.state.menuIndex === 2 ? "active" : ""}>
                            <a href="#" onClick={() => { this.menuSelect(2) }}>
                                <span className="title"><i className="fas fa-book"></i> 예약 목록</span>
                                <span className="badge pull-right">{this.state.holdList.length}</span>
                            </a>
                        </li>
                    </ul>
                    <p className="menu-title" style={{ marginBottom: "0px", marginTop: "10px" }}>열람실 좌석</p>
                    <ul className="main-menu">
                        <li className={this.state.menuIndex === 3 ? "active" : ""}>
                            <a href="#" onClick={() => { this.menuSelect(3) }}>
                                <span className="title"><i className="fas fa-book-reader"></i> 인사캠</span>
                            </a>
                        </li>
                        <li className={this.state.menuIndex === 4 ? "active" : ""}>
                            <a href="#" onClick={() => { this.menuSelect(4) }}>
                                <span className="title"><i className="fas fa-book-reader"></i> 자과캠</span>
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