const request = require('request');

const { crawler } = require('./util.js');


exports.BREAKFAST = "B";
exports.LUNCH = "L";
exports.DINNER = "D";
exports.SPECIAL = "S";

exports.getRestaurantList = () => {
    return [
        {
            campusType: 0,
            name: "패컬티식당",
            conspaceCd: 10201030,
            srResId: 1
        },
        {
            campusType: 0,
            name: "은행골",
            conspaceCd: 10201031,
            srResId: 2
        },
        {
            campusType: 0,
            name: "법고을식당",
            conspaceCd: 10201034,
            srResId: 4
        },
        {
            campusType: 0,
            name: "옥류천식당",
            conspaceCd: 10201032,
            srResId: 5
        },
        {
            campusType: 0,
            name: "금잔디식당",
            conspaceCd: 10201033,
            srResId: 6
        },
        {
            campusType: 1,
            name: "학생회관 행단골",
            conspaceCd: 20201104,
            srResId: 3
        },
        {
            campusType: 1,
            name: "교직원 식당",
            conspaceCd: 20201040,
            srResId: 11
        },
        {
            campusType: 1,
            name: "공대식당",
            conspaceCd: 20201097,
            srResId: 10
        },
    ]
}

exports.getCurrentCategory = () => {
    const currentDate = new Date();
    const currentHours = currentDate.getHours();

    let category = "L";
    if (currentHours < 10) {
        category = "B";
    }
    if (15 < currentHours) {
        category = "D";
    }
    return category;
}

exports.getMealList = (restaurant, category, year, month, day, callback) => {
    let mealList = [];

    let getMealURL = "";
    if (restaurant.campusType === 0) {
        getMealURL = "https://www.skku.edu/skku/campus/support/welfare_11.do?mode=info";
    }
    else if (restaurant.campusType === 1) {
        getMealURL = "https://www.skku.edu/skku/campus/support/welfare_11_1.do?mode=info";
    }

    month = "0" + month; month = month.slice(-2);
    day = "0" + day; day = day.slice(-2);
    getMealURL += "&srDt=" + year+"-"+month+"-"+day;

    getMealURL += "&conspaceCd=" + restaurant.conspaceCd;
    getMealURL += "&srResId=" + restaurant.srResId;
    getMealURL += "&srCategory=" + category;
    getMealURL += "&srShowTime=D";

    request(
        {
            url: getMealURL,
            headers: crawler.getNormalHeader(),
            method: "GET"
        }, (error, response, body) => {
            if (error) {
                callback(mealList);
            }
            else if (response.statusCode !== 200) {
                callback(mealList);
            }
            else {
                crawler.setTargetStr(body);
                while (-1 < crawler.getTargetStr().indexOf("corner_box")) {
                    crawler.moveTargetAfter("corner_box");

                    const cornerName = crawler.getBetweenMoveTarget("<span>", "</span>");
                    let menuStr = crawler.getBetweenMoveTarget("<pre>", "</pre>");
                    menuStr = menuStr.replace(/&amp;/g, "&"); 
                    menuStr = menuStr.replace(/\r/g, ""); 
                    menuStr = menuStr.replace(/,/g, " "); 
                    const menuList = menuStr.split("\n");

                    crawler.moveTargetAfter("가격");
                    let priceStr = crawler.getBetweenMoveTarget(":", "<");
                    priceStr = priceStr.replace(/ /g, "");
                    priceStr = priceStr.replace(/\r/g, "");
                    priceStr = priceStr.replace(/\n/g, "");
                    priceStr = priceStr.replace(/\t/g, "");
                    priceStr = priceStr.replace(/,/g, "");
                    priceStr = priceStr.replace(/원/g, "");
                    const price = priceStr * 1;

                    mealList.push({
                        cornerName: cornerName,
                        menuList: menuList,
                        price, price
                    });
                }
                callback(mealList);
            }
        }
    );
}

exports.getDomMealList = (campusType, year, month, day, callback) => {
    let mealObj = {
        breakfast: [],
        lunch: [],
        dinner: []
    };

    let getDomMealListURL = "https://dorm.skku.edu/_custom/skku/_common/board/schedule_menu/food_menu_page.jsp?";
    getDomMealListURL += "day="+day+"&month="+month+"&year="+year+"&lng=ko";
    if (campusType === 0) {
        getDomMealListURL += "&board_no=117";
    }
    if (campusType === 1) {
        getDomMealListURL += "&board_no=61";
    }
    
    request(
        {
            url: getDomMealListURL,
            headers: crawler.getNormalHeader(),
            method: "GET"
        }, (error, response, body) => {
            if (error) {
                callback(mealObj);
            }
            else if (response.statusCode !== 200) {
                callback(mealObj);
            }
            else {
                crawler.setTargetStr(body);

                const breakfastStr = crawler.getBetween('<div id="foodlist01"', "</div>");
                const lunchStr = crawler.getBetween('<div id="foodlist02"', "</div>");
                const dinnerStr = crawler.getBetween('<div id="foodlist03"', "</div>");

                for (let index = 0; index < 3; index++) {
                    let targetStr = "";
                    let targetArr = [];
                    if (index === 0) {
                        targetStr = breakfastStr;
                        targetArr = mealObj.breakfast;
                    }
                    if (index === 1) {
                        targetStr = lunchStr;
                        if (campusType === 0) {
                            targetStr = breakfastStr;
                        }
                        targetArr = mealObj.lunch;
                    }
                    if (index === 2) {
                        targetStr = dinnerStr;
                        targetArr = mealObj.dinner;
                    }
                    
                    crawler.setTargetStr(targetStr);
                    while (-1 < crawler.getTargetStr().indexOf("<li>")) {
                        crawler.moveTargetAfter("<li>");
                        crawler.moveTargetAfter("<span");
                        const type = crawler.getBetweenMoveTarget(">", "<");
                        const menuStr = crawler.getBetweenMoveTarget("<p>", "</p>");
                        const menu = menuStr.split(",");
                        
                        targetArr.push({
                            type: type,
                            menu: menu
                        });
                    }
                }
                callback(mealObj);
            }
        }
    );
}