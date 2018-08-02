import React from 'react';

import CMain from './mainComponent/CMain'
import CGLS from './mainComponent/CGLS'
import CIcampus from './mainComponent/CIcampus'
import CNotice from './mainComponent/CNotice'
import CMail from './mainComponent/CMail'
import CLibrary from './mainComponent/CLibrary'
import CMeal from './mainComponent/CMeal'

export default class MainContent extends React.Component {
    componentWillMount() {
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
            return <CGLS menuGoto={menuGoto} />;
        case 3:
            return <CNotice menuGoto={menuGoto} />;
        case 4:
            return "일정 컴포넌트: " + menuIndex;
        case 5:
            return <CMail menuGoto={menuGoto} />;
        case 6:
            return "구글 드라이브 컴포넌트: " + menuIndex;
        case 7:
            return "Q&A 컴포넌트: " + menuIndex;
        case 8:
            return <CLibrary menuGoto={menuGoto} />;
        case 9:
            return <CMeal menuGoto={menuGoto} />;
        case 10:
            return "교통 컴포넌트: " + menuIndex;
        case 11:
            return "커뮤니티 컴포넌트: " + menuIndex;
        default:
            return "오류 컴포넌트: " + menuIndex;
    }
};