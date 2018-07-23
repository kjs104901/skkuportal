import React from 'react';

export default class MainPage extends React.Component {
    render() {
        let menuGoto = this.props.menuGoto;
        let menuIndex = this.props.menuIndex;

        return (
            <div className='mp'>
                <h1>메인 페이지: {menuIndex}</h1>
                <button onClick={() => {menuGoto(menuIndex + 1)}}>다음 페이지</button>
            </div>
        )
    }
}