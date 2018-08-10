const request = require('request'); // to request http

const { crawler } = require('./util.js');

exports.getCalendar = (year, month, callback) => {
    month = "0" + month; month = month.slice(-2);
    let calendarURL = "https://www.skku.edu/app/board/calendar/getMonthData.do?boardNo=23";
    calendarURL += "&date="+year+"-"+month+"-01";

    let calendar = [];
    request(
        {
            url: calendarURL,
            headers: crawler.getNormalHeader(),
            method: "GET"
        }, (error, response, body) => {
            if (error) {
                callback(calendar);
            }
            else if (response.statusCode !== 200) {
                callback(calendar);
            }
            else {
                const resultJSON = JSON.parse(body);
                if (resultJSON.success) {
                    resultJSON.data.forEach(calElement => {
                        calendar.push({
                            title: calElement.title,
                            startDate: calElement.etcDate1,
                            endDate: calElement.etcDate2,
                            color: calElement.color
                        })
                    });
                }
                callback(calendar);
            }
        }
    );
}

exports.getDomCalendar = (year, month, callback) => {
    month = "0" + month; month = month.slice(-2);
    let calendarURL = "https://dorm.skku.edu/_custom/skku/_common/board/miniboard/calendarDetailList.jsp?";
    calendarURL += "searchDate=+"+year+month+"&board_no=63&calendarType=MONTH&locale=ko"

    let calendar = [];
    request(
        {
            url: calendarURL,
            headers: crawler.getNormalHeader(),
            method: "GET",
        }, (error, response, body) => {
            if (error) {
                callback(calendar);
            }
            else if (response.statusCode !== 200) {
                callback(calendar);
            }
            else {
                const resultJSON = JSON.parse(body);
                resultJSON.list.forEach(calElement => {
                    calendar.push({
                        title: calElement.article_title,
                        startDate: calElement.etc_char1,
                        endDate: calElement.etc_char2
                    })
                });
                callback(calendar);
            }
        }
    );
}