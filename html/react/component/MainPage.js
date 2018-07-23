import React from 'react';

import MainHeader from './MainHeader';
import MainContent from './MainContent';

export default class MainPage extends React.Component {
    render() {
        let menuGoto = this.props.menuGoto;
        let menuIndex = this.props.menuIndex;

        return (
            <div className="page-container">
                <MainHeader menuGoto={menuGoto} menuIndex={menuIndex} />
                <MainContent menuGoto={menuGoto} menuIndex={menuIndex} />
            </div>
        )
    }
}