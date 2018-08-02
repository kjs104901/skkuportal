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


    }

    componentDidMount() {
    }

    componentWillUnmount() {
    }

    menuSelect = (index) => {
        this.setState({
            menuIndex: index
        })
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

    contentRender = () => {
        return (
            <React.Fragment>
            </React.Fragment>
        )
    }

    render() {
        return (
            <React.Fragment>
                <nav className="secondary-sidebar">
                    <div className=" m-b-20 m-l-10 m-r-10 d-sm-none d-md-block d-lg-block d-xl-block">
                        <a href="#" onClick={() => { this.openGLSRequest() }} className="btn btn-block btn-compose">학과 공지사항</a>
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