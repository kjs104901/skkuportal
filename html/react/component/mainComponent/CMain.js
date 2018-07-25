import React from 'react';

export default class CMain extends React.Component {
    state = {
        classListLoading: true,
        classList: [],
        classListError: false,
        classListErrorMessage: ""
    }

    componentDidMount() {
        ipcRenderer.send("icampusClassListReq", true);
        ipcRenderer.on("icampusClassListRes", (event, message) => {
            if (!message.err) {
                this.setState({
                    classList: message.data
                })
            }
        });
    }

    icampusRender = () => {
        if (this.state.classListLoading) {
            return (
                <div className="row align-items-center justify-content-center" style={{ height: "150px" }}>
                    <div className="col-8" style={{ textAlign: "center" }}>
                        <div className="progress-circle-indeterminate"></div>
                    </div>
                </div>
            );
        }
        else {
            let notificationRecent = 0;
            let assignmentRecent = 0;
            let resourceRecent = 0;
            let notificationSum = 0;
            let assignmentSum = 0;
            let resourceSum = 0;

            this.state.classList.forEach((classElement) => {
                notificationRecent += classElement.recentNumbers.notification;
            });

            if (this.state.classListError) {
                <div className="row align-items-center justify-content-center" style={{ height: "150px" }}>
                    <div className="col-8" style={{ textAlign: "center" }}>
                        {this.state.classListErrorMessage}
                    </div>
                </div>
            }
            else {
                return (
                    <React.Fragment>
                        <div className="row">
                            <div className="col-2" style={{ textAlign: "center" }}>
                                새
                            </div>
                            <div className="col-2" style={{ textAlign: "center" }}>
                                이
                            </div>
                            <div className="col-4" style={{ textAlign: "center" }}>
                                쪽지
                            </div>
                            <div className="col-4" style={{ textAlign: "center" }}>
                                11/23
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-2" style={{ textAlign: "center" }}>
                                새
                            </div>
                            <div className="col-2" style={{ textAlign: "center" }}>
                                이
                            </div>
                            <div className="col-4" style={{ textAlign: "center" }}>
                                공지
                            </div>
                            <div className="col-4" style={{ textAlign: "center" }}>
                                11/23
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-2" style={{ textAlign: "center" }}>
                                새
                            </div>
                            <div className="col-2" style={{ textAlign: "center" }}>
                                이
                            </div>
                            <div className="col-4" style={{ textAlign: "center" }}>
                                과제
                            </div>
                            <div className="col-4" style={{ textAlign: "center" }}>
                                11/23
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-2" style={{ textAlign: "center" }}>
                                새
                            </div>
                            <div className="col-2" style={{ textAlign: "center" }}>
                                이
                            </div>
                            <div className="col-4" style={{ textAlign: "center" }}>
                                자료
                            </div>
                            <div className="col-4" style={{ textAlign: "center" }}>
                                11/23
                            </div>
                        </div>
                    </React.Fragment>
                )
            }
        }
    }

    render() {
        return (
            <div className="container-fluid padding-20">
                <div className="row">
                    <div className="col-5">
                        <div className="card card-default card-condensed">
                            <div className="card-header">
                                <div className="card-title">아이캠퍼스</div>
                            </div>
                            <div className="card-body">
                                {this.icampusRender()}
                            </div>
                        </div>
                    </div>
                    <div className="col-7">
                        날씨 영역
                    </div>
                </div>
            </div>
        )
    }
}