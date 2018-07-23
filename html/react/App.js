import React from 'react';

import MainPage from './component/MainPage';
import QuickView from './component/QuickView';
import SideBar from './component/SideBar';

class App extends React.Component {
    state = {
        menuIndex: 0
    }

    menuGoto = (gotoIndex) => {
        this.setState({
            menuIndex: gotoIndex
        })
    }

    render() {
        return (
            <React.Fragment>
                <SideBar menuGoto={this.menuGoto} menuIndex={this.state.menuIndex} />
                <MainPage menuGoto={this.menuGoto} menuIndex={this.state.menuIndex} />
                <QuickView />
            </React.Fragment>
        )
    }
}
export default App;
