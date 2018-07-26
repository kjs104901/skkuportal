import React from 'react';
import Skycons from 'react-skycons'
import $ from 'jquery';
import '../js/jquery.scrollbar.js';

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
        ipcRenderer.send("weatherReq", true);
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

    weatherItemRender = (weather) => {
        const currentSkyStr = getSkyString(weather.hour, weather.sky, weather.prec, weather.windSpeed);

        let style = { textAlign: "center" };
        if (weather.day === 1) {
            style.backgroundColor = "#F0F0F0";
        }

        return (
            <div className="col" style={style}>
                <h6>{weather.hour}시</h6>
                <Skycons
                    color='black'
                    icon={currentSkyStr}
                    style={{ width: "100%", height: "auto" }}
                />
                <h5 className="text-danger no-margin">{weather.currentTemp}°</h5>
                <i className="fas fa-umbrella"></i>
                <h6 className="no-margin">{weather.precPercent}%</h6>
            </div>
        )
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
            if (this.state.weatherError) {
                <div className="row no-gutters align-items-center justify-content-center" style={{ width: "100%", height: "200px" }}>
                    <div className="col-8" style={{ textAlign: "center" }}>
                        {this.state.classListErrorMessage}
                    </div>
                </div>
            }
            else {
                const currentDate = new Date(this.state.weather.date);
                const weekdayNameList = new Array('일', '월', '화', '수', '목', '금', '토');

                const weekdayName = weekdayNameList[currentDate.getDay()] + "요일";
                const dateStr = currentDate.getMonth() + "월 " + currentDate.getDate() + "일"

                const weatherList = this.state.weather.weather;

                const currentTemp = weatherList[0].currentTemp;
                const currentWind = weatherList[0].windSpeed;
                const currentHumidity = weatherList[0].humidity;

                console.log("weatherList", weatherList)

                const currentSkyStr = getSkyString(currentDate.getHours() + 1.5, weatherList[0].sky, weatherList[0].prec, weatherList[0].windSpeed);


                return (
                    <React.Fragment>
                        <div className="row no-gutters align-items-center  justify-content-between" style={{ width: "100%", height: "80px" }}>
                            <div className="col-6 m-l-20">
                                <h4 className="no-margin" style={{ display: "inline" }}>{weekdayName} </h4>
                                <p className="small hint-text" style={{ display: "inline" }}> {dateStr}</p>
                                <div className="row no-gutters m-t-10">
                                    <div className="col-4">
                                        <p className="small hint-text no-margin">온도</p>
                                        <h6 className="text-danger bold no-margin">{currentTemp}°</h6>
                                    </div>
                                    <div className="col-4">
                                        <p className="small hint-text no-margin">바람</p>
                                        <h6 className="text-success bold no-margin">{currentWind}㎧</h6>
                                    </div>
                                    <div className="col-4">
                                        <p className="small hint-text no-margin">습도</p>
                                        <h6 className="text-complete bold no-margin">{currentHumidity}%</h6>
                                    </div>
                                </div>
                            </div>
                            <div className="col-5" style={{ textAlign: "center" }}>
                                <Skycons
                                    color='black'
                                    icon={currentSkyStr}
                                    style={{ width: "100%", height: "auto" }}
                                />
                            </div>
                        </div>
                        <div className="row no-gutters m-t-10 b-grey b-t">
                            {this.weatherItemRender(weatherList[1])}
                            {this.weatherItemRender(weatherList[2])}
                            {this.weatherItemRender(weatherList[3])}
                            {this.weatherItemRender(weatherList[4])}
                            {this.weatherItemRender(weatherList[5])}
                        </div>
                    </React.Fragment>
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
                            <div className="card-header">
                                <div className="card-title">
                                    <i className="pg-map"></i> 수원시 장안구
                                </div>
                                <div className="card-controls">
                                    <ul><li>
                                        <a href="#" onClick={this.weatherReload}>
                                            <i className="card-icon card-icon-refresh"></i>
                                        </a>
                                    </li></ul>
                                </div>
                            </div>
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


const getSkyString = (time, sky, prec, wind) => {
    let dayNight = false;
    if (7 <= time && time <= 18) {
        dayNight = true;
    }

    let skyString = "CLEAR_DAY";
    if (dayNight) {
        skyString = "CLEAR_DAY";
        if (sky === 2) {
            skyString = "PARTLY_CLOUDY_DAY";
        }
    }
    else {
        skyString = "CLEAR_NIGHT";
        if (sky === 2) {
            skyString = "PARTLY_CLOUDY_NIGHT";
        }
    }
    if (sky === 3 || sky === 4) {
        skyString = "CLOUDY";
    }
    if (14 <= wind) {
        skyString = "WIND";
    }

    if (prec === 1 || prec === 2) {
        skyString = "RAIN";
    }
    else if (prec === 3 || prec === 4) {
        skyString = "SNOW";
    }
    return skyString;
}