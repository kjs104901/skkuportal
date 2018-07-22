const request = require('request'); // to request http

const iconv = require('iconv-lite'); // to encode enc-kr
const charset = require('charset'); // to find charset

const { crawler } = require('./util.js');

/// enum ///
exports.NOTICE = 2;
exports.MATERIAL = 4;
exports.ASSIGNMENT = 6;

const loginURL = "https://admin.skku.edu/co/COCOUsrLoginAction.do";
let loginForm = {
    method: "loginHide",
    retPage: "http://www.icampus.ac.kr/front/login/loginAction.do?method=checkLoginAuth",
    language: "ko",
    reqType: "G"
}

const loginCheckAuthURL = "https://admin.skku.edu/co/COCOUsrLoginAction.do";
let loginCheckAuthForm = {
    method: "loginUser",
    retPage: "http://www.icampus.ac.kr/front/login/loginAction.do?method=checkLoginAuth",
    type: "hide",
    language: "ko",
}

const loginCheckMainURL = "http://www.icampus.ac.kr/front/login/loginAction.do?method=checkLoginAuth";
let loginMainForm = {
    retPage: "http://www.icampus.ac.kr/front/login/loginAction.do?method=checkLoginAuth",
    D3: "SEED",
    type: "Y",
}

exports.loginDirect = (userId, userPwd, callback) => {
    loginForm.loginId = userId;
    loginForm.userPasswd = userPwd;

    request(
        {
            url: loginURL,
            headers: crawler.getNormalHeader(),
            method: "POST",
            form: loginForm,
            jar: crawler.getCookieJar()
        },
        loginCallback
    );

    function loginCallback(error, response, body) {
        if (response.statusCode === 200) {

            crawler.setTargetStr(body);

            crawler.moveTargetAfter("name=roundkey");
            const roundkey = crawler.getBetweenMoveTarget("value=\"", "\">");

            crawler.moveTargetAfter("name=loginId");
            const loginId = crawler.getBetweenMoveTarget("value=\"", "\">");

            crawler.moveTargetAfter("name=userPasswd");
            const userPasswd = crawler.getBetweenMoveTarget("value=\"", "\">");

            if (0 < roundkey.length) {
                loginCheckAuth(roundkey, loginId, userPasswd);
            } else {
                callback(false);
            }
        } else {
            callback(false);
        }
    }

    function loginCheckAuth(roundkey, loginId, userPasswd) {
        loginCheckAuthForm.roundkey = roundkey;
        loginCheckAuthForm.loginId = loginId;
        loginCheckAuthForm.userPasswd = userPasswd;

        request(
            {
                url: loginCheckAuthURL,
                headers: crawler.getNormalHeader(),
                method: "POST",
                form: loginCheckAuthForm,
                jar: crawler.getCookieJar()
            },
            loginCheckAuthCallback
        );
    }

    function loginCheckAuthCallback(error, response, body) {
        if (response.statusCode === 200) {
            let D1;
            let roundkey;

            crawler.setTargetStr(body);
            if (-1 < body.indexOf("document.loginForm.D1.value = \"")) {
                D1 = crawler.getBetweenMoveTarget("document.loginForm.D1.value = \"", "\"");

                roundkey = crawler.getBetweenMoveTarget("document.loginForm.roundkey.value = \"", "\"");
            }
            else {
                crawler.moveTargetAfter("name=roundkey");
                roundkey = crawler.getBetweenMoveTarget("value=\"", "\"");

                crawler.moveTargetAfter("name=D1");
                D1 = crawler.getBetweenMoveTarget("value=\"", "\"");
            }

            loginCheckMain(D1, roundkey)
        } else {
            callback(false);
        }
    }

    function loginCheckMain(D1, roundkey) {
        loginMainForm.roundkey = roundkey;
        loginMainForm.D1 = D1;

        request(
            {
                url: loginCheckMainURL,
                headers: crawler.getNormalHeader(),
                method: "POST",
                form: loginMainForm,
                jar: crawler.getCookieJar(),
                followAllRedirects: true,
                encoding: null
            }, (error, response, body) => {
                if (response.statusCode === 200) {
                    const encodingType = charset(response.headers, body);
                    const encodedBody = iconv.decode(body, encodingType);

                    if (-1 < encodedBody.indexOf("로그아웃")) {
                        callback(true);
                    }
                    else {
                        callback(false);
                    }
                } else {
                    callback(false);
                }
            }
        );
    }
}

exports.loginCheck = (callback) => {
    const loginCheckURL = "http://www.icampus.ac.kr/front/main/MainAction.do?method=list";

    request(
        {
            url: loginCheckMainURL,
            headers: crawler.getNormalHeader(),
            method: "GET",
            jar: crawler.getCookieJar(),
            encoding: null
        }, (error, response, body) => {
            if (response.statusCode === 200) {
                const encodingType = charset(response.headers, body);
                const encodedBody = iconv.decode(body, encodingType);

                if (-1 < encodedBody.indexOf("로그아웃")) {
                    callback(true);
                }
                else {
                    callback(false);
                }
            } else {
                callback(false);
            }
        }
    );
};

exports.getClassListCurrent = (callback) => {
    _getClassList(-1, -1, callback);
};

exports.getClassList = _getClassList;
function _getClassList(year, semester, callback) {
    let getClassListURL = "http://www.icampus.ac.kr/front/mypage/CourseAction.do?method=list";
    if (0 < year && 0 < semester) {
        getClassListURL += "&hthyrY=" + year;
        getClassListURL += "&hyrSeme=" + semester * 10;
    }

    let resultClassList = [];

    request(
        {
            url: getClassListURL,
            headers: crawler.getIcampusRefererHeader(),
            method: "GET",
            jar: crawler.getCookieJar(),
            encoding: null
        }, (error, response, body) => {
            if (response.statusCode === 200) {
                const encodingType = charset(response.headers, body);
                const encodedBody = iconv.decode(body, encodingType);

                crawler.setTargetStr(encodedBody);
                crawler.moveTargetAfter("<thead>");
                const tbody = crawler.getBetweenMoveTarget("<tbody>", "</tbody>")

                crawler.setTargetStr(tbody);
                let classTrList = [];
                while (-1 < crawler.getTargetStr().indexOf("<tr")) {
                    let classTr = crawler.getBetweenMoveTarget("<tr", "</tr>")
                    classTrList.push(classTr);
                }

                classTrList.forEach(classTr => {
                    crawler.setTargetStr(classTr);

                    crawler.moveTargetAfter("<td");
                    crawler.moveTargetAfter("<td");

                    const professorName = crawler.getBetween("<td>", "</td>");

                    const classIDInfoStr = crawler.getBetween("onclick=\"onStudyList('", "'");
                    const classIDInfo = classIDInfoStr.split('||');

                    crawler.moveTargetAfter(",'2');\">")
                    const notificationNumber = crawler.getBetween(",'2');\">", "<").split("/");
                    crawler.moveTargetAfter(",'3');\">")
                    const questionNumber = crawler.getBetween(",'3');\">", "<").split("/");
                    crawler.moveTargetAfter(",'4');\">")
                    const resourceNumber = crawler.getBetween(",'4');\">", "<").split("/");
                    crawler.moveTargetAfter(",'5');\">")
                    const discussionNumber = crawler.getBetween(",'5');\">", "<").split("/");
                    crawler.moveTargetAfter(",'6');\">")
                    const assignmentNumber = crawler.getBetween(",'6');\">", "<").split("/");
                    crawler.moveTargetAfter(",'7');\">")
                    const examinationNumber = crawler.getBetween(",'7');\">", "<").split("/");

                    const classElement = {
                        name: classIDInfo[1],
                        professor: professorName,
                        recentNumbers: {
                            notification: notificationNumber[0],
                            question: questionNumber[0],
                            resource: resourceNumber[0],
                            discussion: discussionNumber[0],
                            assignment: assignmentNumber[0],
                            examination: examinationNumber[0]
                        },
                        totalNumbers: {
                            notification: notificationNumber[1],
                            question: questionNumber[1],
                            resource: resourceNumber[1],
                            discussion: discussionNumber[1],
                            assignment: assignmentNumber[1],
                            examination: examinationNumber[1]
                        },
                        identity: classIDInfo
                    }
                    resultClassList.push(classElement);
                });
                callback(resultClassList);
            } else {
                callback(resultClassList);
            }
        }
    );
}

exports.getPostList = (identity, code, callback) => {
    let postList = [];

    let getPostListURL = "http://www.icampus.ac.kr";
    if (code === 1) {
        getPostListURL += "/front/study/MainAction.do?method=list"; // 메인 화면
        callback(postList);
        return;
    } else if (code === 2) {
        getPostListURL += "/front/study/AnnounceAction.do?method=list"; // ### 공지
    } else if (code === 3) {
        getPostListURL += "/front/study/QnaAction.do?method=list"; // QnA
        callback(postList);
        return;
    } else if (code === 4) {
        getPostListURL += "/front/study/DataAction.do?method=list"; // ### 자료실
    } else if (code === 5) {
        getPostListURL += "/front/study/DiscussAction.do?method=mainlist"; // 토의
        callback(postList);
        return;
    } else if (code === 6) {
        getPostListURL += "/front/study/TaskAction.do?method=list"; // ### 과제
    } else if (code === 7) {
        getPostListURL += "/front/study/ExaminationAction.do?method=list"; // 시험
        callback(postList);
        return;
    }

    const getPostListform = {
        hSearchLmsSbjt: identity[0],
        hSearchLmsSbjtNm: identity[1],
        hSearchLmsSbjtId: identity[2],
        hSearchLmsSbjtY: identity[3],
        hSearchLmsSbjtGrnoNo: identity[4],
        hSearchLmsSbjtOperNm: identity[5],
        hSearchAtlcNo: identity[6],
        hSearchClassV: identity[7],
        hSearchSbjtDc: identity[8],
        hPerId: identity[9].split('|')[0],
        hPerType: identity[9].split('|')[1]
    }

    request(
        {
            url: getPostListURL,
            headers: crawler.getIcampusRefererHeader(),
            method: "POST",
            form: getPostListform,
            jar: crawler.getCookieJar(),
            encoding: null
        }, (error, response, body) => {
            if (response.statusCode === 200) {
                const encodingType = charset(response.headers, body);
                const encodedBody = iconv.decode(body, encodingType);

                crawler.setTargetStr(encodedBody);
                crawler.moveTargetAfter("<thead>")
                const tbody = crawler.getBetweenMoveTarget("<tbody>", "</tbody>")

                crawler.setTargetStr(tbody);
                let postTrList = [];
                while (-1 < crawler.getTargetStr().indexOf("<tr")) {
                    let postTr = crawler.getBetweenMoveTarget("<tr", "</tr>")
                    postTrList.push(postTr);
                }

                postTrList.forEach(post => {
                    crawler.setTargetStr(post);
                    let postBase = [];
                    while (-1 < crawler.getTargetStr().indexOf("<td")) {
                        crawler.moveTargetAfter("<td");
                        let item = crawler.getBetweenMoveTarget(">", "</td");
                        item = crawler.decodeHTML(item);
                        postBase.push(item);
                    }

                    postBase = postBase.map((item) => {
                        crawler.setTargetStr(item);
                        if (-1 < crawler.getTargetStr().indexOf("onViewPage")) {
                            crawler.moveTargetAfter("onViewPage");
                            const first = crawler.getBetweenMoveTarget("'", "'");
                            const second = crawler.getBetweenMoveTarget("'", "'");
                            let third = crawler.getBetween(">", "</");
                            if (third.length === 0) {
                                third = crawler.getAfter(">");
                            }
                            return {
                                lmsBdotSeq: first,
                                lmsBlbdId: second,
                                title: third
                            }
                        }
                        if (-1 < crawler.getTargetStr().indexOf("onViewFileDownloadOld")) {
                            let downloadList = [];
                            while (-1 < crawler.getTargetStr().indexOf("onViewFileDownloadOld")) {
                                crawler.moveTargetAfter("onViewFileDownloadOld");
                                const first = crawler.getBetweenMoveTarget("'", "'");
                                const second = crawler.getBetweenMoveTarget("'", "'");
                                const thrid = crawler.getBetweenMoveTarget("'", "'");

                                downloadList.push({
                                    pathInfo: first,
                                    atchFileNm: second,
                                    atchFileSaveNm: thrid
                                });
                            }
                            return downloadList;
                        }
                        else if (-1 < crawler.getTargetStr().indexOf("<a href=\"")) {
                            const getURL = crawler.getBetweenMoveTarget("<a href=\"", "\"");
                            const getTitle = crawler.getBetweenMoveTarget(">", "</");

                            return {
                                title: getTitle,
                                url: getURL
                            }
                        }
                        else if (-1 < item.indexOf(" ~<br>")) {
                            return {
                                startTime: item.split(" ~<br>")[0],
                                endTime: item.split(" ~<br>")[1]
                            }
                        }
                        else {
                            return item;
                        }
                    });

                    let postFormed = {}
                    if (code === 2) {
                        postFormed.index = postBase[0];
                        postFormed.title = postBase[1].title;
                        postFormed.URL = "http://www.icampus.ac.kr/front/study/AnnounceAction.do?method=view";
                        postFormed.URL += "&lmsBdotSeq=" + postBase[1].lmsBdotSeq + "&lmsBlbdId=" + postBase[1].lmsBlbdId;
                        postFormed.publisher = postBase[2];
                        postFormed.date = postBase[3];
                        postFormed.viewCount = postBase[4];
                        postFormed.attachments = postBase[5];
                    }
                    else if (code === 4) {
                        postFormed.index = postBase[0];
                        postFormed.title = postBase[1].title;
                        postFormed.URL = "http://www.icampus.ac.kr/front/study/DataAction.do?method=view";
                        postFormed.URL += "&lmsBdotSeq=" + postBase[1].lmsBdotSeq + "&lmsBlbdId=" + postBase[1].lmsBlbdId;
                        postFormed.publisher = postBase[2];
                        postFormed.date = postBase[3];
                        postFormed.viewCount = postBase[5];
                        postFormed.attachments = postBase[6];
                    }
                    else if (code === 6) {
                        postFormed.index = postBase[0];
                        postFormed.title = postBase[2].title;
                        postFormed.type = postBase[1];
                        postFormed.URL = "http://www.icampus.ac.kr/front/study/TaskAction.do";
                        postFormed.URL += postBase[2].url;
                        postFormed.startTime = postBase[3].startTime;
                        postFormed.endTime = postBase[3].endTime;
                        postFormed.status = postBase[4];
                        postFormed.submitDate = postBase[5];
                        postFormed.submitStatus = postBase[6];
                        postFormed.score = postBase[7];
                    }

                    postList.push(postFormed);
                });
            }
            callback(postList);
        }
    );
}


exports.getPost = (url, code, callback) => {
    if (code === 2) {
        getNoticePost(url, callback);
    }
    else if (code === 4) {
        getMaterialPost(url, callback);
    }
    else if (code === 6) {
        getAssignmentPost(url, callback);
    }
    else {
        return;
    }
}

function getNoticePost(url, callback) {
    let returnStr = "";
    request(
        {
            url: url,
            headers: crawler.getIcampusRefererHeader(),
            method: "GET",
            jar: crawler.getCookieJar(),
            encoding: null
        }, (error, response, body) => {
            if (response.statusCode === 200) {
                const encodingType = charset(response.headers, body);
                const encodedBody = iconv.decode(body, encodingType);

                crawler.setTargetStr(encodedBody);
                const content = crawler.getBetweenMoveTarget("<div id=\"contents\">", "</form>");

                crawler.setTargetStr(content);
                while (-1 < crawler.getTargetStr().indexOf("<p>")) {
                    let line = crawler.getBetweenMoveTarget("<p>", "</p>");
                    returnStr += line + "\n";
                }
            }
            callback(returnStr);
        }
    );
}

function getMaterialPost(url, callback) {
    let materialPost = {
        content: "",
        attachments: [],
    };
    let materialForm = {
        currentPage: "1",
        bdotDiv: "01"
    };

    request(
        {
            url: url,
            headers: crawler.getIcampusRefererHeader(),
            method: "POST",
            form: materialForm,
            jar: crawler.getCookieJar(),
            encoding: null
        }, (error, response, body) => {
            if (response.statusCode === 200) {
                const encodingType = charset(response.headers, body);
                const encodedBody = iconv.decode(body, encodingType);

                crawler.setTargetStr(encodedBody);

                const content = crawler.getBetweenMoveTarget("<div class=\"board_view_con\">", "</div>");
                crawler.setTargetStr(content);
                while (-1 < crawler.getTargetStr().indexOf("<p>")) {
                    let line = crawler.getBetweenMoveTarget("<p>", "</p>");
                    materialPost.content += line + "\n";
                }

                crawler.setTargetStr(encodedBody);
                crawler.moveTargetAfter("<th>첨부파일");
                const attachContent = crawler.getBetweenMoveTarget("<td", "</td>");
                crawler.setTargetStr(attachContent);

                while (-1 < crawler.getTargetStr().indexOf("onViewFileDownloadOld")) {
                    crawler.moveTargetAfter("onViewFileDownloadOld");
                    const first = crawler.getBetweenMoveTarget("'", "'");
                    const second = crawler.getBetweenMoveTarget("'", "'");
                    const thrid = crawler.getBetweenMoveTarget("'", "'");

                    materialPost.attachments.push({
                        pathInfo: first,
                        atchFileNm: second,
                        atchFileSaveNm: thrid
                    });
                }
            }
            callback(materialPost);
        }
    );
}

function getAssignmentPost(url, callback) {
    let assignmentPost = {
        content: "",
        attachments: [],
    };

    request(
        {
            url: url,
            headers: crawler.getIcampusRefererHeader(),
            method: "GET",
            jar: crawler.getCookieJar(),
            encoding: null
        }, (error, response, body) => {
            if (response.statusCode === 200) {
                const encodingType = charset(response.headers, body);
                const encodedBody = iconv.decode(body, encodingType);

                crawler.setTargetStr(encodedBody);

                crawler.moveTargetAfter("<th>과제물내용");
                let content = crawler.getBetweenMoveTarget("<td>", "</td>");
                crawler.setTargetStr(content);
                while (-1 < crawler.getTargetStr().indexOf("<p>")) {
                    let line = crawler.getBetweenMoveTarget("<p>", "</p>");
                    assignmentPost.content += line + "\n";
                }

                crawler.setTargetStr(encodedBody);
                crawler.moveTargetAfter("<th>교수자 첨부파일");
                const attachContent = crawler.getBetweenMoveTarget("<td>", "</td>");
                crawler.setTargetStr(attachContent);

                while (-1 < crawler.getTargetStr().indexOf("onViewFileDownloadOld")) {
                    crawler.moveTargetAfter("onViewFileDownloadOld");
                    const first = crawler.getBetweenMoveTarget("'", "'");
                    const second = crawler.getBetweenMoveTarget("'", "'");
                    const thrid = crawler.getBetweenMoveTarget("'", "'");

                    assignmentPost.attachments.push({
                        pathInfo: first,
                        atchFileNm: second,
                        atchFileSaveNm: thrid
                    });
                }
            }
            callback(assignmentPost);
        }
    );
}