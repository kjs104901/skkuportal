import React from 'react';

export default class MainHeader extends React.Component {
    render() {
        let menuGoto = this.props.menuGoto;
        let menuIndex = this.props.menuIndex;

        return (
            <div className="header" style={{padding: '0px'}}>
                <h1 style={{marginLeft: "10px"}}>SKKU Portal</h1>

                <div className="d-flex align-items-center">
                    <div id="setting-button" className="col-auto" style={{textAlign: "center", height: "40px"}} data-toggle="quickview" data-toggle-element="#quickview">
                        <img src="./assets/img/settingbuttonB.png" style={{paddingTop: "12px"}} />
                    </div>
                    <div id="minimize-button" className="col-auto" style={{textAlign: "center", height: "40px"}}>
                        <img src="./assets/img/minimizebuttonB.png" style={{paddingTop: "11px"}} />
                    </div>
                    <div id="close-button" className="col-auto" style={{textAlign: "center", height: "40px"}}>
                        <img src="./assets/img/closebuttonB.png" style={{paddingTop: "11px"}} />
                    </div>
                </div>
            </div>
        )
    }
}