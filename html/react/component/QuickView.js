import React from 'react';

export default class QuickView extends React.Component {
    render() {
        return (
            <div id="quickview" className="quickview-wrapper" data-pages="quickview" style={{height:"70%"}}>
                <ul className="nav nav-tabs" role="tablist">
                    <li className="">
                        <a href="#quickview-notes" data-target="#quickview-notes" data-toggle="tab" role="tab">Notes</a>
                    </li>
                    <li>
                        <a href="#quickview-alerts" data-target="#quickview-alerts" data-toggle="tab" role="tab">Alerts</a>
                    </li>
                    <li className="">
                        <a href="#quickview-chat" data-target="#quickview-chat" data-toggle="tab" role="tab">Chat</a>
                    </li>
                </ul>

                <div className="tab-content">
                    <div className="tab-pane no-padding" id="quickview-notes">
                        <div className="view-port clearfix quickview-notes" id="note-views">
                            <h1>Hello 1</h1>
                        </div>
                    </div>

                    <div className="tab-pane no-padding" id="quickview-alerts">
                        <div className="view-port clearfix" id="alerts">
                            <h1>Hello 2</h1>
                        </div>
                    </div>

                    <div className="tab-pane no-padding active" id="quickview-chat">
                        <div className="view-port clearfix" id="chat">
                            <h1>Hello 3</h1>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}