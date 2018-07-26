import React from 'react';

const { ipcRenderer } = require('electron');

export default class CMain extends React.Component {
    state = {
        classListLoading: true,
        classList: [],
        classListError: false,
        classListErrorMessage: "",

        weatherLoading: true,
        weather: [],

    }

    componentDidMount() {
        ipcRenderer.send("icampusClassListReq", true);
        ipcRenderer.on("icampusClassListRes", (event, message) => {
            if (!message.err) {
                this.setState({
                    classListLoading: false,
                    classList: message.data,
                    classListError: false,
                });
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
    }

    componentWillUnmount() {
        ipcRenderer.removeAllListeners("icampusClassListRes");
    }

    icampusRender = () => {
        if (this.state.classListLoading) {
            return (
                <div className="row align-items-center justify-content-center" style={{ minHeight: "150px" }}>
                    <div className="col-8" style={{ textAlign: "center" }}>
                        <div className="progress-circle-indeterminate"></div>
                    </div>
                </div>
            );
        }
        else {
            let rows = [];
            this.state.classList.forEach((classElement, index) => {
                rows.push(
                    <div className="row no-gutters m-t-10" key={index}>
                        <div className="col-4" style={{ textAlign: "center"}}>
                            {classElement.name.substr(0,6)}
                        </div>
                        <div className="col" style={{ textAlign: "right" }}>
                            {0<classElement.recentNumbers.notification? <i className='fa fa-circle fs-10 text-danger'></i>:""}
                        </div>
                        <div className="col" style={{ textAlign: "center" }}>
                            {classElement.recentNumbers.notification + "/" + classElement.totalNumbers.notification}
                        </div>
                        <div className="col" style={{ textAlign: "right" }}>
                            {0<classElement.recentNumbers.assignment? <i className='fa fa-circle fs-10 text-danger'></i>:""}
                        </div>
                        <div className="col" style={{ textAlign: "center" }}>
                            {classElement.recentNumbers.assignment + "/" + classElement.totalNumbers.assignment}
                        </div>
                        <div className="col" style={{ textAlign: "right" }}>
                            {0<classElement.recentNumbers.resource? <i className='fa fa-circle fs-10 text-danger'></i>:""}
                        </div>
                        <div className="col" style={{ textAlign: "center" }}>
                            {classElement.recentNumbers.resource + "/" + classElement.totalNumbers.resource}
                        </div>
                    </div>
                );
            });

            if (this.state.classListError) {
                <div className="row align-items-center justify-content-center">
                    <div className="col-8" style={{ textAlign: "center" }}>
                        {this.state.classListErrorMessage}
                    </div>
                </div>
            }
            else {
                return (
                    <React.Fragment>
                        <div className="row no-gutters">
                            <div className="col-4" style={{ textAlign: "center" }}>
                                <i className="fas fa-bars"></i>
                                &nbsp; &nbsp;과목
                            </div>
                            <div className="col" style={{ textAlign: "right" }}>
                                <i className="fas fa-exclamation"></i>
                                &nbsp; &nbsp;공지
                            </div>
                            <div className="col" style={{ textAlign: "right" }}>
                                <i className="fas fa-home"></i>
                                &nbsp; &nbsp;과제
                            </div>
                            <div className="col" style={{ textAlign: "right" }}>
                                <i className="fas fa-save"></i>
                                &nbsp; &nbsp;자료
                            </div>
                        </div>
                        {rows}
                    </React.Fragment>
                )
            }
        }
    }

    weatherRender = () => {

    }

    render() {
        return (
            <div className="container-fluid padding-20">
                <div className="row">
                    <div className="col-6">
                        <div className="card card-default card-condensed">
                            <div className="card-header">
                                <div className="card-title">아이캠퍼스</div>
                            </div>
                            <div className="card-body" style={{ minHeight: "150px" }}>
                                {this.icampusRender()}
                            </div>
                        </div>
                    </div>
                    <div className="col-6">
                        <div className="card card-default card-condensed">
                            <div className="card-header">
                                <div className="card-title">아이캠퍼스</div>
                            </div>
                            <div className="card-body" style={{ minHeight: "150px" }}>
                                {this.weatherRender()}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}