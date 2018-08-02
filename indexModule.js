const notice = require("./node_my_modules/notice");

notice.getNotice(2, 20, (result) => {
    console.log(result);
});