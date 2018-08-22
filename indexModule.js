const notice = require("./node_my_modules/notice");
const library = require("./node_my_modules/library");
const meal = require("./node_my_modules/meal");
const transportation = require("./node_my_modules/transportation")
const calendar = require("./node_my_modules/calendar")
const smartgls = require("./node_my_modules/smartgls")
const mail = require("./node_my_modules/mail")
const request = require('request');
const portal = require("./node_my_modules/portal");
const icampus = require('./node_my_modules/icampus')
const weather = require('./node_my_modules/weather');

notice.getNoticeList(2, 10, (result) => {
    console.log(result);
})

/*
weather.getWeather(0, (result) => {
    console.log(result);
})

    portal.newLoginCheck((result) => {
        console.log(result);
    })
portal.newLogin("kjs104901", "wlstn104901*", (result) => {
    console.log(result);
    portal.newLoginCheck((result) => {
        console.log(result);
                
        portal.newLogin("kjs104901", "wlstn104901*", (result) => {
            console.log(result);
        });
    })
})
mail.retreiveStart("kjs104901", "wlstn104901*", (result) => {
    callback({
        err: result,
        errMessage: "메일 서버 통신 실패" + result
    })
})


smartgls.login("kjs104901", "wlstn104901*", (result) => {
    console.log(result);
    if (result) {
        //smartgls.getSemesterList((result) => {
        //    console.log(result);
        //})

        smartgls.getWeekTable((result) => {
            console.log(result);
        })
    }
})

/*
transportation.getSuttleInfo((result) => {
    console.log(result);
});
calendar.getCalendar(2018, 8, (result) => {
    //console.log(result);
});
calendar.getDomCalendar(2018, 8, (result) => {
    console.log(result);
});

transportation.getSuttle(2002, (result)=>{
    console.log(result);
})

notice.getDomNoticeList(0, 0, (result) => {
    console.log(result.list[2].url);

    notice.getDomNotice(result.list[2].url, (result) => {
        console.log(result);
    })
})

notice.getNoticeList(1, 0, (result) => {
    console.log(result.list);

    notice.getNotice(result.list[2].url, (result) => {
        console.log(result);
    })
})


meal.getDomMealList(1, 2018, 8, 4, (result) => {
    console.log(result.breakfast);
})

/*
const cat = meal.getCurrentCategory();
const resList = meal.getRestaurantList();
console.log(resList);
meal.getMealList(resList[2], meal.LUNCH, (result)=>{
    console.log(result);
});

*/