import React from 'react';

import BigCalendar from 'react-big-calendar'

import moment from 'moment';
import 'moment/locale/ko';

//BigCalendar.momentLocalizer(moment);
BigCalendar.setLocalizer(BigCalendar.momentLocalizer(moment));

import $ from 'jquery';
import '../js/jquery.scrollbar.js';

const { ipcRenderer, shell } = require('electron');

export default class CCalendar extends React.Component {
    state = {
        targetCalendar: 0,
        targetDate: new Date(),
        calendarList: []
    }

    componentDidMount() {
        const warningMessage = this.props.warningMessage;

        ipcRenderer.send("calendarReq", {
            calendar: this.state.targetCalendar,
            year: this.state.targetDate.getFullYear(),
            month: this.state.targetDate.getMonth() + 1
        });
        ipcRenderer.on("calendarRes", (event, message) => {
            if (!message.err) {
                let calendarList = [];
                message.data.forEach((calendar, index) => {
                    calendarList.push({
                        id: index,
                        title: calendar.title,
                        start: new Date(calendar.startDate),
                        end: new Date(calendar.endDate),
                    })
                });
                this.setState({
                    calendarList: calendarList
                });
            }
            else {
                warningMessage(message.errMessage);
                this.setState({
                    calendarList: []
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
        ipcRenderer.removeAllListeners("calendarRes");

        /// jQuery plugin - scroll 
        this.$el.scrollbar('destroy');
    }

    changeDate = (date) => {
        this.setState({
            targetDate: date
        })

        ipcRenderer.send("calendarReq", {
            calendar: this.state.targetCalendar,
            year: date.getFullYear(),
            month: date.getMonth() + 1
        });
    }

    changeCalendar = (target) => {
        this.setState({
            targetCalendar: target
        })

        ipcRenderer.send("calendarReq", {
            calendar: target,
            year: this.state.targetDate.getFullYear(),
            month: this.state.targetDate.getMonth() + 1
        });
    }

    contentRender = () => {
        return (
            <React.Fragment>
                <div className="row justify-content-end" style={{ height: "1px", overflow: "visible" }}>
                    <div className="col-auto">
                        <div className="btn-group btn-block">
                            <a href="#" onClick={() => { this.changeCalendar(0) }}
                                className={this.state.targetCalendar === 0 ? "btn btn-warning btn-sm" : "btn btn-sm"}>
                                학사일정
                                </a>
                            <a href="#" onClick={() => { this.changeCalendar(1) }}
                                className={this.state.targetCalendar === 1 ? "btn btn-warning btn-sm" : "btn btn-sm"}>
                                명륜학사
                                </a>
                            <a href="#" onClick={() => { this.changeCalendar(2) }}
                                className={this.state.targetCalendar === 2 ? "btn btn-warning btn-sm" : "btn btn-sm"}>
                                봉룡학사
                                </a>
                        </div>
                    </div>
                </div>
                <div style={{ height: "1000px" }}>
                    <BigCalendar
                        popup
                        events={this.state.calendarList}
                        defaultDate={this.state.targetDate}
                        views={['month']}
                        onNavigate={(date) => { this.changeDate(date) }}
                        localizer={moment}
                    />
                </div>
            </React.Fragment>
        )
    }

    render() {
        return (
            <React.Fragment>
                <div className="full-height" style={{ backgroundColor: "white" }}>
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