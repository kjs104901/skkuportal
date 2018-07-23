import React from 'react';

export default class MainContent extends React.Component {
    render() {
        let menuGoto = this.props.menuGoto;
        let menuIndex = this.props.menuIndex;

        return (
            <div className="page-content-wrapper">

                <div className="content">
                    <h1>this is content</h1>
                </div>
                
            </div>
        )
    }
}