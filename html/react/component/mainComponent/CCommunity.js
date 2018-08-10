import React from 'react';

import $ from 'jquery';
import '../js/jquery.scrollbar.js';

const { ipcRenderer, shell } = require('electron');

export default class CCommunity extends React.Component {

    componentDidMount() {
        /// jQuery plugin - scroll 
        this.$el = $(this.el)
        this.$el.scrollbar({
            ignoreOverlay: false
        });
    }

    componentWillUnmount() {

        /// jQuery plugin - scroll 
        this.$el.scrollbar('destroy');
    }

    openLink = (link) => {
        shell.openExternal(link);
    }

    contentRender = () => {
        return (
            <React.Fragment>
                <div className="container-fluid padding-20">
                    <div className="row no-gutters">
                        <div className="col-6 p-r-20">
                            <div className="card card-default card-condensed" style={{ height: "140px" }}>
                                <div className="card-body">
                                    <h3>대나무숲</h3>
                                    <p>페이스북 익명 제보 페이지</p>
                                    <a href="#" onClick={() => { this.openLink("https://www.facebook.com/SKKUBamboo/") }}>
                                        바로가기
                                    </a>
                                </div>
                            </div>
                        </div>
                        <div className="col-6">
                            <div className="card card-default card-condensed" style={{ height: "140px" }}>
                                <div className="card-body">
                                    <h3>에브리타임</h3>
                                    <p>시간표 사이트 커뮤니티</p>
                                    <a href="#" onClick={() => { this.openLink("https://everytime.kr/") }}>
                                        바로가기
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="row no-gutters m-t-20">
                        <div className="col-6 p-r-20">
                            <div className="card card-default card-condensed" style={{ height: "140px" }}>
                                <div className="card-body">
                                    <h3>성대사랑</h3>
                                    <p>성균관대 커뮤니티</p>
                                    <a href="#" onClick={() => { this.openLink("http://www.skkulove.com")}}>
                                        바로가기
                                    </a>
                                </div>
                            </div>
                        </div>
                        <div className="col-6">
                            <div className="card card-default card-condensed" style={{ height: "140px" }}>
                                <div className="card-body">
                                    <h3>스꾸족보</h3>
                                    <p>족보 모음 사이트</p>
                                    <a href="#" onClick={() => { this.openLink("https://skkujokbo.com/") }}>
                                        바로가기
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </React.Fragment>
        )
    }

    render() {
        return (
            <React.Fragment>
                <div className="full-height">
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