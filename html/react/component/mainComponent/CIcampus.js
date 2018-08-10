import React from 'react';

import $ from 'jquery';
import '../js/jquery.scrollbar.js';

const { ipcRenderer } = require('electron');

export default class CIcampus extends React.Component {
    state = {
        menuMessage: -1,
        menuClass: 0,

        menuDetailed: -1,

        messageUnchecked: 0,

        targetYear: -1,
        targetSemester: -1,

        semesterList: [],

        messageListLoading: true,
        messageList: [],
        messageListError: false,
        messageListErrorMessage: "",

        messageLoading: true,
        message: {},
        messageError: false,
        messageErrorMessage: "",

        classListLoading: false,
        classList: [],
        classListError: false,
        classListErrorMessage: "",

        postListLoading: false,
        postList: [],
        postListError: false,
        postListErrorMessage: "",

        postLoading: false,
        post: {},
        postError: false,
        postErrorMessage: ""
    }

    componentDidMount() {
        const warningMessage = this.props.warningMessage;

        ipcRenderer.send("semesterListReq", true);
        ipcRenderer.on("semesterListRes", (event, message) => {
            if (!message.err) {
                if (0 < message.data.length) {
                    this.setState({
                        semesterList: message.data,
                        targetYear: message.data[0].year,
                        targetSemester: message.data[0].semester,

                        classListLoading: true,
                    });
                    
                    ipcRenderer.send("classListReq", {
                        year: message.data[0].year,
                        semester: message.data[0].semester
                    });
                }
            }
            else {
                warningMessage(message.errMessage);
            }
        })

        ipcRenderer.on("classListRes", (event, message) => {
            if (!message.err) {
                this.setState({
                    classListLoading: false,
                    classList: message.data,
                    classListError: false,
                });

                if (0 < message.data.length) {
                    this.postListRequest(message.data[0].identity);
                }
            }
            else {
                warningMessage(message.errMessage);
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
                    messageListLoading: false,
                    messageList: message.data,
                    classListError: false,

                    messageUnchecked: uncheckedCount
                });
            }
            else {
                warningMessage(message.errMessage);
                this.setState({
                    messageListLoading: false,
                    messageList: [],
                    classListError: true,
                    messageListErrorMessage: message.errMessage
                });
            }
        });

        ipcRenderer.on("postListRes", (event, message) => {
            if (!message.err) {
                this.setState({
                    postListLoading: false,
                    postList: message.data,
                    postListError: false,
                });
            }
            else {
                warningMessage(message.errMessage);
                this.setState({
                    postListLoading: false,
                    postList: [],
                    postListError: true,
                    postListErrorMessage: message.errMessage
                });
            }
        });

        ipcRenderer.on("messageRes", (event, message) => {
            if (!message.err) {
                this.setState({
                    messageLoading: false,
                    message: message.data,
                    messageError: false,
                });
            }
            else {
                warningMessage(message.errMessage);
                this.setState({
                    messageLoading: false,
                    message: {},
                    messageError: true,
                    messageErrorMessage: message.errMessage
                });
            }
        })

        ipcRenderer.on("postRes", (event, message) => {
            if (!message.err) {
                this.setState({
                    postLoading: false,
                    post: message.data,
                    postError: false,
                });
            }
            else {
                warningMessage(message.errMessage);
                this.setState({
                    postLoading: false,
                    post: {},
                    postError: true,
                    postErrorMessage: message.errMessage
                });
            }
        })

        /// jQuery plugin - scroll 
        this.$el = $(this.el)
        this.$el.scrollbar({
            ignoreOverlay: false
        });
    }

    componentWillUnmount() {
        ipcRenderer.removeAllListeners("semesterListRes");
        ipcRenderer.removeAllListeners("classListRes");
        ipcRenderer.removeAllListeners("messageListRes");
        ipcRenderer.removeAllListeners("postListRes");
        ipcRenderer.removeAllListeners("messageRes");
        ipcRenderer.removeAllListeners("postRes");

        /// jQuery plugin - scroll 
        this.$el.scrollbar('destroy');
    }

    postListRequest = (identity) => {
        ipcRenderer.send("postListReq", identity);
        this.setState({
            postListLoading: true,
            postList: [],
            postListError: false,
            postListErrorMessage: ""
        })
    }

    menuDetailedRequest = (detailedIndex) => {
        if (0 <= this.state.menuMessage) {
            ipcRenderer.send("messageReq", {
                messageId: this.state.messageList[detailedIndex].messageId
            });

            this.setState({
                messageLoading: true,
                message: {},
                messageError: false,
                messageErrorMessage: ""
            })
        }
        else if (0 <= this.state.menuClass) {
            ipcRenderer.send("postReq",
                {
                    type: this.state.postList[detailedIndex].type,
                    url: this.state.postList[detailedIndex].post.URL
                }
            );
            this.setState({
                postLoading: true,
                post: {},
                postError: false,
                postErrorMessage: ""
            })
        }
    }

    fileDownloadRequest = (url, name, saveName) => {
        ipcRenderer.send("icampusFileDownload", {
            url: url,
            name: name,
            saveName: saveName
        })
    }

    openIcampusGate = () => {
        ipcRenderer.send("openIcampusGateReq", true);
    }

    menuSelect = (messageIndex, classIndex) => {
        if (-1 < classIndex) {
            this.postListRequest(this.state.classList[classIndex].identity);
        }
        this.setState({
            menuMessage: messageIndex,
            menuClass: classIndex,
            menuDetailed: -1
        })
    }

    menuDetailedSelect = (detailedIndex) => {
        this.menuDetailedRequest(detailedIndex);
        this.setState({
            menuDetailed: detailedIndex
        })
    }

    semesterChange = (semesterIndex) => {
        const year = this.state.semesterList[semesterIndex].year;
        const semester = this.state.semesterList[semesterIndex].semester;

        this.setState({
            targetYear: year,
            targetSemester: semester,
            
            classListLoading: true,
            classList: [],
            classListError: false,
            classListErrorMessage: "",
            
            postListLoading: false,
            postList: [],
            postListError: false,
            postListErrorMessage: "",
        })

        ipcRenderer.send("classListReq", {
            year: year,
            semester: semester
        });
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
                        <span className="title"><i className="fas fa-list-ul"></i> {classElement.name.substr(0, 5)}</span>
                        <span className="badge pull-right">{recentNumber}</span>
                    </a>
                </li>
            )
        });
        if (rows.length === 0) {
            if (this.state.classListLoading) {
                rows.push(
                    <li key={0}>
                        <div className="progress-circle-indeterminate m-t-50"></div>
                    </li>
                )
            }
        }
        return (
            <React.Fragment>
                {rows}
            </React.Fragment>
        )
    }

    contentMessageListRender = () => {
        let rows = [];
        (this.state.messageList).forEach((message, index) => {
            const date = new Date(message.sentDate);
            const dateStr = date.getMonth() + "/" + date.getDate();

            rows.push(
                <div className="row no-gutters align-items-center" style={{ height: "36px" }} key={index}>
                    <p className="col-1 large-text no-margin" style={{ textAlign: "center" }}>
                        {message.check ? <i className="far fa-envelope-open"></i> : <i className="fas fa-envelope"></i>}
                    </p>
                    <p className="col-1 large-text no-margin">{dateStr}</p>
                    <p className="col-1 large-text no-margin">{message.sender}</p>
                    <p className="col-9 large-text no-margin p-l-20">
                        <a href="#" onClick={() => { this.menuDetailedSelect(index) }}>
                            {message.title}
                        </a>
                    </p>
                </div>
            );
        });

        if (rows.length === 0) {
            rows.push(
                <div className="col-12 " key="0" style={{ textAlign: "center", paddingTop: "230px" }}>
                    <h2>표시할 내용이 없습니다</h2>
                </div>
            )
        }
        return (
            <div className="m-l-10 m-r-10">
                {rows}
            </div>
        );
    }

    contentPostListRender = () => {
        let rows = [];
        (this.state.postList).forEach((classPost, index) => {
            let header;
            let footer = [];
            let publisher = "";

            let date = new Date();
            let dateStr = "";

            if (classPost.type === "notice" || classPost.type === "material") {
                date = new Date(classPost.post.date);
                dateStr = date.getMonth() + "/" + date.getDate();
                if (classPost.type === "notice") {
                    header = (<i className="fas fa-exclamation"></i>);
                }
                else if (classPost.type === "material") {
                    header = (<i className="fas fa-save"></i>);
                }
                publisher = classPost.post.publisher;

                if (classPost.post.attachments.forEach) {
                    (classPost.post.attachments).forEach((attachment, index) => {
                        footer.push(
                            <React.Fragment key={index}>
                                <a href="#"
                                    onClick={() => {
                                        this.fileDownloadRequest(
                                            attachment.pathInfo,
                                            attachment.atchFileNm,
                                            attachment.atchFileSaveNm)
                                    }}>

                                    <i className="fas fa-file-download large-text" style={{ margin: "5px" }}></i>
                                </a>
                            </React.Fragment>
                        );
                    });
                }
            }
            else if (classPost.type === "assignment") {
                date = new Date(classPost.post.startTime);
                dateStr = date.getMonth() + "/" + date.getDate();
                header = (<i className="fas fa-home"></i>);
                publisher = "[" + classPost.post.type + "]";

                if (classPost.post.submitStatus === "Y") {
                    footer.push(
                        <i className="fas fa-check-circle text-success" key={0} style={{ margin: "5px" }}></i>
                    );
                }
                else {
                    footer.push(
                        <i className="far fa-circle text-danger" key={0} style={{ margin: "5px" }}></i>
                    );
                }

                if (!isNaN(classPost.post.score)) {
                    footer.push(
                        <p className="large-text" style={{ display: "inline" }} key={1}>
                            {classPost.post.score}
                        </p>
                    );
                }
            }

            rows.push(
                <div className="row no-gutters align-items-center" style={{ height: "36px" }} key={index}>
                    <p className="col-1 large-text no-margin" style={{ textAlign: "center" }}>
                        {header}
                    </p>
                    <p className="col-1 large-text no-margin">{dateStr}</p>
                    <p className="col-1 large-text no-margin">{publisher}</p>
                    <p className="col-7 large-text no-margin p-l-20">
                        <a href="#" onClick={() => { this.menuDetailedSelect(index) }}>
                            {classPost.post.title}
                        </a>
                    </p>
                    <div className="col-2 no-margin" style={{ textAlign: "center" }}>{footer}</div>
                </div>
            );
        });
        if (rows.length === 0) {
            rows.push(
                <div className="col-12 " key="0" style={{ textAlign: "center", paddingTop: "230px" }}>
                    <h4>표시할 내용이 없습니다</h4>
                </div>
            )
        }
        return (
            <div className="m-l-10 m-r-10">
                {rows}
            </div>
        );
    }

    constentMessageRender = () => {
        return (
            <React.Fragment>
                <div className="row align-items-center no-gutters" style={{ width: "100%", height: "40px" }}>
                    <div className="col-10">
                    </div>
                    <div className="col-2" style={{ textAlign: "center" }}>
                        <a href="#" className="btn btn-block btn-compose"
                            onClick={() => { this.setState({ menuDetailed: -1 }) }}
                            style={{ backgroundColor: "#1B484F", color: "#FFD661" }}>
                            <i className="fas fa-arrow-left"></i>
                        </a>
                    </div>
                </div>
                <div className="padding-10" style={{ width: "100%", height: "550px", overflow: "auto" }}
                    dangerouslySetInnerHTML={{ __html: this.state.message.replace(/href/, 'h') }} >
                </div>
            </React.Fragment>
        );
    }

    contentPostRender = () => {
        let attachments = [];
        if (this.state.post.attachments.forEach) {
            (this.state.post.attachments).forEach((attachment, index) => {
                attachments.push(
                    <React.Fragment key={index}>
                        <a href="#"
                            onClick={() => {
                                this.fileDownloadRequest(
                                    attachment.pathInfo,
                                    attachment.atchFileNm,
                                    attachment.atchFileSaveNm)
                            }}
                            style={{ marginRight: "10px" }}>

                            <i className="fas fa-file-download large-text" style={{ margin: "5px" }}></i>
                            <p className="large-text" style={{ display: "inline" }}>{attachment.atchFileNm}</p>
                        </a>
                    </React.Fragment>
                );
            });
        }

        return (
            <React.Fragment>
                <div className="row align-items-center no-gutters b-b" style={{ width: "100%", height: "40px" }}>
                    <div className="col-10" style={{ overflow: "auto", height: "40px" }}>
                        {attachments}
                    </div>
                    <div className="col-2" style={{ textAlign: "center" }}>
                        <a href="#" className="btn btn-block btn-compose"
                            onClick={() => { this.setState({ menuDetailed: -1 }) }}
                            style={{ backgroundColor: "#1B484F", color: "#FFD661" }}>
                            <i className="fas fa-arrow-left"></i>
                        </a>
                    </div>
                </div>
                <div className="padding-10" style={{ width: "100%", height: "550px", overflow: "auto" }}
                    dangerouslySetInnerHTML={{ __html: this.state.post.content.replace(/href/g, 'h') }} >
                </div>
            </React.Fragment>
        );
    }

    semesterListRender = () => {
        let rows = [];
        this.state.semesterList.forEach((semester, index) => {
            rows.push(
                <option key={index} value={index}>{semester.name}</option>
            )
        });
        return (
            <React.Fragment>
                {rows}
            </React.Fragment>
        )
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

    contentRender = () => {
        if (-1 < this.state.menuDetailed) {
            if (-1 < this.state.menuMessage && this.state.messageLoading === false) {
                return (
                    <React.Fragment>
                        {this.constentMessageRender()}
                    </React.Fragment>
                );
            }
            else if (-1 < this.state.menuClass && this.state.postLoading === false) {
                return (
                    <React.Fragment>
                        {this.contentPostRender()}
                    </React.Fragment>
                );
            }
            else {
                return (
                    <React.Fragment>
                        {this.contentLoadingRender()}
                    </React.Fragment>
                );
            }
        }
        else {
            if (-1 < this.state.menuMessage && this.state.messageListLoading === false) {
                return (
                    <React.Fragment>
                        {this.contentMessageListRender()}
                    </React.Fragment>
                );
            }
            else if (-1 < this.state.menuClass && (this.state.postListLoading === false && this.state.classListLoading === false)) {
                return (
                    <React.Fragment>
                        {this.contentPostListRender()}
                    </React.Fragment>
                );
            }
            else {
                return (
                    <React.Fragment>
                        {this.contentLoadingRender()}
                    </React.Fragment>
                );
            }
        }
    }

    render() {
        return (
            <React.Fragment>
                <nav className="secondary-sidebar">
                    <div className=" m-b-20 m-l-10 m-r-10 d-sm-none d-md-block d-lg-block d-xl-block">
                        <a href="#" onClick={this.openIcampusGate} className="btn btn-block btn-compose">Icampus 열기</a>
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
                    <div className="form-group">
                        <select value={this.state.value}
                            onChange={(i) => { this.semesterChange(i.target.value) }}
                            className="form-control"
                            style={{width: "90%", marginLeft: "5%"}}>
                            {this.semesterListRender()}
                        </select>
                    </div>
                    <ul className="main-menu">
                        {this.classListRender()}
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
        )
    }
}