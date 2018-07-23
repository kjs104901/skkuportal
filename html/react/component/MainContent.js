import React from 'react';

import CMain from './mainComponent/CMain'
import CGLS from './mainComponent/CGLS'
import CIcampus from './mainComponent/CIcampus'

export default class MainContent extends React.Component {
    componentWillMount(){
        this.setState({
            contentLoaded: false
        })
    }

    render() {
        let menuGoto = this.props.menuGoto;
        let menuIndex = this.props.menuIndex;

        return (
            <div className="page-content-wrapper">
                <div className="content">          
                    {dialog(menuIndex, menuGoto)}
                </div>
            </div>
        )
    }
}
const dialog = (menuIndex, menuGoto) => {
    switch (menuIndex) {
        case 0:
            return <CMain menuGoto={menuGoto} />;
        case 1:
            return <CIcampus menuGoto={menuGoto} />;
        case 2:
            return <CGLS menuGoto={menuGoto} />;;
        default:
            return "오류 컴포넌트: " + menuIndex;
    }
};