import React from 'react';

import $ from 'jquery';
import '../js/jquery.scrollbar.js';

const { ipcRenderer } = require('electron');

export default class CQna extends React.Component {
    state = {
        menuIndex: 0
    }

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
    
    menuSelect = () => {

    }

    contentRender = () => {
        return (
            <React.Fragment>
                <iframe src="http://kingo.skku.edu/chat" style={{width:"100%", height:"580px"}}/>
            </React.Fragment>
        )
    }

    render() {
        return (
            <React.Fragment>
                <nav className="secondary-sidebar">
                    <p className="menu-title" style={{ marginBottom: "0px", marginTop: "10px" }}>임시 메뉴</p>
                    <ul className="main-menu">
                        <li className={this.state.menuIndex === 0 ? "active" : ""}>
                            <a href="#" onClick={() => { this.menuSelect(0) }}>
                                <span className="title"><i className="fas fa-robot"></i> 킹고봇</span>
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
        );
    }
}