const request = require('request'); // to request http

const iconv = require('iconv-lite'); // to encode enc-kr
const charset = require('charset'); // to find charset
const fs = require('fs'); // to find charset

const { crawler } = require('./util.js');

let studentName = "";
let studentDepartment = "";

exports.getName = () => {
    return studentName;
}

exports.getDepartment = () => {
    return studentDepartment;
}

exports.login = (userId, userPwd, callback) => {
    const loginMainURL = "https://admin.skku.edu/co/COCOUsrLoginAction.do";
    const loginMainForm = {
        method: "loginMain",
        retPage: "https://www.skku.edu/_custom/skkuedu/_common/login/old/dummySSO.jsp",
        D1: "null",
        D3: "null",
        roundkey: "null",
        language: "ko",
    };

    request(
        {
            url: loginMainURL,
            headers: crawler.getNormalHeader(),
            method: "POST",
            form: loginMainForm,
            jar: crawler.getCookieJar()
        },
        loginMainCallback
    );

    function loginMainCallback(error, response, body) {
        if (error) {
            callback(false);
            return;
        }
        else if (response.statusCode === 200) {
            crawler.setTargetStr(body);
            const roundkey = crawler.getBetweenMoveTarget("var roundkey_c = \"", "\"");
            if (0 < roundkey.length) {
                loginUser(roundkey);
            }
            else {
                callback(false);
            }
        }
        else {
            callback(false);
        }
    }

    function loginUser(roundkey) {
        const loginUserURL = "https://admin.skku.edu/co/COCOUsrLoginAction.do";
        const loginUserForm = {
            roundkey: roundkey,
            method: "loginUser",
            retPage: "https://www.skku.edu/_custom/skkuedu/_common/login/old/dummySSO.jsp",
            language: "ko",
            loginId: userId,
            userPasswd: userPwd
        };

        request(
            {
                url: loginUserURL,
                headers: crawler.getNormalHeader(),
                method: "POST",
                form: loginUserForm,
                jar: crawler.getCookieJar()
            },
            loginUserCallback
        );
    }

    function loginUserCallback(error, response, body) {
        if (error) {
            callback(false);
            return;
        }
        else if (response.statusCode === 200) {
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

            loginDummy();
        }
        else {
            callback(false);
        }
    }

    function loginDummy() {
        const loginDummyURL = "https://www.skku.edu/_custom/skkuedu/_common/login/old/dummySSO.jsp";
        const loginDummyForm = {
            D1: D1,
            roundkey: roundkey,
            retPage: "https://www.skku.edu/_custom/skkuedu/_common/login/old/dummySSO.jsp",
            D3: "SEED",
            type: "Y"
        };

        request(
            {
                url: loginDummyURL,
                headers: crawler.getNormalHeader(),
                method: "POST",
                form: loginDummyForm,
                jar: crawler.getCookieJar()
            },
            loginDummyCallback
        );
    }

    function loginDummyCallback(error, response, body) {
        if (error) {
            callback(false);
            return;
        }
        else if (response.statusCode === 200) {
            loginPortalWeb();
        }
        else {
            callback(false);
        }
    }

    function loginPortalWeb() {
        const loginPortalWebURL = "http://portal.skku.edu/EP/web/login/auto_login.jsp?type=param";
        const loginPortalWebForm = {
            D1: D1,
            roundkey: roundkey,
            D3: "SEED"
        };

        request(
            {
                url: loginPortalWebURL,
                headers: crawler.getNormalHeader(),
                method: "POST",
                form: loginPortalWebForm,
                jar: crawler.getCookieJar()
            },
            loginPortalWebCallback
        );
    }

    function loginPortalWebCallback(error, response, body) {
        if (error) {
            callback(false);
            return;
        }
        else if (response.statusCode === 200) {
            loginPortalMain()
        }
        else {
            callback(false);
        }
    }

    function loginPortalMain() {
        const loginPortalMainURL = "http://portal.skku.edu/EP/web/portal/jsp/EP_Default1.jsp";
        const loginPortalMainForm = {
            D1: D1,
            roundkey: roundkey,
            D3: "SEED",
            type: "param"
        }

        request(
            {
                url: loginPortalMainURL,
                headers: crawler.getNormalHeader(),
                method: "POST",
                form: loginPortalMainForm,
                jar: crawler.getCookieJar(),
                encoding: null
            },
            loginPortalMainCallback
        );
    }

    function loginPortalMainCallback(error, response, body) {
        if (error) {
            callback(false);
            return;
        }
        else if (response.statusCode === 200) {
            const encodingType = charset(response.headers, body)
            const encodedBody = iconv.decode(body, encodingType)
            if (-1 < encodedBody.indexOf("다시 로그인")) {
                callback(false);
            }
            else {
                crawler.setTargetStr(encodedBody);

                crawler.moveTargetAfter("<title>");
                const nameDepartStr = crawler.getBetweenMoveTarget(" - ", "</title>");
                const nameDepartArr = nameDepartStr.split('/');

                studentName = nameDepartArr[0];
                studentDepartment = nameDepartArr[1];

                callback(true);
            }
        }
        else {
            callback(false);
        }
    }
};

exports.loginCheck = (callback) => {
    const loginCheckURL = "http://portal.skku.edu/EP/web/portal/jsp/EP_Default1.jsp";

    request(
        {
            url: loginCheckURL,
            headers: crawler.getNormalHeader(),
            method: "GET",
            jar: crawler.getCookieJar(),
            encoding: null
        }, (error, response, body) => {
            if (error) {
                callback(false);
            }
            else if (response.statusCode === 200) {
                const encodingType = charset(response.headers, body);
                const encodedBody = iconv.decode(body, encodingType);

                if (-1 < encodedBody.indexOf("다시 로그인")) {
                    callback(false);
                }
                else {
                    callback(true);
                }
            } else {
                callback(false);
            }
        }
    );
}

exports.getGlobalVal = (callback) => {
    const GLSURL = "http://portal.skku.edu/EP/web/portal/jsp/EP_setCert_post.jsp?type=1&method=SEED&url=https%3A%2F%2Fadmin.skku.edu%2Fco%2FCOCOUsrLoginAction.do%3Fmethod%3DloginGenMP";
    request(
        {
            url: GLSURL,
            headers: crawler.getNormalHeader(),
            method: "GET",
            jar: crawler.getCookieJar()
        },
        getGlobalValCallback
    );

    function getGlobalValCallback(error, response, body) {
        if (error) {
            callback("");
            return;
        }
        else if (response.statusCode === 200) {
            crawler.setTargetStr(body);
            roundkey2 = crawler.getBetweenMoveTarget("var roundkey_c = \"", "\"");
            if (0 < roundkey2.length) {
                getGlobalValLogin(roundkey2);
            }
            else {
                callback("");
            }
        }
        else {
            callback("");
        }
    }

    function getGlobalValLogin(roundkey2) {
        const getGlobalValLoginURL = "http://portal.skku.edu/EP/web/portal/jsp/EP_setCert_post_new.jsp";
        const getGlobalValLoginForm = {
            roundkey: roundkey2,
            url: "https://admin.skku.edu/co/COCOUsrLoginAction.do?method=loginGenMP",
            pmethod: "SEED"
        };
        request(
            {
                url: getGlobalValLoginURL,
                headers: crawler.getNormalHeader(),
                form: getGlobalValLoginForm,
                method: "POST",
                jar: crawler.getCookieJar()
            },
            getGlobalValLoginCallback
        );
    }

    function getGlobalValLoginCallback(error, response, body) {
        if (error) {
            callback("");
            return;
        }
        else if (response.statusCode === 200) {
            crawler.setTargetStr(body);

            crawler.moveTargetAfter('name="D0"');
            let D0 = crawler.getBetweenMoveTarget('value="', '"');
            crawler.moveTargetAfter('name="D1"');
            let D1 = crawler.getBetweenMoveTarget('value="', '"');
            crawler.moveTargetAfter('name="D2"');
            let D2 = crawler.getBetweenMoveTarget('value="', '"');
            crawler.moveTargetAfter('name="D3"');
            let D3 = crawler.getBetweenMoveTarget('value="', '"');
            crawler.moveTargetAfter('name="userid"');
            let userid = crawler.getBetweenMoveTarget('value="', '"');
            crawler.moveTargetAfter('name="roundkey"');
            let roundkey3 = crawler.getBetweenMoveTarget('value="', '"');
            crawler.moveTargetAfter('name="color_style"');
            let color_style = crawler.getBetweenMoveTarget('value="', '"');

            const getGlobalValFinalURL = "https://admin.skku.edu/co/COCOUsrLoginAction.do?method=loginGenMP";
            const getGlobalValFinalForm = {
                D0: D0,
                D1: D1,
                D2: D2,
                D3: D3,
                userid: userid,
                roundkey: roundkey3,
                color_style: color_style
            };

            request(
                {
                    url: getGlobalValFinalURL,
                    headers: crawler.getNormalHeader(),
                    form: getGlobalValFinalForm,
                    method: "POST",
                    jar: crawler.getCookieJar()
                },
                getGlobalValFinalCallback
            );
        }
        else {
            callback("");
        }
    }

    function getGlobalValFinalCallback(error, response, body) {
        if (error) {
            callback("");
            return;
        }
        else if (response.statusCode === 200) {
            crawler.setTargetStr(body);
            globalVal = crawler.getBetweenMoveTarget('MiInstaller.GlobalVal = "', '"');
            if (0 < globalVal.length) {
                callback(globalVal);
            }
            else {
                callback("");
            }
        }
        else {
            callback("");
        }
    }
}

exports.getGate = (callback) => {
    let postURL = "http://portal.skku.edu/EP/web/portal/jsp/EP_setCert_post.jsp?method=SEED";

    request(
        {
            url: postURL,
            headers: crawler.getNormalHeader(),
            method: "GET",
            jar: crawler.getCookieJar()
        },
        postCallback
    );

    function postCallback(error, response, body) {
        if (error) {
            callback(false);
        }
        else if (response.statusCode !== 200) {
            callback(false);
        }
        else {
            crawler.setTargetStr(body);
            crawler.moveTargetAfter("roundkey_c =");
            const roundkey = crawler.getBetween('"', '"')
            postNew(roundkey);
        }
    }

    function postNew(roundkey) {
        const postNewURL = "http://portal.skku.edu/EP/web/portal/jsp/EP_setCert_post_new.jsp";
        const postNewForm = {
            roundkey: roundkey,
            pmethod: "SEED"
        };

        request(
            {
                url: postNewURL,
                headers: crawler.getNormalHeader(),
                method: "POST",
                form: postNewForm,
                jar: crawler.getCookieJar()
            }
            , postNewCallback)
    }

    function postNewCallback(error, response, body) {
        if (error) {
            callback(false);
        }
        else if (response.statusCode !== 200) {
            callback(false);
        }
        else {
            crawler.setTargetStr(body);

            crawler.moveTargetAfter('name="D0"');
            const D0 = crawler.getBetweenMoveTarget('value="', '"');

            crawler.moveTargetAfter('name="D1"');
            const D1 = crawler.getBetweenMoveTarget('value="', '"');

            crawler.moveTargetAfter('name="D2"');
            const D2 = crawler.getBetweenMoveTarget('value="', '"');

            crawler.moveTargetAfter('name="D3"');
            const D3 = crawler.getBetweenMoveTarget('value="', '"');

            crawler.moveTargetAfter('name="userid"');
            const userid = crawler.getBetweenMoveTarget('value="', '"');

            crawler.moveTargetAfter('name="roundkey"');
            const roundkey = crawler.getBetweenMoveTarget('value="', '"');

            crawler.moveTargetAfter('name="color_style"');
            const color_style = crawler.getBetweenMoveTarget('value="', '"');

            callback({
                D0: D0,
                D1: D1,
                D2: D2,
                D3: D3,
                userid: userid,
                roundkey: roundkey,
                color_style: color_style
            });
        }
    }
}

/// new
exports.newLogin = (userId, userPwd, callback) => {
    const mainURL = "https://eportal.skku.edu/wps/portal/";

    request(
        {
            url: mainURL,
            headers: crawler.getNormalHeader(),
            method: "GET",
            jar: crawler.getCookieJar()
        },
        mainCallback
    );

    function mainCallback(error, response, body) {
        if (error) {
            callback(false);
        }
        else if (response.statusCode !== 200) {
            callback(false);
        }
        else {
            crawler.setTargetStr(body);
            crawler.moveTargetAfter("loginContainer");
            const loginURL = "https://eportal.skku.edu" + crawler.getBetween('action="', '"');
            const loginForm = {
                lang: "ko",
                saveid: "on",
                userid: userId,
                password: userPwd
            };

            request(
                {
                    url: loginURL,
                    headers: crawler.getNormalHeader(),
                    method: "POST",
                    form: loginForm,
                    followAllRedirects: true,
                    jar: crawler.getCookieJar()
                },
                loginCallback
            )
        }
    }

    function loginCallback(error, response, body) {
        if (error) {
            callback(false);
        }
        else if (response.statusCode !== 200) {
            callback(false);
        }
        else {
            crawler.setTargetStr(body);
            studentName = crawler.getBetween('user_kor_name = "', '"');
            if (-1 < body.indexOf("user_kor_name")) {
                callback(true);
            }
            else if (-1 < body.indexOf('location.href = "https://eportal.skku.edu/wps/portal"')) {
                callback(true);
            }
            else {
                callback(false);
            }
        }
    }
};

exports.newLoginCheck = (callback) => {
    const loginCheckURL = "https://eportal.skku.edu/wps/portal";

    request(
        {
            url: loginCheckURL,
            headers: crawler.getNormalHeader(),
            method: "GET",
            followAllRedirects: true,
            jar: crawler.getCookieJar()
        },
        (error, response, body) => {
            if (error) {
                callback(false);
            }
            else if (response.statusCode !== 200) {
                callback(false);
            }
            else {
                if (-1 < body.indexOf("user_kor_name")) {
                    callback(true);
                }
                else {
                    callback(false);
                }
            }
        }
    );
};

exports.newGetGlobalVal = (callback) => {
    const GLSURL = "https://eportal.skku.edu/wps/myinfo/glsCall.jsp";
    request(
        {
            url: GLSURL,
            headers: crawler.getNormalHeader(),
            method: "GET",
            jar: crawler.getCookieJar()
        },
        getGlobalValCallback
    );

    function getGlobalValCallback(error, response, body) {
        if (error) {
            callback("");
        }
        else if (response.statusCode !== 200) {
            callback("");
        }
        else {
            crawler.setTargetStr(body);
            crawler.moveTargetAfter('name="method"');
            const method = crawler.getBetween('value="', '"');
            crawler.moveTargetAfter('name="param"');
            const param = crawler.getBetween('value="', '"');

            const getGlobalValFinalURL = "https://admin.skku.edu/co/COCOUsrLoginAction.do";
            const getGlobalValFinalForm = {
                method: method,
                param: param
            };

            request(
                {
                    url: getGlobalValFinalURL,
                    headers: crawler.getNormalHeader(),
                    form: getGlobalValFinalForm,
                    method: "POST",
                    jar: crawler.getCookieJar()
                },
                getGlobalValFinalCallback
            );
        }
    }

    function getGlobalValFinalCallback(error, response, body) {
        if (error) {
            callback("");
        }
        else if (response.statusCode !== 200) {
            callback("");
        }
        else {
            crawler.setTargetStr(body);
            globalVal = crawler.getBetweenMoveTarget('MiInstaller.GlobalVal = "', '"');
            if (0 < globalVal.length) {
                callback(globalVal);
            }
            else {
                callback("");
            }
        }
    }
};

exports.newGetpToken = (callback) => {
    let cookieStr = crawler.getCookieJar()['_jar']['store']['idx']['skku.edu']['/']['pToken'].toString();
    if (cookieStr) {
        crawler.setTargetStr(cookieStr);
        const pToken = crawler.getBetween('pToken=', ';');
        callback(pToken);
    }
    else {
        callback("");
    }
}