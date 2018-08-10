import React from 'react';

import $ from 'jquery';
import '../js/jquery.scrollbar.js';

const { ipcRenderer } = require('electron');

export default class CMeal extends React.Component {
    state = {
        menuIndex: 0,
        menuCategoryIndex: "",

        targetDate: new Date(),

        resturantLoading: true,
        resturant: [],
        resturantError: false,
        resturantErrorMessage: "",

        mealListLoading: false,
        mealList: [],
        mealListError: false,
        mealListErrorMessage: "",
    }

    componentDidMount() {
        const warningMessage = this.props.warningMessage;
        
        ipcRenderer.send("resturantReq", true);
        ipcRenderer.on("resturantRes", (event, message) => {
            if (!message.err) {
                this.setState({
                    resturantLoading: false,
                    mealListLoading: true,

                    menuIndex: message.data.initialResturant,
                    menuCategoryIndex: message.data.currentCategory,

                    resturant: message.data.restaurantList,
                });

                const initialResturant = message.data.restaurantList[message.data.initialResturant];
                const currentYear = this.state.targetDate.getFullYear();
                const currentMonth = this.state.targetDate.getMonth() + 1;
                const currentDate = this.state.targetDate.getDate();
                ipcRenderer.send("mealListReq", {
                    resturant: initialResturant,
                    category: message.data.currentCategory,
                    year: currentYear,
                    month: currentMonth,
                    day: currentDate
                });
            }
            else {
                warningMessage(message.errMessage);
            }
        });

        ipcRenderer.on("mealListRes", (event, message) => {
            if (!message.err) {
                this.setState({
                    mealListLoading: false,
                    mealList: message.data,
                    mealListError: false,
                    mealListErrorMessage: "",
                });
            }
            else {
                warningMessage(message.errMessage);
                this.setState({
                    mealListLoading: false,
                    mealList: [],
                    mealListError: true,
                    mealListErrorMessage: message.errMessage,
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
        ipcRenderer.removeAllListeners("mealListRes");
        ipcRenderer.removeAllListeners("resturantRes");
    }

    menuSelect = (menuIndex) => {
        this.setState({
            mealListLoading: true,
            menuIndex: menuIndex
        });

        ipcRenderer.send("mealListReq", {
            resturant: this.state.resturant[menuIndex],
            category: this.state.menuCategoryIndex,
            year: this.state.targetDate.getFullYear(),
            month: this.state.targetDate.getMonth() + 1,
            day: this.state.targetDate.getDate()
        });
    }

    changeCategory = (categoryIndex) => {
        this.setState({
            mealListLoading: true,
            menuCategoryIndex: categoryIndex
        });

        ipcRenderer.send("mealListReq", {
            resturant: this.state.resturant[this.state.menuIndex],
            category: categoryIndex,
            year: this.state.targetDate.getFullYear(),
            month: this.state.targetDate.getMonth() + 1,
            day: this.state.targetDate.getDate()
        });
    }

    changeDate = (dayMove) => {
        let newDate = new Date(this.state.targetDate);
        const dayOfMonth = newDate.getDate();
        newDate.setDate(dayOfMonth + dayMove);

        this.setState({
            mealListLoading: true,
            targetDate: newDate
        });

        ipcRenderer.send("mealListReq", {
            resturant: this.state.resturant[this.state.menuIndex],
            category: this.state.menuCategoryIndex,
            year: newDate.getFullYear(),
            month: newDate.getMonth() + 1,
            day: newDate.getDate()
        });
    }

    resturantRender = () => {
        let rows = [];
        for (let index = 0; index < 3; index++) {
            if (index === 0) {
                rows.push(
                    <p className="menu-title" key={1000} style={{ marginBottom: "0px", marginTop: "10px" }}>
                        명륜 캠퍼스
                    </p>
                )
            }
            if (index === 1) {
                rows.push(
                    <p className="menu-title" key={2000} style={{ marginBottom: "0px", marginTop: "10px" }}>
                        율전 캠퍼스
                    </p>
                )
            }
            if (index === 2) {
                rows.push(
                    <p className="menu-title" key={3000} style={{ marginBottom: "0px", marginTop: "10px" }}>
                        기숙사
                    </p>
                )
            }

            let list = [];
            this.state.resturant.forEach((rest, restIndex) => {
                if (rest.campusType === index || (index === 2 && rest.campusType === 3)) {
                    list.push(
                        <li className={this.state.menuIndex === restIndex ? "active" : ""} key={restIndex}>
                            <a href="#" onClick={() => { this.menuSelect(restIndex) }}>
                                <span className="title"><i className="fas fa-utensils"></i> {rest.name}</span>
                            </a>
                        </li>
                    )
                }
            });

            rows.push(
                <ul className="main-menu" key={index}>
                    {list}
                </ul>
            )
        }

        return (
            <React.Fragment>
                {rows}
            </React.Fragment>
        )
    }

    contentRender = () => {
        if (this.state.resturantLoading || this.state.mealListLoading) {
            return (
                <React.Fragment>
                    {this.contentLoadingRender()}
                </React.Fragment>
            )
        }
        else {
            return (
                <React.Fragment>
                    {this.mealRender()}
                </React.Fragment>
            )
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

    mealRender = () => {
        let rows = [];

        this.state.mealList.forEach((meal, index) => {
            let menuArr = [];
            meal.menuList.forEach((menu, index) => {
                menuArr.push(
                    <p key={index}>{menu}</p>
                )
            })

            let price = "-원";
            if (meal.price) {
                price = meal.price + "원";
            }
            rows.push(
                <div className="col-6 p-r-10 p-t-10" key={index}>
                    <div className="card card-default card-condensed">
                        <div className="card-header">
                            <div className="card-title">{meal.cornerName}</div>
                            <div className="card-controls">{price}</div>
                        </div>
                        <div className="card-body">
                            {menuArr}
                        </div>
                    </div>
                </div>
            )
        })

        if (rows.length === 0) {
            rows.push(
                <div className="row justify-content-center align-items-center no-gutters" key={0} style={{ width: "100%", height: "500px" }}>
                    <div className="col-4" style={{ textAlign: "center" }}>
                        <p className="large-text m-t-20">메뉴가 없습니다</p>
                    </div>
                </div>
            );
        }

        return (
            <div className="row no-gutters" style={{ paddingLeft: "10px" }}>
                {rows}
            </div>
        )
    }

    render() {
        const left = "<";
        const right = ">";

        const month = this.state.targetDate.getMonth()+1;
        const day = this.state.targetDate.getDate();
        const year = this.state.targetDate.getFullYear();

        return (
            <React.Fragment>
                <nav className="secondary-sidebar">
                    <div className=" m-b-20 m-l-10 m-r-10 d-sm-none d-md-block d-lg-block d-xl-block">
                        <div className="btn-group btn-block">
                            <a href="#" onClick={() => { this.changeCategory("B") }}
                                className={this.state.menuCategoryIndex === "B" ? "btn btn-warning btn-xs" : "btn btn-xs"}>
                                아침
                            </a>
                            <a href="#" onClick={() => { this.changeCategory("L") }}
                                className={this.state.menuCategoryIndex === "L" ? "btn btn-warning btn-xs" : "btn btn-xs"}>
                                점심
                            </a>
                            <a href="#" onClick={() => { this.changeCategory("D") }}
                                className={this.state.menuCategoryIndex === "D" ? "btn btn-warning btn-xs" : "btn btn-xs"}>
                                저녁
                            </a>
                        </div>
                    </div>
                    {this.resturantRender()}
                </nav>
                <div className="inner-content full-height">
                    <div style={{ width: "100%", height: "40px" }}>
                        <div className="row no-gutters justify-content-center">
                            <div className="col-1" style={{ textAlign: "center" }}>
                                <a href="#" onClick={() => { this.changeDate(-1) }}
                                    className="btn btn-block">{left}</a>
                            </div>
                            <div className="col-4" style={{ textAlign: "center" }}>
                                <h4 className="no-margin">{ year + '-' + month + '-' + day }</h4>
                            </div>
                            <div className="col-1" style={{ textAlign: "center" }}>
                                <a href="#" onClick={() => { this.changeDate(1) }}
                                    className="btn btn-block">{right}</a>
                            </div>
                        </div>
                    </div>
                    <div ref={el => this.el = el}>
                        <div style={{ width: "100%", height: "550px" }}>
                            {this.contentRender()}
                        </div>
                    </div>
                </div>
            </React.Fragment>
        );
    }
}