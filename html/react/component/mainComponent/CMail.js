import React from 'react';

const { ipcRenderer } = require('electron');

const warningMessage = (errMessage) => {
    $('body').pgNotification({
        style: "circle",
        timeout: 2000,
        message: errMessage,
        type: "danger"
    }).show();
};

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
                    mail: message.data
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
        ipcRenderer.removeAllListeners("mailTotalRes");
        ipcRenderer.removeAllListeners("mail");
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

        let count = 0;
        let mailReversed = this.state.mail.reverse();
        mailReversed.forEach((mail, index) => {
            count += 1;
            if (10 < count) {return;}
            let attachments = [];
            mail.attachments.forEach((attach, attachIndex) => {
                attachments.push(
                    <a href="#" key={attachIndex}
                        onClick={() => {
                            this.mailFileDownloadRequest(index + 1, attachIndex)
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

    contentRender = () => {
        if (0 <= this.state.menuDetailed) {
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

    render() {
        return (
            <React.Fragment>
                <nav className="secondary-sidebar">
                    <div className=" m-b-20 m-l-10 m-r-10 d-sm-none d-md-block d-lg-block d-xl-block">
                        <a href="#" onClick={() => { this.openUnivNoticeRequest() }} className="btn btn-block btn-compose">학과 공지사항</a>
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