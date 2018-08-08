import React from 'react';

export default class CFuture extends React.Component {
    render() {
        return (
            <React.Fragment>
                <div className="full-height">
                    <div className="row justify-content-center align-items-center no-gutters" style={{ width: "100%", height: "590px" }}>
                        <div className="col-4" style={{ textAlign: "center" }}>
                            <i className="fas fa-exclamation-circle" style={{"fontSize": "60px"}}></i>
                            <p className="large-text m-t-20">지원 예정입니다</p>
                        </div>
                    </div>
                </div>
            </React.Fragment>
        );
    }
}