import React from 'react';

const { ipcRenderer } = require('electron');

export default class CMail extends React.Component {
    state = {
        menuIndex: 0,
        menuDetailed: -1,

        mailTotalLoading: true,
        mailTotal: 0,
        mailTotalError: false,
        mailTotalErrorMessage: "",

        mail: []
    }

    componentDidMount() {
        const warningMessage = this.props.warningMessage;

        ipcRenderer.send("mailTotalReq", true);
        ipcRenderer.on("mailTotalRes", (event, message) => {
            if (!message.err) {
                this.setState({
                    mailTotalLoading: false,
                    mailTotal: message.data,
                    mailTotalError: false,
                });
            }
            else {
                warningMessage(message.errMessage);
                this.setState({
                    mailTotalLoading: false,
                    mailTotal: 0,
                    mailTotalError: true,
                    mailTotalErrorMessage: message.errMessage
                });
            }
        });

        ipcRenderer.on("mail", (event, message) => {
            if (!message.err) {
                this.setState({
                    mail: message.data.reverse()
                });
            }
        });

        ipcRenderer.on("openWebMailRes", (event, message) => {
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
        ipcRenderer.removeAllListeners("mailTotalRes");
        ipcRenderer.removeAllListeners("mail");
        ipcRenderer.removeAllListeners("openWebMailRes");
    }

    menuSelect = (index) => {
        this.setState({
            menuIndex: index,
            menuDetailed: -1,

            mailTotalLoading: true,
            mailTotal: 0,
            mailTotalError: false,
            mailTotalErrorMessage: "",
        })

        if (index === 0) {
            ipcRenderer.send("mailTotalReq", true);
        }
    }

    menuDetailedSelect = (index) => {
        this.setState({
            menuDetailed: index
        })
    }

    openWebMailRequest = () => {
        ipcRenderer.send("openWebMailReq", true);
    }

    mailFileDownloadRequest = (mailIndex, attachIndex, filename) => {
        mailIndex = this.state.mail.length - mailIndex;
        ipcRenderer.send("mailFileDownloadReq", {
            mailIndex: mailIndex,
            attachIndex: attachIndex,
            filename: filename
        });
    }

    contentLoadingRender = () => {
        return (
            <div className="row justify-content-center align-items-center no-gutters" style={{ width: "100%", height: "580px" }}>
                <div className="col-4" style={{ textAlign: "center" }}>
                    <div className="progress-circle-indeterminate"></div>
                </div>
            </div>
        );
    }

    emailListRender = () => {
        let rows = [];

        this.state.mail.forEach((mail, index) => {
            if (mail.title) {
                let attachments = [];
                mail.attachments.forEach((attach, attachIndex) => {
                    attachments.push(
                        <a href="#" key={attachIndex}
                            onClick={() => {
                                this.mailFileDownloadRequest(
                                    index,
                                    attachIndex,
                                    attach.filename
                                );
                            }}>
                            <i className="fas fa-file-download large-text" style={{ margin: "5px" }}></i>
                        </a>
                    )
                });
                let dateObj = new Date(mail.date);
                let dateStr = dateObj.getFullYear() + "-" + (dateObj.getMonth() + 1) + "-" + dateObj.getDate()
                dateStr += " ";
                dateStr += dateObj.getHours() + ":" + dateObj.getMinutes();

                rows.push(
                    <React.Fragment key={index}>
                        <div className="row no-gutters align-items-center " style={{ minHeight: "23px" }}>
                            <p className="col-3 large-text no-margin text-center">{dateStr}</p>
                            <p className="col-7 large-text no-margin text-center">{mail.from}</p>
                            <p className="col-2 large-text no-margin text-center">{attachments}</p>
                        </div>
                        <div className="row no-gutters align-items-center b-b" style={{ minHeight: "23px" }}>
                            <p className="col large-text no-margin p-l-20">
                                <a href="#" onClick={() => { this.menuDetailedSelect(index) }} key={index}>
                                    {mail.title}
                                </a>
                            </p>
                        </div>
                    </React.Fragment>
                );
            }
            else {
                rows.push(
                    <React.Fragment key={index}>
                        <div className="row no-gutters align-items-center b-b" style={{ minHeight: "46px" }}>
                            <div className="col no-margin text-center">
                                <div className="progress-circle-indeterminate"></div>
                            </div>
                        </div>
                    </React.Fragment>
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
                {rows}
            </React.Fragment>
        );
    }

    emailRender = () => {
        let targetMail = this.state.mail[this.state.menuDetailed];
        let attachments = [];
        if (targetMail.attachments.forEach) {
            (targetMail.attachments).forEach((attachment, index) => {
                attachments.push(
                    <React.Fragment key={index}>
                        <a href="#"
                            onClick={() => {
                                this.mailFileDownloadRequest(
                                    this.state.menuDetailed,
                                    index,
                                    attachment.filename
                                )
                            }}
                            style={{ marginRight: "10px" }}>

                            <i className="fas fa-file-download large-text" style={{ margin: "5px" }}></i>
                            <p className="large-text" style={{ display: "inline" }}>{attachment.filename}</p>
                        </a>
                    </React.Fragment>
                );
            });
        }

        let innderBody = targetMail.body;

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
                    dangerouslySetInnerHTML={{ __html: innderBody }} >
                </div>
            </React.Fragment>
        );
    }

    contentRender = () => {
        if (this.state.menuIndex === 0) {
            if (0 <= this.state.menuDetailed) {
                return (
                    <React.Fragment>
                        {this.emailRender()}
                    </React.Fragment>
                );
            }
            else {
                if (this.state.mailTotalLoading || this.state.mail.length === 0) {
                    return (
                        <React.Fragment>
                            {this.contentLoadingRender()}
                        </React.Fragment>
                    );
                }
                else {
                    return (
                        <React.Fragment>
                            {this.emailListRender()}
                        </React.Fragment>
                    );
                }
            }
        }
        else {
            return (
                <div className="row justify-content-center align-items-center no-gutters" style={{ width: "100%", height: "580px" }}>
                    <div className="col-4" style={{ textAlign: "center" }}>
                        <p className="large-text">Gmail은 지원 예정입니다</p>
                    </div>
                </div>
            );
        }
    }

    render() {
        return (
            <React.Fragment>
                <nav className="secondary-sidebar">
                    <div className=" m-b-20 m-l-10 m-r-10 d-sm-none d-md-block d-lg-block d-xl-block">
                        <a href="#" onClick={() => { this.openWebMailRequest() }} className="btn btn-block btn-compose">웹 메일</a>
                    </div>
                    <p className="menu-title" style={{ marginBottom: "0px", marginTop: "10px" }}>학교 메일</p>
                    <ul className="main-menu">
                        <li className={this.state.menuIndex === 0 ? "active" : ""}>
                            <a href="#" onClick={() => { this.menuSelect(0) }}>
                                <span className="title"><i className="pg-inbox"></i> 받은 메일함</span>
                            </a>
                        </li>
                    </ul>
                    <p className="menu-title" style={{ marginBottom: "0px", marginTop: "10px" }}>Gmail</p>
                    <ul className="main-menu">
                        <li className={this.state.menuIndex === 1 ? "active" : ""}>
                            <a href="#" onClick={() => { this.menuSelect(1) }}>
                                <span className="title"><i className="pg-inbox"></i> 받은 메일함</span>
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