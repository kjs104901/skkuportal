import React from 'react';
import $ from 'jquery'
import '../js/jquery.scrollbar.js'

const { ipcRenderer } = require('electron');

export default class CMain extends React.Component {
    state = {
        classListLoading: true,
        classList: [],
        classListError: false,
        classListErrorMessage: "",

        weatherLoading: true,
        weather: [],
        weatherError: false,
        weatherErrorMessage: "",
    }

    componentDidMount() {
        /// icampus
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

        /// weather
        ipcRenderer.send("weatherReq", true);
        ipcRenderer.on("weatherRes", (event, message) => {
            console.log(message.data);
            if (!message.err) {
                this.setState({
                    weatherLoading: false,
                    weather: message.data,
                    weatherError: false,
                });
            }
            else {
                this.setState({
                    weatherLoading: false,
                    weather: [],
                    weatherError: true,
                    weatherErrorMessage: message.errMessage
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
        ipcRenderer.removeAllListeners("icampusClassListRes");
        ipcRenderer.removeAllListeners("weatherRes");

        /// jQuery plugin - scroll 
        this.$el.scrollbar('destroy');
      }

    classListReload = () => {
        this.setState({
            classListLoading: true,
            classList: [],
            classListError: false,
            classListErrorMessage: "",
        });
        ipcRenderer.send("icampusClassListReq", true);
    }

    weatherReload = () => {
        this.setState({
            weatherLoading: true,
            weather: [],
            weatherError: false,
            weatherErrorMessage: "",
        });
        ipcRenderer.send("icampusClassListReq", true);
    }

    icampusRender = () => {
        if (this.state.classListLoading) {
            return (
                <div className="row no-gutters align-items-center justify-content-center" style={{ width: "100%", height: "200px" }}>
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
                        <div className="col-4" style={{ textAlign: "center" }}>
                            {classElement.name.substr(0, 6)}
                        </div>
                        <div className="col" style={{ textAlign: "right" }}>
                            {0 < classElement.recentNumbers.notification ? <i className='fa fa-circle fs-10 text-danger'></i> : ""}
                        </div>
                        <div className="col" style={{ textAlign: "center" }}>
                            {classElement.recentNumbers.notification + "/" + classElement.totalNumbers.notification}
                        </div>
                        <div className="col" style={{ textAlign: "right" }}>
                            {0 < classElement.recentNumbers.assignment ? <i className='fa fa-circle fs-10 text-danger'></i> : ""}
                        </div>
                        <div className="col" style={{ textAlign: "center" }}>
                            {classElement.recentNumbers.assignment + "/" + classElement.totalNumbers.assignment}
                        </div>
                        <div className="col" style={{ textAlign: "right" }}>
                            {0 < classElement.recentNumbers.resource ? <i className='fa fa-circle fs-10 text-danger'></i> : ""}
                        </div>
                        <div className="col" style={{ textAlign: "center" }}>
                            {classElement.recentNumbers.resource + "/" + classElement.totalNumbers.resource}
                        </div>
                    </div>
                );
            });

            if (this.state.classListError) {
                <div className="row no-gutters align-items-center justify-content-center" style={{ width: "100%", height: "200px" }}>
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
        if (this.state.weatherLoading) {
            return (
                <div className="row no-gutters align-items-center justify-content-center" style={{ width: "100%", height: "200px" }}>
                    <div className="col-8" style={{ textAlign: "center" }}>
                        <div className="progress-circle-indeterminate"></div>
                    </div>
                </div>
            );
        }
        else {
            if (this.state.classListError) {
                <div className="row no-gutters align-items-center justify-content-center" style={{ width: "100%", height: "200px" }}>
                    <div className="col-8" style={{ textAlign: "center" }}>
                        {this.state.classListErrorMessage}
                    </div>
                </div>
            }
            else {
                return (
                    <div className="row no-gutters align-items-center justify-content-center" style={{ width: "100%", height: "200px" }}>
                        <div className="col-12" style={{ textAlign: "center" }}>
                            {this.state.weather}
                        </div>
                    </div>
                )
            }
        }
    }

    render() {
        return (
            <div className="container-fluid padding-20">
                <div className="row no-gutters">
                    <div className="col-6 p-r-20">
                        <div className="card card-default card-condensed" style={{ height: "300px" }}>
                            <div className="card-header">
                                <div className="card-title">아이캠퍼스</div>

                                <div className="card-controls">
                                    <ul><li>
                                        <a href="#" onClick={this.classListReload}>
                                            <i className="card-icon card-icon-refresh"></i>
                                        </a>
                                    </li></ul>
                                </div>
                            </div>
                            <div className="card-body" ref={el => this.el = el}>
                                <div>
                                    {this.icampusRender()}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-6">
                        <div className="card card-default card-condensed" style={{ height: "300px" }}>
                            <div className="card-body">
                                {this.weatherRender()}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}