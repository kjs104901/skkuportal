const notice = require("./node_my_modules/notice");
const library = require("./node_my_modules/library");
const meal = require("./node_my_modules/meal");
const transportation = require("./node_my_modules/transportation")

const request = require('request');

transportation.getSuttle(2002, (result)=>{
    console.log(result);
})

/*
/*
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