import React from 'react';

export default class CMain extends React.Component {
    render() {
        return (
            <div className="container-fluid padding-20">
                <div className="row">
                    <div className="col-6">
                        아이캠퍼스 영역
                    </div>
                    <div className="col-6">
                        날씨 영역
                    </div>
                </div>
            </div>
        )
    }
}