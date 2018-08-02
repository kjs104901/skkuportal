const notice = require("./node_my_modules/notice");

notice.getDomNotice(1, 30, (result) => {
    console.log(result);
});