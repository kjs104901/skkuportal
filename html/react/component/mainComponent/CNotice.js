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

export default class CNotice extends React.Component {
    state = {
        menuIndex: 0,
        menuDetailed: -1,

        noticeListLoading: true,
        noticeList: [],
        noticeListOffset: 0,
        noticeListLast: 0,
        noticeListError: false,
        noticeListErrorMessage: "",

        noticeLoading: false,
        notice: {},
        noticeLast: 0,
        noticeError: false,
        noticeErrorMessage: ""
    }

    componentDidMount() {
        ipcRenderer.send("noticeListReq", {
            type: 1,
            offset: 0
        });

        ipcRenderer.on("noticeListRes", (event, message) => {
            if (!message.err) {
                this.setState({
                    noticeListLoading: false,
                    noticeList: message.data.list,
                    noticeListLast: message.data.last,
                    noticeListError: false,
                });
            }
            else {
                warningMessage(message.errMessage);
                this.setState({
                    noticeListLoading: false,
                    noticeList: [],
                    noticeListOffset: 0,
                    noticeListLast: 0,
                    noticeListError: true,
                    scoreListErrorMessage: message.errMessage
                });
            }
        });

        ipcRenderer.on("noticeRes", (event, message) => {
            if (!message.err) {
                this.setState({
                    noticeLoading: false,
                    notice: message.data,
                    noticeError: false,
                });
            }
            else {
                warningMessage(message.errMessage);
                this.setState({
                    noticeLoading: false,
                    notice: {},
                    noticeError: true,
                    scoreLrrorMessage: message.errMessage
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
        ipcRenderer.removeAllListeners("noticeListRes");
        ipcRenderer.removeAllListeners("noticeRes");
    }

    menuSelect = (index) => {
        this.setState({
            menuIndex: index,
            menuDetailed: -1,

            noticeListLoading: true,
            noticeList: [],
            noticeListOffset: 0,
            noticeListLast: 0,
            noticeListError: false,
            noticeListErrorMessage: "",
        })

        ipcRenderer.send("noticeListReq", {
            type: index + 1,
            offset: 0
        });
    }

    pageSelect = (index) => {
        this.setState({
            noticeListLoading: true,
            noticeList: [],
            noticeListOffset: index,
            noticeListLast: 0,
            noticeListError: false,
            noticeListErrorMessage: "",
        });

        ipcRenderer.send("noticeListReq", {
            type: this.state.menuIndex + 1,
            offset: index
        });
    }

    menuDetailedSelect = (index) => {
        this.setState({
            menuDetailed: index,

            noticeLoading: true,
            notice: {},
            noticeLast: 0,
            noticeError: false,
            noticeErrorMessage: "",
        })

        const detailedURL = this.state.noticeList[index].url;
        ipcRenderer.send("noticeReq", {
            type: this.state.menuIndex + 1,
            url: detailedURL
        });
    }

    fileDownloadRequest = (url, name) => {
        ipcRenderer.send("fileDownload", {
            url: url,
            name: name
        })
    }

    openUnivNoticeRequest = () => {
        ipcRenderer.send("openUnivNoticeRequest", true);
    }

    noticeMenuRender = () => {
        let returnList = [];
        const noticeMenuList = ["전체", "학사", "입학", "취업", "채용/모집", "장학", "행사/세미나", "일반"];
        noticeMenuList.forEach((noticeMenu, index) => {
            returnList.push(
                <li className={this.state.menuIndex === index ? "active" : ""} key={index}>
                    <a href="#" onClick={() => { this.menuSelect(index) }}>
                        <span className="title"><i className="fas fa-bullhorn"></i> {noticeMenu}</span>
                    </a>
                </li>
            );
        });
        return (
            <React.Fragment>
                {returnList}
            </React.Fragment>
        )
    }

    domNoticeMenuRender = () => {
        return (
            <React.Fragment>
                <li className={this.state.menuIndex === 8 ? "active" : ""}>
                    <a href="#" onClick={() => { this.menuSelect(8) }}>
                        <span className="title"><i className="fas fa-bullhorn"></i> 명륜학사(인사)</span>
                    </a>
                </li>
                <li className={this.state.menuIndex === 9 ? "active" : ""}>
                    <a href="#" onClick={() => { this.menuSelect(9) }}>
                        <span className="title"><i className="fas fa-bullhorn"></i> 봉룡학사(자과)</span>
                    </a>
                </li>
            </React.Fragment>
        )
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

    noticeListRender = () => {
        let rowsPage = [];
        let noticePerPage = 10;
        if (this.state.menuIndex === 9) {
            noticePerPage = 30;
        }
        let noticePerGroup = noticePerPage * 10;

        const startNumber = Math.floor(this.state.noticeListOffset / noticePerGroup)

        if (0 < startNumber * noticePerGroup - noticePerPage) {
            rowsPage.push(
                <div className="btn btn-sm" key={-1} onClick={() => { this.pageSelect(startNumber * noticePerGroup - noticePerPage) }}>
                    {"<"}
                </div>
            )
        }

        for (let index = 0; index < 10; index++) {
            const itemNumber = startNumber * noticePerGroup + index * noticePerPage;
            if (itemNumber <= this.state.noticeListLast) {
                let classN = "btn btn-sm";
                if (itemNumber === this.state.noticeListOffset) {
                    classN = "btn btn-sm btn-info";
                }

                rowsPage.push(
                    <div className={classN} key={index} onClick={() => { this.pageSelect(itemNumber) }}>
                        {startNumber * 10 + index * 1 + 1}
                    </div>
                )
            }
        }

        if (startNumber * noticePerGroup + noticePerGroup <= this.state.noticeListLast) {
            rowsPage.push(
                <div className="btn btn-sm" key={99} onClick={() => { this.pageSelect(startNumber * noticePerGroup + noticePerGroup) }}>
                    {">"}
                </div>
            )
        }


        let rows = [];
        this.state.noticeList.forEach((notice, index) => {
            let attachment = [];
            if (this.state.menuIndex < 8) {
                notice.attachment.forEach((attach, index) => {
                    attachment.push(
                        <a href="#" key={index}
                            onClick={() => {
                                this.fileDownloadRequest(
                                    attach.url,
                                    attach.name
                                )
                            }}>
                            <i className="fas fa-file-download large-text" style={{ margin: "5px" }}></i>
                        </a>
                    )
                });
            }
            else {
                if (notice.attachment) {
                    attachment.push(
                        <i key={0} className="fas fa-file-download large-text" style={{ margin: "5px" }}></i>
                    )
                }
            }

            let classN2 = "row no-gutters align-items-center b-b";
            if(notice.no < 0) {
                classN2 = "row no-gutters align-items-center b-b bg-warning";
            }

            rows.push(
                <div className={classN2}
                    key={index} style={{ minHeight: "46px" }}>
                    <p className="col-2 large-text no-margin text-center">{notice.date}</p>
                    <p className="col-8 large-text no-margin text-center">
                        <a href="#" onClick={() => { this.menuDetailedSelect(index) }} key={index}>
                            {notice.title}
                        </a>
                    </p>
                    <p className="col-2 large-text no-margin text-center">{attachment}</p>
                </div>
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
                <div className="row justify-content-center p-b-10 b-b" style={{width: "100%"}}>
                    <div className="row justify-content-center btn-group">
                        {rowsPage}
                    </div>
                </div>
                {rows}
            </React.Fragment>
        );
    }

    noticeRender = () => {
        let attachments = [];
        if (this.state.notice.attachment.forEach) {
            (this.state.notice.attachment).forEach((attachment, index) => {
                attachments.push(
                    <React.Fragment key={index}>
                    <a href="#"
                        onClick={()=>{this.fileDownloadRequest(
                            attachment.url, 
                            attachment.name)}}
                        style={{marginRight: "10px"}}>

                        <i className="fas fa-file-download large-text" style={{ margin: "5px" }}></i>
                        <p className="large-text" style={{display: "inline"}}>{attachment.name}</p>
                    </a>
                     </React.Fragment>
                );
            });
        }

        return (
            <React.Fragment>
                <div className="row align-items-center no-gutters b-b" style={{ width: "100%", height: "40px" }}>
                    <div className="col-10" style={{overflow: "auto"}}>
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
                    dangerouslySetInnerHTML={{ __html: this.state.notice.body.replace(/href/, 'h') }} >
                </div>
            </React.Fragment>
        );
    }

    contentRender = () => {
        if (0 <= this.state.menuDetailed) {
            if (this.state.noticeLoading) {
                return (
                    <React.Fragment>
                        {this.contentLoadingRender()}
                    </React.Fragment>
                );
            }
            else {
                return (
                    <React.Fragment>
                        {this.noticeRender()}
                    </React.Fragment>
                );
            }
        }
        else {
            if (this.state.noticeListLoading) {
                return (
                    <React.Fragment>
                        {this.contentLoadingRender()}
                    </React.Fragment>
                );
            }
            else {
                return (
                    <React.Fragment>
                        {this.noticeListRender()}
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
                    <p className="menu-title" style={{ marginBottom: "0px", marginTop: "10px" }}>공지사항</p>
                    <ul className="main-menu">
                        {this.noticeMenuRender()}
                    </ul>
                    <p className="menu-title" style={{ marginBottom: "0px", marginTop: "10px" }}>기숙사 공지</p>
                    <ul className="main-menu">
                        {this.domNoticeMenuRender()}
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