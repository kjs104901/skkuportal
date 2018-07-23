import React from 'react';

import MainPage from './component/MainPage';
import QuickView from './component/QuickView';
import SideBar from './component/SideBar';

export default class App extends React.Component {
    render() {
        return (
            <div className='app'>
                <MainPage />
                <QuickView />
                <SideBar />
            </div>
        )
    }
}