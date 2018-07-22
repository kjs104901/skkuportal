const request = require('request'); // to request http

const iconv = require('iconv-lite'); // to encode enc-kr
const charset = require('charset'); // to find charset

const { crawler } = require('./util.js');

let studentName = "";
let studentDepartment = "";
let globalVal = "";


exports.portalLogin = (userId, userPwd, callback) => {
    const loginMainURL = "https://admin.skku.edu/co/COCOUsrLoginAction.do";
    const loginMainForm = {
        method: "loginMain",
        retPage: "http://www.skku.edu/new_home/login/dummySSO.jsp",
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

    function loginMainCallback (error, response, body){
        if (response.statusCode === 200) {
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
            retPage: "http://www.skku.edu/new_home/login/dummySSO.jsp",
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
        if (response.statusCode === 200) {
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

    function loginDummy () {
        const loginDummyURL = "http://www.skku.edu/new_home/login/dummySSO.jsp";
        const loginDummyForm = {
            D1: D1,
            roundkey: roundkey,
            retPage: "http://www.skku.edu/new_home/login/dummySSO.jsp",
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

    function loginDummyCallback (error, response, body) {
        if (response.statusCode === 200) {                    
            loginPortalWeb();
        }
        else {
            callback(false);
        }
    }

    function loginPortalWeb () {
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

    function loginPortalWebCallback (error, response, body) {
        if (response.statusCode === 200) {
            loginPortalMain()
        }
        else {
            callback(false);
        }
    }

    function loginPortalMain () {
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
        if (response.statusCode === 200) {         
            const encodingType = charset(response.headers, body)
            const encodedBody = iconv.decode(body, encodingType) 
            if (-1 < encodedBody.indexOf("다시 로그인")) {
                callback(false);
            }
            else {
                crawler.setTargetStr(encodedBody);

                crawler.moveTargetAfter("<title>");
                const nameDepartStr = crawler.getBetweenMoveTarget(" - ","</title>");
                const nameDepartArr = nameDepartStr.split('/');

                studentName = nameDepartArr[0];
                studentDepartment = nameDepartArr[1];

                getGLS()
            }
        }
        else {
            callback(false);
        }
    }

    function getGLS() {
        const GLSURL = "http://portal.skku.edu/EP/web/portal/jsp/EP_setCert_post.jsp?type=1&method=SEED&url=https%3A%2F%2Fadmin.skku.edu%2Fco%2FCOCOUsrLoginAction.do%3Fmethod%3DloginGenMP";
        request(
            {
                url: GLSURL,
                headers: crawler.getNormalHeader(),
                method: "GET",
                jar: crawler.getCookieJar()
            },
            getGLSCallback
        );
    }

    function getGLSCallback (error, response, body) {
        crawler.setTargetStr(body);
        roundkey2 = crawler.getBetweenMoveTarget("var roundkey_c = \"", "\"");
        if (0 < roundkey2.length) {
            getGLSLogin(roundkey2);
        }
        else {
            callback(false);
        }
    }

    function getGLSLogin(roundkey2) {
        const getGLSLoginURL = "http://portal.skku.edu/EP/web/portal/jsp/EP_setCert_post_new.jsp";
        const getGLSLoginForm = {
            roundkey: roundkey2,
            url: "https://admin.skku.edu/co/COCOUsrLoginAction.do?method=loginGenMP",
            pmethod: "SEED"
        };
        request(
            {
                url: getGLSLoginURL,
                headers: crawler.getNormalHeader(),
                form: getGLSLoginForm,
                method: "POST",
                jar: crawler.getCookieJar()
            },
            getGLSLoginCallback
        );
    }

    function getGLSLoginCallback (error, response, body) {
        if (response.statusCode === 200) {
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

            const getGLSFinalURL = "https://admin.skku.edu/co/COCOUsrLoginAction.do?method=loginGenMP";
            const getGLSFinalForm = {
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
                    url: getGLSFinalURL,
                    headers: crawler.getNormalHeader(),
                    form: getGLSFinalForm,
                    method: "POST",
                    jar: crawler.getCookieJar()
                },
                getGLSFinalCallback
            );
        }
        else {
            callback(false);
        }
    }

    function getGLSFinalCallback (error, response, body) {
        if (response.statusCode === 200) {
            crawler.setTargetStr(body);
            globalVal = crawler.getBetweenMoveTarget('MiInstaller.GlobalVal = "', '"');
            if (0 < globalVal.length) {
                callback(true);
            }
            else {
                callback(false);
            }
        }
        else {
            callback(false);
        }
    }
};


exports.getName = () => {
    return studentName;
}

exports.getDepartment = () => {
    return studentDepartment;
}

exports.getGlobalVal = () => {
    return globalVal;
}