const request = require('request'); // to request http

const { crawler } = require('./util.js');

exports.login = (userId, userPwd, callback) => {
    const loginURL = "https://smart.skku.edu/skku/login";
    const loginForm = {
        j_username: userId,
        j_password: userPwd
    };

    request(
        {
            url: loginURL,
            headers: crawler.getMobileHeader(),
            method: "POST",
            form: loginForm,
            jar: crawler.getCookieJar(),
            followAllRedirects: true
        },
        loginCallback
    );

    function loginCallback(error, response, body) {
        if(error){
            callback(false)
        }
        else if (response.statusCode === 200) {
            if (-1 < body.indexOf("로그인에러")) {
                callback(false)
            }
            else {
                callback(true);
            }
        }
        else {
            callback(false)
        }
    }
}

exports.loginCheck = (callback) => {
    const loginCheckURL = "https://smart.skku.edu/skku/main/menu/gls/";

    request(
        {
            url: loginCheckURL,
            headers: crawler.getMobileHeader(),
            method: "GET",
            jar: crawler.getCookieJar(),
            followAllRedirects: true
        },
        loginCheckCallback
    );

    function loginCheckCallback(error, response, body) {
        if (error) {
            callback(false);
        }
        else if (response.statusCode === 200) {
            if (-1 < body.indexOf("자동로그인")) {
                callback(false);
            }
            else if (-1 < body.indexOf("중복로그인")) {
                callback(false);
            }
            else {
                callback(true);
            }
        }
        else {
            callback(false);
        }
    }
}

exports.getScores = (callback) => {
    let scores = [];

    const getScoresURL = "https://smart.skku.edu/skku/gls/rec/trmRec/getTrmRecEnqGrid";
    const getScoresForm = {
        gridId: "scoreGrid",
        gridClass: "tableList",
        printType: "LIST",
        userstatus: "Y"
    }
    
    request(
        {
            url: getScoresURL,
            headers: crawler.getMobileHeader(),
            method: "POST",
            form: getScoresForm,
            jar: crawler.getCookieJar(),
            followAllRedirects: true
        },
        getScoresCallback
    );

    function getScoresCallback(error, response, body) {
        if (error){
            callback(scores);
        }
        else if (response.statusCode === 200) {
            crawler.setTargetStr(body);
            while(-1 < crawler.getTargetStr().indexOf('<tr id="scoreGrid')) {
                crawler.moveTargetAfter('<tr id="scoreGrid');

                crawler.moveTargetAfter('<td class="suup_year"');
                const year = crawler.getBetweenMoveTarget('currentValue="', '"')*1;

                crawler.moveTargetAfter('<td class="chuideuk_hakjum"');
                const hours = crawler.getBetweenMoveTarget('currentValue="', '"')*1;

                crawler.moveTargetAfter('<td class="avg_pyungjum"');
                const average = crawler.getBetweenMoveTarget('currentValue="', '"')*1;

                crawler.moveTargetAfter('<td class="sukcha"');
                const percentArr = crawler.getBetweenMoveTarget('>', '<').split('/');
                let percent = 0;
                if ((percentArr[1]*1) === 0) {
                    percent = 0;
                }
                else {
                    percent = Math.floor((percentArr[0]*1) / (percentArr[1]*1) *100);
                }

                crawler.moveTargetAfter('<td class="haksa_kyunggo_yn"');
                let warning = false;
                if (crawler.getBetweenMoveTarget('currentValue="', '"') === "Y") {
                    warning = true;
                }

                crawler.moveTargetAfter('<td class="sungjuk_cancel_yn_view"');
                let cancle = false;
                if (crawler.getBetweenMoveTarget('currentValue="', '"') === "Y") {
                    cancle = true;
                }

                crawler.moveTargetAfter('<td class="suup_term"');
                const semester = crawler.getBetweenMoveTarget('currentValue="', '"')*1;

                const score = {
                    year: year,
                    semester: semester,
                    hours: hours,
                    average: average,
                    percent: percent,
                    warning: warning,
                    cancle: cancle
                };

                scores.push(score);
            }
            callback(scores);
        }
        else {
            callback(scores);
        }
    }
};

exports.getScoreDetail = (year, semester, callback) => {
    let scores = [];

    const getScoreDetailURL = "https://smart.skku.edu/skku/gls/rec/trmRec/getTrmRecDetlEnqGrid";
    const getScoreDetailForm = {
        gridId: "classGrid",
        gridClass: "tableList",
        printType: "LIST",
        userstatus: "Y",
        cal_year: year,
        cal_term: semester
    }

    request(
        {
            url: getScoreDetailURL,
            headers: crawler.getMobileHeader(),
            method: "POST",
            form: getScoreDetailForm,
            jar: crawler.getCookieJar(),
            followAllRedirects: true
        },
        getScoreDetailCallback
    );

    function getScoreDetailCallback(error, response, body) {
        if (error) {
            callback(scores);
        }
        else if (response.statusCode === 200) {
            crawler.setTargetStr(body);
            while(-1 < crawler.getTargetStr().indexOf('<tr id="classGrid')) {
                crawler.moveTargetAfter('<tr id="classGrid');

                crawler.moveTargetAfter('class="haksu_name"');
                const name = crawler.getBetweenMoveTarget('currentValue="', '"');

                crawler.moveTargetAfter('class="deungkub"');
                const tier = crawler.getBetweenMoveTarget('currentValue="', '"');
                
                crawler.moveTargetAfter('class="hakjum"');
                const hours = crawler.getBetweenMoveTarget('currentValue="', '"');

                crawler.moveTargetAfter('class="per_name"');
                const professor = crawler.getBetweenMoveTarget('currentValue="', '"');

                const score = {
                    name: name,
                    tier: tier,
                    hours: hours,
                    professor: professor
                };

                scores.push(score);
            }

            callback(scores);
        }
        else {
            callback(scores);
        }
    }
};

exports.getWeekTable = (callback) => {
    // https://smart.skku.edu/skku/gls/lctr/weeksTableEnq/
    // 여기서 구해야 할 현재 학기 년도 구해서
    // https://smart.skku.edu/skku/gls/lctr/weeksTableEnq/list?p_year=2018&p_term=10&p_gv_lang_cd=KO
    // 여기서 주간 테이블 구한다.
    // 학기 중에 구현
}

exports.getSemesterList = (callback) => {
    const semesterListURL = "https://smart.skku.edu/skku/gls/lctr/timeTblEnq/";
    let semesterList = [];

    request(
        {
            url: semesterListURL,
            headers: crawler.getMobileHeader(),
            method: "GET",
            jar: crawler.getCookieJar()
        }, (error, response, body) => {
            if (error) {
                callback(semesterList);
            }
            else if (response.statusCode !== 200) {
                callback(semesterList);
            }
            else {
                crawler.setTargetStr(body);
                let listStr = crawler.getBetween('<td class="fst">', "</td>");
                crawler.setTargetStr(listStr);
                while(-1 < crawler.getTargetStr().indexOf("<option value='")) {
                    const value = crawler.getBetweenMoveTarget("<option value='", "'");
                    const year = value.substr(0,4) * 1;
                    const semester = value.substr(4,2) * 1;
                    const name = crawler.getBetweenMoveTarget(">", "<");

                    semesterList.push({
                        year: year,
                        semester: semester,
                        name: name
                    })
                }
                callback(semesterList);
            }
        }
    )
}

exports.searchClass = (campusType, searchType, searchStr, year, semester, callback) => {
    /// campusType 1:인문 2:자과 3:아이캠
    /// searchType 1:학수번호 2:교과목명 3:교강사명
    let searchResult = [];

    const searchClassURL = "https://smart.skku.edu/skku/gls/lctr/timeTblEnq/getTimeTblEnqGrid";
    const searchForm = {
        gridId: "classGrid",
        detailViewType: "DEFAULT",
        p_gaesul_campus_gb:	campusType,
        p_search_gb: searchType,
        p_search_key: searchStr,
        p_year: year,
        p_term: semester,
        printType: "LIST"
    }

    request(
        {
            url: searchClassURL,
            headers: crawler.getMobileHeader(),
            method: "POST",
            form: searchForm,
            jar: crawler.getCookieJar()
        }, (error, response, body) => {
            if (error) {
                callback(searchResult);
            }
            else if (response.statusCode !== 200) {
                callback(searchResult);
            }
            else {
                crawler.setTargetStr(body);
                while (-1 < crawler.getTargetStr().indexOf('<tr id="classGrid_')) {
                    crawler.moveTargetAfter('<tr id="classGrid_');

                    const name = crawler.getBetween('class="gwamok_name" currentValue="', '"');
                    const professor = crawler.getBetween('class="per_name" currentValue="', '"');
                    const id = crawler.getBetween('class="haksu_no" currentValue="', '"');
                    const score = crawler.getBetween('class="hakjum" currentValue="', '"');
                    const kind = crawler.getBetween('class="hyungtae" currentValue="', '"');
                    const target = crawler.getBetween('class="hakbu_name" currentValue="', '"');
                    const time = crawler.getBetween('class="gyosi_name" currentValue="', '"');

                    if (0 < id.length) {
                        searchResult.push({
                            name: name,
                            professor: professor,
                            id: id,
                            score: score,
                            kind: kind,
                            target: target,
                            time: time
                        })
                    }
                }
                callback(searchResult);
            }
        }
    );
}