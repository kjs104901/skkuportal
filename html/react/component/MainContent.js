import React from 'react';

import CMain from './mainComponent/CMain'
import CGLS from './mainComponent/CGLS'
import CIcampus from './mainComponent/CIcampus'
import CNotice from './mainComponent/CNotice'
import CMail from './mainComponent/CMail'
import CLibrary from './mainComponent/CLibrary'
import CMeal from './mainComponent/CMeal'
import CFuture from './mainComponent/CFuture'
import CTransportation from './mainComponent/CTransportation'
import CQna from './mainComponent/CQna'
import CCommunity from './mainComponent/CCommunity'

const warningMessage = (errMessage) => {
    $('body').pgNotification({
        style: "circle",
        timeout: 2000,
        message: errMessage,
        type: "danger"
    }).show();
};

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
            return <CMain menuGoto={menuGoto} warningMessage={warningMessage} />;
        case 1:
            return <CIcampus menuGoto={menuGoto} warningMessage={warningMessage} />;
        case 2:
            return <CGLS menuGoto={menuGoto} warningMessage={warningMessage} />;
        case 3:
            return <CNotice menuGoto={menuGoto} warningMessage={warningMessage} />;
        case 4:
            return "일정 컴포넌트: " + menuIndex;
        case 5:
            return <CMail menuGoto={menuGoto} warningMessage={warningMessage} />;
        case 6:
            return <CFuture menuGoto={menuGoto} warningMessage={warningMessage} />; // 구글 드라이브
        case 7:
            return <CQna menuGoto={menuGoto} warningMessage={warningMessage}/>;
        case 8:
            return <CLibrary menuGoto={menuGoto} warningMessage={warningMessage} />;
        case 9:
            return <CMeal menuGoto={menuGoto} warningMessage={warningMessage} />;
        case 10:
            return <CTransportation menuGoto={menuGoto} warningMessage={warningMessage} />;
        case 11:
            return <CCommunity menuGoto={menuGoto} warningMessage={warningMessage} />;
        default:
            return "오류 컴포넌트: " + menuIndex;
    }
};