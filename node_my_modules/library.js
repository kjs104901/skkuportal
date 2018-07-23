const request = require('request'); // to request http

const { crawler } = require('./util.js');

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