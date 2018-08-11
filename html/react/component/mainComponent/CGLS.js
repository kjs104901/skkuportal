import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const { ipcRenderer } = require('electron');

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

        semesterListLoading: true,
        semesterList: [],

        //search
        targetSemesterIndex: 0,
        searchStr: "",

        campusType: 1,
        searchType: 2,

        searchClassLoading: false,
        searchClass: [],
        searchClassError: false,
        searchClassErrorMessage: ""
    }

    componentDidMount() {
        const warningMessage = this.props.warningMessage;

        ipcRenderer.send("semesterListGLSReq", true);
        ipcRenderer.on("semesterListGLSRes", (event, message) => {
            if (!message.err) {
                this.setState({
                    semesterListLoading: false,
                    semesterList: message.data,
                });
            }
            else {
                warningMessage(message.errMessage);
            }
        })

        ipcRenderer.send("scoreListReq", true);
        ipcRenderer.on("scoreListRes", (event, message) => {
            if (!message.err) {
                this.setState({
                    scoreListLoading: false,
                    scoreList: message.data,
                    scoreListError: false,
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
                    scoreError: false,
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

        ipcRenderer.on("searchClassRes", (event, message) => {
            if (!message.err) {
                this.setState({
                    searchClassLoading: false,
                    searchClass: message.data,
                    searchClassError: false,
                    searchClassErrorMessage: false,
                });
            }
            else {
                warningMessage(message.errMessage);
                this.setState({
                    searchClassLoading: false,
                    searchClass: [],
                    searchClassError: true,
                    searchClassErrorMessage: message.errMessage
                });
            }
        })
    }

    componentWillUnmount() {
        ipcRenderer.removeAllListeners("scoreListRes");
        ipcRenderer.removeAllListeners("scoreRes");
        ipcRenderer.removeAllListeners("openGLSRes");
        ipcRenderer.removeAllListeners("semesterListGLSRes");
        ipcRenderer.removeAllListeners("searchClassRes");
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

    semesterChange = (value) => {
        this.setState({
            targetSemesterIndex: value
        })
    }

    campusTypeChange = (changeEvent) => {
        this.setState({
            campusType: changeEvent.target.value
        });
    }

    searchTypeChange = (changeEvent) => {
        this.setState({
            searchType: changeEvent.target.value
        });
    }

    stringChange = (event) => {
        this.setState({
            searchStr: event.target.value
        });
    }

    searchClass = () => {
        const targetSemester = this.state.semesterList[this.state.targetSemesterIndex];
        if (targetSemester) {
            if (0 < this.state.searchStr.length) {
                ipcRenderer.send("searchClassReq", {
                    campusType: this.state.campusType,
                    searchType: this.state.searchType,
                    searchStr: this.state.searchStr,
                    year: targetSemester.year,
                    semester: targetSemester.semester
                });

                this.setState({
                    searchClassLoading: true,
                    searchClass: [],
                    searchClassError: false,
                    searchClassErrorMessage: ""
                })
            }
            else {
                const warningMessage = this.props.warningMessage;
                warningMessage("검색 문자열이 비었습니다");
            }
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
        else if (this.state.menuIndex == 3) {
            if (this.state.semesterListLoading) {
                return (
                    <React.Fragment>
                        {this.contentLoadingRender()}
                    </React.Fragment>
                )
            }
            else {
                return (
                    <React.Fragment>
                        {this.contentSearchRender()}
                    </React.Fragment>
                )
            }
        }
        else {
            return (
                <div className="row justify-content-center align-items-center no-gutters" style={{ width: "100%", height: "580px" }}>
                    <div className="col-4" style={{ textAlign: "center" }}>
                        <p className="large-text">지원 예정입니다</p>
                    </div>
                </div>
            );
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
            <div className="row no-gutters align-items-center b-b" style={{ height: "36px" }} key={-1}>
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
                        <p className="col-2 large-text no-margin text-center">{0 < score.percent ? score.percent : "-"} %</p>
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

    contentSearchRender = () => {
        return (
            <React.Fragment>
                <div className="row align-items-center justify-content-center no-gutters" style={{ height: "40px", backgroundColor: "white" }}>
                    <div className="col-4">
                        <select
                            onChange={(i) => { this.semesterChange(i.target.value) }}>
                            {this.semesterListRender()}
                        </select>
                    </div>
                    <div className="col-7">
                        <form>
                            <div className="radio radio-warning no-margin">
                                <input type="radio" value={1}
                                    checked={this.state.searchType == 1 ? "checked" : ""}
                                    onChange={this.searchTypeChange}
                                    id="searchType1" />
                                <label htmlFor="searchType1">학수번호</label>

                                <input type="radio" value={2}
                                    checked={this.state.searchType == 2 ? "checked" : ""}
                                    onChange={this.searchTypeChange}
                                    id="searchType2" />
                                <label htmlFor="searchType2">교과목명</label>

                                <input type="radio" value={3}
                                    checked={this.state.searchType == 3 ? "checked" : ""}
                                    onChange={this.searchTypeChange}
                                    id="searchType3" />
                                <label htmlFor="searchType3">교강사명</label>
                            </div>
                        </form>
                    </div>
                </div>
                <div className="row align-items-center justify-content-center no-gutters" style={{ height: "40px", backgroundColor: "white" }}>
                    <div className="col-5">
                        <form>
                            <div className="radio radio-warning no-margin">
                                <input type="radio" value={1}
                                    checked={this.state.campusType == 1 ? "checked" : ""}
                                    onChange={this.campusTypeChange}
                                    id="campusM" />
                                <label htmlFor="campusM">명륜</label>

                                <input type="radio" value={2}
                                    checked={this.state.campusType == 2 ? "checked" : ""}
                                    onChange={this.campusTypeChange}
                                    id="campusY" />
                                <label htmlFor="campusY">율전</label>

                                <input type="radio" value={3}
                                    checked={this.state.campusType == 3 ? "checked" : ""}
                                    onChange={this.campusTypeChange}
                                    id="campusI" />
                                <label htmlFor="campusI">아이캠</label>
                            </div>
                        </form>
                    </div>
                    <div className="col-4">
                        <input type="text" onChange={this.stringChange}></input>
                    </div>
                    <div className="col-2">
                        <div className="btn btn-block" onClick={this.searchClass}>검색</div>
                    </div>
                </div>
                <div style={{ height: "510px", overflow: "auto" }}>
                    {this.searchResultRender()}
                </div>
            </React.Fragment>
        )
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

    searchResultRender = () => {
        if (this.state.searchClassLoading) {
            return (
                <div className="row justify-content-center align-items-center no-gutters" style={{ width: "100%", height: "400px" }}>
                    <div className="col-4" style={{ textAlign: "center" }}>
                        <div className="progress-circle-indeterminate"></div>
                    </div>
                </div>
            )
        }
        else {
            let rows = [];
            this.state.searchClass.forEach((classElement, index) => {
                rows.push(
                    <React.Fragment key={index}>
                        <div className="row justify-content-center align-items-center no-gutters b-t"
                            style={{textAlign: "center"}}>
                            <div className="col-2">{classElement.id}</div>
                            <div className="col-5">{classElement.name}</div>
                            <div className="col-1">{classElement.score}</div>
                            <div className="col-2">{classElement.professor}</div>
                        </div>
                        <div className="row justify-content-center align-items-center no-gutters"
                            style={{textAlign: "center"}}>
                            <div className="col-4">{classElement.kind}</div>
                            <div className="col-7">{classElement.time}</div>
                        </div>
                        <div className="row justify-content-center align-items-center no-gutters m-b-20"
                            style={{textAlign: "center"}}>
                            <div className="col-10">{classElement.target}</div>
                        </div>
                    </React.Fragment>
                )
            })
            if (rows.length === 0) {
                rows.push(
                    <div className="row justify-content-center align-items-center no-gutters" key={0} style={{ width: "100%", height: "400px" }}>
                        <div className="col-6" style={{ textAlign: "center" }}>
                            표시할 내용이 없습니다
                        </div>
                    </div>
                )
            }
            return (
                <React.Fragment>
                    {rows}
                </React.Fragment>
            )
        }
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
                                <span className="title"><i className="far fa-star"></i> 학기별 성적</span>
                            </a>
                        </li>
                        <li className={this.state.menuIndex === 1 ? "active" : ""}>
                            <a href="#" onClick={() => { this.menuSelect(1) }}>
                                <span className="title"><i className="fas fa-chart-line"></i> 성적 차트</span>
                            </a>
                        </li>
                    </ul>
                    <p className="menu-title" style={{ marginBottom: "0px", marginTop: "10px" }}>수업</p>
                    <ul className="main-menu">
                        <li className={this.state.menuIndex === 2 ? "active" : ""}>
                            <a href="#" onClick={() => { this.menuSelect(2) }}>
                                <span className="title"><i className="fas fa-table"></i> 주간 테이블</span>
                            </a>
                        </li>
                        <li className={this.state.menuIndex === 3 ? "active" : ""}>
                            <a href="#" onClick={() => { this.menuSelect(3) }}>
                                <span className="title"><i className="fas fa-list"></i> 전자 시간표</span>
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