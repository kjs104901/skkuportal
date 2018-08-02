const notice = require("./node_my_modules/notice");
const library = require("./node_my_modules/library");

library.loginDirect("kjs104901", "wlstn104901*", (result) => {
    if (result) {
        const univName = library.getUniversity();

        console.log("univName", univName)

        const univURL = notice.getUniversityNoticeURL(univName);
        
        console.log("univURL", univURL);
    }
})