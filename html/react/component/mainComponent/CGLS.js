import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const { ipcRenderer } = require('electron');

const warningMessage = (errMessage) => {
    $('body').pgNotification({
        style: "circle",
        timeout: 2000,
        message: errMessage,
        type: "danger"
    }).show();
};

export default class CGLS extends React.Component {
    state = {
        menuIndex: 0,
        menuDetailed: -1,

        scoreListLoading: true,
        scoreList: [],
        scoreListError: false,
        scoreListErrorMessage: "",

        scoreLoading: false,
        score: [],
        scoreError: false,
        scoreErrorMessage: "",
    }

    componentDidMount() {
        ipcRenderer.send("scoreListReq", true);
        ipcRenderer.on("scoreListRes", (event, message) => {
            if (!message.err) {
                this.setState({
                    scoreListLoading: false,
                    scoreList: message.data,
                    scoreListErrorMessage: false,
                });
            }
            else {
                warningMessage(message.errMessage);
                this.setState({
                    scoreListLoading: false,
                    scoreList: [],
                    scoreListError: true,
                    scoreListErrorMessage: message.errMessage
                });
            }
        });
        ipcRenderer.on("scoreRes", (event, message) => {
            if (!message.err) {
                this.setState({
                    scoreLoading: false,
                    score: message.data,
                    scoreErrorMessage: false,
                });
            }
            else {
                warningMessage(message.errMessage);
                this.setState({
                    scoreLoading: false,
                    score: [],
                    scoreError: true,
                    scoreErrorMessage: message.errMessage
                });
            }
        });

        ipcRenderer.on("openGLSRes", (event, message) => {
            if (message.err) {
                warningMessage(message.errMessage);
                return;
            }
        });
    }

    componentWillUnmount() {
        ipcRenderer.removeAllListeners("scoreListRes");
        ipcRenderer.removeAllListeners("scoreRes");
        ipcRenderer.removeAllListeners("openGLSRes");
    }

    openGLSRequest = () => {
        ipcRenderer.send("openGLSReq", true);
    }

    menuSelect = (index) => {
        this.setState({
            menuIndex: index,
            menuDetailed: -1
        });
    }

    menuDetailedSelect = (index) => {
        if (this.state.menuIndex === 0 || this.state.menuIndex === 1) {
            ipcRenderer.send("scoreReq", {
                year: this.state.scoreList[index].year,
                semester: this.state.scoreList[index].semester
            });
            this.setState({
                menuDetailed: index,

                scoreLoading: true,
                score: [],
                scoreError: false,
                scoreErrorMessage: "",
            });
        }
    }

    contentRender = () => {
        if (this.state.menuIndex == 0) {
            if (this.state.scoreListLoading) {
                return (
                    <React.Fragment>
                        {this.contentLoadingRender()}
                    </React.Fragment>
                )
            }
            else {
                if (-1 < this.state.menuDetailed) {
                    if (this.state.scoreLoading) {
                        return (
                            <React.Fragment>
                                {this.contentLoadingRender()}
                            </React.Fragment>
                        )
                    }
                    else {
                        return (
                            <React.Fragment>
                                {this.contentScoreDetailRender()}
                            </React.Fragment>
                        )
                    }
                }
                else {
                    return (
                        <React.Fragment>
                            {this.contentScoreRender()}
                        </React.Fragment>
                    )
                }
            }
        }
        else if (this.state.menuIndex == 1) {
            if (this.state.scoreListLoading) {
                return (
                    <React.Fragment>
                        {this.contentLoadingRender()}
                    </React.Fragment>
                )
            }
            else {
                return (
                    <React.Fragment>
                        {this.contentScoreChartRender()}
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

    contentScoreRender = () => {
        let rows = [];
        rows.push(
            <div className="row no-gutters align-items-center" style={{ height: "36px" }} key={-1}>
                <p className="col-2 large-text no-margin text-center">년도</p>
                <p className="col-2 large-text no-margin text-center">학기</p>
                <p className="col-2 large-text no-margin text-center">총 학점</p>
                <p className="col-2 large-text no-margin text-center">평균 점수</p>
                <p className="col-2 large-text no-margin text-center">상위</p>
                <p className="col-1 large-text no-margin text-center">취소</p>
                <p className="col-1 large-text no-margin text-center">경고</p>
            </div>
        );
        (this.state.scoreList).forEach((score, index) => {
            let semesterStr = score.semester + "";
            if (score.semester == 10) { semesterStr = "1학기" }
            else if (score.semester == 15) { semesterStr = "여름" }
            else if (score.semester == 20) { semesterStr = "2학기" }
            else if (score.semester == 25) { semesterStr = "겨울" }

            let cancleStr = "";
            if (score.cancle) {
                cancleStr = (<i className="fas fa-ban"></i>);
            }

            let warningStr = "";
            if (score.warning) {
                warningStr = (<i className="fas fa-exclamation-circle"></i>);
            }

            rows.push(
                <a href="#" onClick={() => { this.menuDetailedSelect(index) }} key={index}>
                    <div className="row no-gutters align-items-center" style={{ height: "36px" }}>
                        <p className="col-2 large-text no-margin text-center">{score.year}</p>
                        <p className="col-2 large-text no-margin text-center">{semesterStr}</p>
                        <p className="col-2 large-text no-margin text-center">{score.hours} 학점</p>
                        <p className="col-2 large-text no-margin text-center">{score.average} 점</p>
                        <p className="col-2 large-text no-margin text-center">{score.percent}%</p>
                        <p className="col-1 large-text no-margin text-center">{cancleStr}</p>
                        <p className="col-1 large-text no-margin text-center">{warningStr}</p>
                    </div>
                </a>
            );
        });
        if (rows.length === 1) {
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

    contentScoreDetailRender = () => {
        let rows = [];
        rows.push(
            <div className="row no-gutters align-items-center" style={{ height: "36px" }} key={-1}>
                <p className="col-2 large-text no-margin text-center">학점</p>
                <p className="col-4 large-text no-margin text-center">교과목명</p>
                <p className="col-4 large-text no-margin text-center">교강사명</p>
                <p className="col-2 large-text no-margin text-center">등급</p>
            </div>
        );
        (this.state.score).forEach((classElement, index) => {
            rows.push(
                <div className="row no-gutters align-items-center" key={index} style={{ height: "36px" }}>
                    <p className="col-2 large-text no-margin text-center">{classElement.hours}</p>
                    <p className="col-4 large-text no-margin text-center">{classElement.name}</p>
                    <p className="col-4 large-text no-margin text-center">{classElement.professor}</p>
                    <p className="col-2 large-text no-margin text-center">{classElement.tier}</p>
                </div>
            );
        });

        if (rows.length === 1) {
            rows.push(
                <div className="col-12 " key="0" style={{ textAlign: "center", paddingTop: "230px" }}>
                    <h4>표시할 내용이 없습니다</h4>
                </div>
            )
        }

        return (
            <React.Fragment>
                <div className="row align-items-center no-gutters b-b" style={{ width: "100%", height: "40px" }}>
                    <div className="col-10" style={{ overflow: "auto" }}>
                    </div>
                    <div className="col-2" style={{ textAlign: "center" }}>
                        <a href="#" className="btn btn-block btn-compose"
                            onClick={() => { this.setState({ menuDetailed: -1 }) }}
                            style={{ backgroundColor: "#1B484F", color: "#FFD661" }}>
                            <i className="fas fa-arrow-left"></i>
                        </a>
                    </div>
                </div>
                {rows}
            </React.Fragment>
        );
    }

    contentScoreChartRender = () => {
        const data = [];

        (this.state.scoreList).forEach((score, index) => {
            let semesterStr = score.semester + "";
            if (score.semester == 10) { semesterStr = "1학기" }
            else if (score.semester == 15) { semesterStr = "여름" }
            else if (score.semester == 20) { semesterStr = "2학기" }
            else if (score.semester == 25) { semesterStr = "겨울" }

            if (0 < score.percent) {
                data.unshift({
                    name: score.year + " " + semesterStr,
                    score: score.average,
                    percent: 100 - score.percent
                })
            }
            else {
                data.unshift({
                    name: score.year + " " + semesterStr,
                    score: score.average
                })
            }
        });

        return (
            <LineChart width={580} height={530} data={data}
                margin={{ top: 50, right: 5, left: 5, bottom: 5 }}>
                <XAxis dataKey="name" />
                <YAxis
                    yAxisId="1"
                    allowDataOverflow={true}
                    domain={[0, 5]} />
                <YAxis
                    yAxisId="2"
                    orientation="right"
                    allowDataOverflow={true}
                    domain={[0, 100]} />
                <CartesianGrid />
                <Tooltip />
                <Legend />
                <Line yAxisId="1" type="monotone" dataKey="score" stroke="#8884d8" connectNulls={true} />
                <Line yAxisId="2" type="monotone" dataKey="percent" stroke="#82ca9d" connectNulls={true} />
            </LineChart>
        );
    }

    render() {
        return (
            <React.Fragment>
                <nav className="secondary-sidebar">
                    <div className=" m-b-20 m-l-10 m-r-10 d-sm-none d-md-block d-lg-block d-xl-block">
                        <a href="#" onClick={() => { this.openGLSRequest() }} className="btn btn-block btn-compose">GLS 실행</a>
                    </div>
                    <p className="menu-title" style={{ marginBottom: "0px", marginTop: "10px" }}>성적</p>
                    <ul className="main-menu">
                        <li className={this.state.menuIndex === 0 ? "active" : ""}>
                            <a href="#" onClick={() => { this.menuSelect(0) }}>
                                <span className="title"><i className="pg-inbox"></i> 학기별 성적</span>
                            </a>
                        </li>
                        <li className={this.state.menuIndex === 1 ? "active" : ""}>
                            <a href="#" onClick={() => { this.menuSelect(1) }}>
                                <span className="title"><i className="pg-inbox"></i> 성적 차트</span>
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
        )
    }
}