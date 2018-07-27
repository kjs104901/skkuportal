import React from 'react';

import $ from 'jquery';
import '../js/jquery.scrollbar.js';

const { ipcRenderer } = require('electron');

export default class CIcampus extends React.Component {
    state = {
        menuMessage: -1,
        menuClass: 0,

        classListLoading: true,
        classList: [],
        classListError: false,
        classListErrorMessage: "",

        messageUnchecked: 0,
        messageLoading: true,
        messageList: [],
        messageError: false,
        messageErrorMessage: "",

        classPostListLoading: false,
        classPostList: [],
        classPostListError: false,
        classPostListErrorMessage: "",
    }

    componentDidMount() {
        ipcRenderer.send("classListReq", true);
        ipcRenderer.on("classListRes", (event, message) => {
            if (!message.err) {
                this.setState({
                    classListLoading: false,
                    classList: message.data,
                    classListError: false,
                });

                if (0 < message.data.length) {
                    this.classPostListRequest(message.data[0].identity);
                }
            }
            else {
                this.setState({
                    classListLoading: false,
                    classList: [],
                    classListError: true,
                    classListErrorMessage: message.errMessage
                });
            }
        });

        ipcRenderer.send("messageListReq", true);
        ipcRenderer.on("messageListRes", (event, message) => {
            if (!message.err) {
                let uncheckedCount = 0;
                message.data.forEach(element => {
                    if (element.check === false) {
                        uncheckedCount += 1;
                    }
                });
                this.setState({
                    messageLoading: false,
                    messageList: message.data,
                    classListError: false,

                    messageUnchecked: uncheckedCount
                });
            }
            else {
                this.setState({
                    messageLoading: false,
                    messageList: [],
                    classListError: true,
                    messageErrorMessage: message.errMessage
                });
            }
        });

        ipcRenderer.on("classPostListRes", (event, message) => {
            if (!message.err) {
                this.setState({
                    classPostListLoading: false,
                    classPostList: message.data,
                    classPostListError: false,
                });
            }
            else {
                this.setState({
                    classPostListLoading: false,
                    classPostList: [],
                    classPostListError: true,
                    classPostListErrorMessage: message.errMessage
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
        ipcRenderer.removeAllListeners("classListRes");
        ipcRenderer.removeAllListeners("messageListRes");
        ipcRenderer.removeAllListeners("classPostListRes");

        /// jQuery plugin - scroll 
        this.$el.scrollbar('destroy');
    }


    classPostListRequest = (identity) => {
        ipcRenderer.send("classPostListReq", identity);
        this.setState({
            classPostListLoading: true,
            classPostList: [],
            classPostListError: false,
            classPostListErrorMessage: ""
        })
    }

    menuSelect = (messageIndex, classIndex) => {
        if (-1 < classIndex) {
            this.classPostListRequest(this.state.classList[classIndex].identity);
        }
        this.setState({
            menuMessage: messageIndex,
            menuClass: classIndex
        })
    }

    classListRender = () => {
        let rows = [];
        this.state.classList.forEach((classElement, index) => {
            let recentNumber = classElement.recentNumbers.notification * 1;
            recentNumber += classElement.recentNumbers.resource * 1;
            recentNumber += classElement.recentNumbers.assignment * 1;

            rows.push(
                <li className={this.state.menuClass === index ? "active" : ""} key={index}>
                    <a href="#" onClick={() => { this.menuSelect(-1, index) }}>
                        <span className="title"><i className="pg-inbox"></i> {classElement.name.substr(0, 6)}</span>
                        <span className="badge pull-right">{recentNumber}</span>
                    </a>
                </li>
            )
        });
        return (
            <React.Fragment>
                {rows}
            </React.Fragment>
        )
    }

    contentRender = () => {
        if (-1 < this.state.menuMessage && this.state.messageLoading === false) {
            let rows = [];
            (this.state.messageList).forEach(message => {
                rows.push(message.title);
            });
            return (
                <React.Fragment>
                    <h5>
                        {rows}
                    </h5>
                </React.Fragment>
            );
        }
        else if (-1 < this.state.menuClass && this.state.classPostListLoading === false) {
            let rows = [];
            (this.state.classPostList).forEach((classPost, index) => {
                //classPost.post.title
                if (classPost.type === "notice") {
                    const date = new Date(classPost.post.date);
                    const dateStr = date.getMonth() + "/" + date.getDate();

                    let attachments = [];
                    if (classPost.post.attachments.forEach){
                        (classPost.post.attachments).forEach((attachment, index) => {
                            attachments.push(
                                <i className="fas fa-file-download large-text" key={index} style={{margin:"5px"}}></i>
                            );
                        });
                    }

                    rows.push(
                        <div className="row no-gutters align-items-center" style={{ height: "40px" }} key={index}>
                            <p className="col-1 xlarge-text no-margin" style={{ textAlign: "center" }}>
                                <i className="fas fa-exclamation"></i>
                            </p>
                            <p className="col-1 xlarge-text no-margin">{dateStr}</p>
                            <p className="col-1 xlarge-text no-margin">{classPost.post.publisher}</p>
                            <p className="col-7 xlarge-text no-margin p-l-20">{classPost.post.title}</p>
                            <div className="col-2 no-margin" style={{ textAlign: "center" }}>{attachments}</div>
                        </div>
                    );
                }
                else if (classPost.type === "material") {
                    const date = new Date(classPost.post.date);
                    const dateStr = date.getMonth() + "/" + date.getDate();
                    
                    let attachments = [];
                    if (classPost.post.attachments.forEach){
                        (classPost.post.attachments).forEach((attachment, index) => {
                            attachments.push(
                                <i className="fas fa-file-download large-text" key={index} style={{margin:"5px"}}></i>
                            );
                        });
                    }

                    rows.push(
                        <div className="row no-gutters align-items-center" style={{ height: "40px" }} key={index}>
                            <p className="col-1 xlarge-text no-margin" style={{ textAlign: "center" }}>
                                <i className="fas fa-save"></i>
                            </p>
                            <p className="col-1 xlarge-text no-margin">{dateStr}</p>
                            <p className="col-1 xlarge-text no-margin">{classPost.post.publisher}</p>
                            <p className="col-7 xlarge-text no-margin p-l-20">{classPost.post.title}</p>
                            <div className="col-2 no-margin" style={{ textAlign: "center" }}>{attachments}</div>
                        </div>
                    );
                }
                else if (classPost.type === "assignment") {
                    const date = new Date(classPost.post.startTime);
                    const dateStr = date.getMonth() + "/" + date.getDate();
                    rows.push(
                        <div className="row no-gutters align-items-center" style={{ height: "40px" }} key={index}>
                            <p className="col-1 xlarge-text no-margin" style={{ textAlign: "center" }}>
                                <i className="fas fa-home"></i>
                            </p>
                            <p className="col-1 xlarge-text no-margin">{dateStr}</p>
                            <p className="col-1 xlarge-text no-margin">[{classPost.post.type}]</p>
                            <p className="col-7 xlarge-text no-margin p-l-20">{classPost.post.title}</p>
                        </div>
                    );
                }
            });
            return (
                <React.Fragment>
                    <div className="m-l-10 m-r-10">
                        {rows}
                    </div>
                </React.Fragment>
            );
        }
        else {
            return (
                <React.Fragment>
                    <h1>loading...</h1>
                </React.Fragment>
            );
        }
    }

    render() {
        return (
            <React.Fragment>
                <nav className="secondary-sidebar">
                    <div className=" m-b-20 m-l-10 m-r-10 d-sm-none d-md-block d-lg-block d-xl-block">
                        <a href="email_compose.html" className="btn btn-block btn-compose">Icampus 열기</a>
                    </div>
                    <p className="menu-title" style={{ marginBottom: "0px", marginTop: "10px" }}>쪽지</p>
                    <ul className="main-menu">
                        <li className={this.state.menuMessage === 0 ? "active" : ""}>
                            <a href="#" onClick={() => { this.menuSelect(0, -1) }}>
                                <span className="title"><i className="pg-inbox"></i> 받은 쪽지</span>
                                <span className="badge pull-right">{this.state.messageUnchecked}</span>
                            </a>
                        </li>
                    </ul>
                    <p className="menu-title" style={{ marginBottom: "0px", marginTop: "10px" }}>과목</p>
                    <ul className="main-menu">
                        {this.classListRender()}
                    </ul>
                </nav>
                <div className="inner-content full-height">
                    <div ref={el => this.el = el}>
                        <div style={{ width: "100%", maxHeight: "590px" }}>
                            {this.contentRender()}
                        </div>
                    </div>
                </div>
            </React.Fragment>
        )
    }
}