import React from 'react';

export default class MainHeader extends React.Component {
    render() {
        let menuGoto = this.props.menuGoto;
        let menuIndex = this.props.menuIndex;

        return (
            <div className="header">
                <h1>this is header</h1>
            </div>
        )
    }
}