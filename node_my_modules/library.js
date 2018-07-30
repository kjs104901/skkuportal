const request = require('request'); // to request http

const { crawler } = require('./util.js');

let userCampusType = 0;

exports.getSeats = (campusType, callback) => {
    let seatsUrl = "";

    if (campusType === 0) {
        seatsUrl = "http://lib.skku.edu/smufu-api/mo/1/rooms-at-seat?buildingId=1&roomTypeId=2";
    }
    else if (campusType === 1) {
        seatsUrl = "http://lib.skku.edu/smufu-api/mo/1/rooms-at-seat?buildingId=1&roomTypeId=2";
    }
    else {
        return;
    }


    request(
        {
            url: seatsUrl,
            headers: crawler.getNormalHeader(),
            method: "GET"
        }, (error, response, body) => {
            if (error) {
                callback([]);
                return;
            }
            else if (response.statusCode === 200) {
                const resultJson = JSON.parse(body);
                const resultNumber = resultJson.data.totalCount;
                const resultArray = resultJson.data.list;

                if (0 < resultNumber) {
                    let finalArray = resultArray.map((obj) => {
                        return {
                            name: obj.room.name,
                            isActive: obj.room.isActive,
                            total: obj.total,
                            occupied: obj.occupied,
                            beginTime: obj.periodSeatChargeRule.beginTime,
                            endTime: obj.periodSeatChargeRule.endTime
                        };
                    });
                    callback(finalArray);
                }
                else {
                    callback([]);
                }
            }
            else {
                callback([]);
            }
        }
    );
}

exports.loginDirect = (userId, userPass, callback) => {
    const loginURL = "https://lib.skku.edu/pyxis-api/api/login";
    const loginJson = {
        loginId: userId,
        password: userPass
    }
    
    request(
        {
            url: loginURL,
            headers: crawler.getLibraryHeader(),
            method: "POST",
            json: loginJson,
            jar: crawler.getCookieJar()
        },
        loginCallback
    );
    function loginCallback(error, response, body) {
        if (error) {
            callback(false);
        }
        else if (response.statusCode !== 200) {
            callback(false);
        }
        else if (body.code !== 'success.loggedIn') {
            callback(false);
        }
        else {
            if (body.data.branch.id === 2) {
                userCampusType = 1;
            }
            crawler.setLibraryHeaderAccessToken(body.data.accessToken)
            callback(true);
        }
    }
}

exports.loginCheck = (callback) => {
    const loginCheckURL = "https://lib.skku.edu/pyxis-api/2/api/my-info";

    request(
        {
            url: loginCheckURL,
            headers: crawler.getLibraryHeader(),
            method: "GET",
            jar: crawler.getCookieJar()
        },
        loginCheckCallback
    );
    function loginCheckCallback(error, response, body) {
        const bodyJson = JSON.parse(body);
        if (error) {
            callback(false);
        }
        else if (response.statusCode !== 200) {
            callback(false);
        }
        else if (bodyJson.code !== 'success.retrieved') {
            callback(false);
        }
        else {
            callback(true);
        }
    }
}

exports.getCampusType = () => {
    return userCampusType;
}

exports.getHold = (callback) => {
    const holdURL = "https://lib.skku.edu/pyxis-api/2/api/holds?max=1000";

    request(
        {
            url: holdURL,
            headers: crawler.getLibraryHeader(),
            method: "GET",
            jar: crawler.getCookieJar()
        },
        holdCallback
    );
    function holdCallback(error, response, body) {
        const bodyJson = JSON.parse(body);
        if (error) {
            callback([]);
        }
        else if (response.statusCode !== 200) {
            callback([]);
        }
        else if (bodyJson.code !== 'success.retrieved') {
            callback([]);
        }
        else {
            callback(bodyJson.data.list);
        }
    }
}

exports.getCharge = (callback) => {
    const chargeURL = "https://lib.skku.edu/pyxis-api/2/api/charges?max=1000";

    request(
        {
            url: chargeURL,
            headers: crawler.getLibraryHeader(),
            method: "GET",
            jar: crawler.getCookieJar()
        },
        chargeCallback
    );
    function chargeCallback(error, response, body) {
        const bodyJson = JSON.parse(body);
        if (error) {
            callback([]);
        }
        else if (response.statusCode !== 200) {
            callback([]);
        }
        else if (bodyJson.code !== 'success.retrieved') {
            callback([]);
        }
        else {
            callback(bodyJson.data.list);
        }
    }
}

exports.getOverDue = (callback) => {
    let overDueList = [];
    const chargeURL = "https://lib.skku.edu/pyxis-api/2/api/charges?max=1000";

    request(
        {
            url: chargeURL,
            headers: crawler.getLibraryHeader(),
            method: "GET",
            jar: crawler.getCookieJar()
        },
        chargeCallback
    );
    function chargeCallback(error, response, body) {
        const bodyJson = JSON.parse(body);
        if (error) {
            callback([]);
        }
        else if (response.statusCode !== 200) {
            callback([]);
        }
        else if (bodyJson.code !== 'success.retrieved') {
            callback([]);
        }
        else {
            bodyJson.data.list.forEach(element => {
                if (0 < element.overdueDays) {
                    overDueList.push();
                }
            });
            callback(overDueList);
        }
    }
}