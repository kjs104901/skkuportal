import React from 'react';

export default class SideBar extends React.Component {
    render() {
        let menuGoto = this.props.menuGoto;
        let menuIndex = this.props.menuIndex;
        
        return (
            <nav className="page-sidebar" data-pages="sidebar">
                <div className="sidebar-header">
                </div>
                <div className="sidebar-menu">
                    <ul className="menu-items">
                        <li className="m-t-20 ">
                            <a href="#" onClick={ ()=>{menuGoto(0)} }>
                                <span className= {(menuIndex === 0)?"title title-selected":"title" }>메인화면</span>
                            </a>
                            <span className= {(menuIndex === 0)?"icon-thumbnail bg-success":"icon-thumbnail" }>
                                <i className="pg-home"></i>
                            </span>
                        </li>
                        <li className="">
                            <a href="#" onClick={ ()=>{menuGoto(1)} }>
                                <span className= {(menuIndex === 1)?"title title-selected":"title" }>아이캠퍼스</span>
                            </a>
                            <span className= {(menuIndex === 1)?"icon-thumbnail bg-success":"icon-thumbnail" }>ICP</span>
                        </li>
                        <li className="">
                            <a href="#" onClick={ ()=>{menuGoto(2)} }>
                                <span className= {(menuIndex === 2)?"title title-selected":"title" }>GLS</span>
                            </a>
                            <span className= {(menuIndex === 2)?"icon-thumbnail bg-success":"icon-thumbnail" }>GLS</span>
                        </li>
                        <li className="">
                            <a href="#" onClick={ ()=>{menuGoto(3)} }>
                                <span className= {(menuIndex === 3)?"title title-selected":"title" }>공지사항</span>
                            </a>
                            <span className= {(menuIndex === 3)?"icon-thumbnail bg-success":"icon-thumbnail" }>
                                <i className="fas fa-bell"></i>
                            </span>
                        </li>
                        <li className="">
                            <a href="#" onClick={ ()=>{menuGoto(4)} }>
                                <span className= {(menuIndex === 4)?"title title-selected":"title" }>일정</span>
                            </a>
                            <span className= {(menuIndex === 4)?"icon-thumbnail bg-success":"icon-thumbnail" }>
                                <i className="pg-calender"></i>
                            </span>
                        </li>
                        <li className="">
                            <a href="#" onClick={ ()=>{menuGoto(5)} }>
                                <span className= {(menuIndex === 5)?"title title-selected":"title" }>이메일</span>
                            </a>
                            <span className= {(menuIndex === 5)?"icon-thumbnail bg-success":"icon-thumbnail" }>
                                <i className="pg-mail"></i>
                            </span>
                        </li>
                        <li className="">
                            <a href="#" onClick={ ()=>{menuGoto(6)} }>
                                <span className= {(menuIndex === 6)?"title title-selected":"title" } style={{color:"grey"}}>구글 드라이브</span>
                            </a>
                            <span className= {(menuIndex === 6)?"icon-thumbnail bg-success":"icon-thumbnail" }>
                                <i className="fab fa-google-drive" style={{color:"grey"}}></i>
                            </span>
                        </li>
                        <li className="">
                            <a href="#" onClick={ ()=>{menuGoto(7)} }>
                                <span className= {(menuIndex === 7)?"title title-selected":"title" } style={{color:"grey"}}>Q&A</span>
                            </a>
                            <span className= {(menuIndex === 7)?"icon-thumbnail bg-success":"icon-thumbnail" }>
                                <i className="fas fa-question-circle"  style={{color:"grey"}}></i>
                            </span>
                        </li>
                        <li className="">
                            <a href="#" onClick={ ()=>{menuGoto(8)} }>
                                <span className= {(menuIndex === 8)?"title title-selected":"title" }>도서관</span>
                            </a>
                            <span className= {(menuIndex === 8)?"icon-thumbnail bg-success":"icon-thumbnail" }>
                                <i className="fas fa-book"></i>
                            </span>
                        </li>
                        <li className="">
                            <a href="#" onClick={ ()=>{menuGoto(9)} }>
                                <span className= {(menuIndex === 9)?"title title-selected":"title" }>식단표</span>
                            </a>
                            <span className= {(menuIndex === 9)?"icon-thumbnail bg-success":"icon-thumbnail" }>
                                <i className="fas fa-utensils"></i>
                            </span>
                        </li>
                        <li className="">
                            <a href="#" onClick={ ()=>{menuGoto(10)} }>
                                <span className= {(menuIndex === 10)?"title title-selected":"title" }>교통</span>
                            </a>
                            <span className= {(menuIndex === 10)?"icon-thumbnail bg-success":"icon-thumbnail" }>
                                <i className="fas fa-bus"></i>
                            </span>
                        </li>
                        <li className="">
                            <a href="#" onClick={ ()=>{menuGoto(11)} }>
                                <span className= {(menuIndex === 11)?"title title-selected":"title" }>커뮤니티</span>
                            </a>
                            <span className= {(menuIndex === 11)?"icon-thumbnail bg-success":"icon-thumbnail" }>
                                <i className="fab fa-facebook-square"></i>
                            </span>
                        </li>
                    </ul>
                    <div className="clearfix"></div>
                </div>
            </nav>
        )
    }
}