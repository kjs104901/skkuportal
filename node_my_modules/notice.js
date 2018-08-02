const request = require('request');

const { crawler } = require('./util.js');

exports.getNotice = (type, offset, callback) => {
    let noticeObj = {
        list: [],
        last: 0
    }

    let noticeURL = "https://www.skku.edu/skku/campus/skk_comm/notice0"
    noticeURL += type+".do?mode=list&&articleLimit=10";
    noticeURL += "&article.offset=" + offset;

    request(
        {
            url: noticeURL,
            headers: crawler.getNormalHeader(),
            method: "GET"
        }, (error, response, body) => {
            if (error) {
                callback(noticeObj);
            }
            else if (response.statusCode !== 200) {
                callback(noticeObj);
            }
            else {
                crawler.setTargetStr(body);
                const tbodyStr = crawler.getBetween("<tbody>", "</tbody>");
                const pageingStr = crawler.getBetween('<ul class="paging">', "</ul>");
                
                let trStrList = [];
                crawler.setTargetStr(tbodyStr);
                while (-1 < crawler.getTargetStr().indexOf("<tr")) {
                    const trStr = crawler.getBetweenMoveTarget("<tr", "</tr>");
                    trStrList.push(trStr);
                }
                trStrList.forEach(trStr => {
                    crawler.setTargetStr(trStr);

                    let ntc = {
                        no: 0,
                        title: "",
                        url: "",
                        date: "",
                        attachment: []
                    };

                    let column = 0;
                    while (-1 < crawler.getTargetStr().indexOf("<td")) {
                        crawler.moveTargetAfter("<td")
                        const tdStr = crawler.getBetweenMoveTarget(">", "</td>");
                        if (column === 0) {
                            let noTmp = tdStr;
                            noTmp = noTmp.replace(/\r/g,"");
                            noTmp = noTmp.replace(/\n/g,"");
                            noTmp = noTmp.replace(/\t/g,"");
                            noTmp = noTmp.replace(/ /g,"");
                            ntc.no = noTmp * 1;
                        }
                        else if (column === 1) {
                            const tmpStr = crawler.getTargetStr();

                            crawler.setTargetStr(tdStr);
                            let ntcURL = crawler.getBetweenMoveTarget('href="', '"');
                            ntcURL = ntcURL.replace(/&amp;/g,"&");
                            ntc.url = "https://www.skku.edu/skku/campus/skk_comm/notice0"+type+".do" + ntcURL;

                            let titleTmp = crawler.getBetween('>', '<');
                            titleTmp = titleTmp.replace(/\r/g,"");
                            titleTmp = titleTmp.replace(/\n/g,"");
                            titleTmp = titleTmp.replace(/\t/g,"");
                            titleTmp = titleTmp.replace(/  /g,"");
                            ntc.title = titleTmp

                            crawler.setTargetStr(tmpStr);
                        }
                        else if (column === 2) {ntc.date = tdStr}
                        else if (column === 4) {
                            const tmpStr = crawler.getTargetStr();

                            crawler.setTargetStr(tdStr);
                            const fileListStr = crawler.getBetween('<ul class="filedown_list">', "</ul>");
                            crawler.setTargetStr(fileListStr);
                            while (-1 < crawler.getTargetStr().indexOf('href="')) {
                                const fileURLStr = crawler.getBetweenMoveTarget('href="', '"');
                                let fileName = crawler.getBetweenMoveTarget('>', '<');
                                fileName = fileName.replace(/\r/g,"");
                                fileName = fileName.replace(/\n/g,"");
                                fileName = fileName.replace(/\t/g,"");

                                let fileURL = "https://www.skku.edu/skku/campus/skk_comm/notice0"+type+".do" + fileURLStr;
                                fileURL = fileURL.replace(/&amp;/g,"&");

                                ntc.attachment.push({
                                    name: fileName,
                                    url: fileURL
                                });
                            }
                            crawler.setTargetStr(tmpStr);
                        }

                        column += 1;
                    }

                    if (0 < ntc.title.length) {
                        noticeObj.list.push(ntc);
                    }
                });

                let maxOffset = 0;
                crawler.setTargetStr(pageingStr);
                while (-1 < crawler.getTargetStr().indexOf("article.offset=")) {
                    const offsetTmp = crawler.getBetweenMoveTarget('article.offset=', '"') * 1;
                    if (maxOffset < offsetTmp) {
                        maxOffset = offsetTmp;
                    }
                }
                noticeObj.last = maxOffset;

                callback(noticeObj);
            }
        }
    );
}

exports.getDomNotice = (campusType, offset, callback) => {
    let noticeObj = {
        list: [],
        last: 0
    }

    let domNoticeURL = "https://dorm.skku.edu/"
    if (campusType === 0) {
        domNoticeURL += "skku_seoul/";
    }
    else if (campusType === 1) {
        domNoticeURL += "skku/";
    }
    domNoticeURL += "notice/notice_all.jsp?mode=list";
    domNoticeURL += "&pager.offset=" + offset;

    request(
        {
            url: domNoticeURL,
            headers: crawler.getNormalHeader(),
            method: "GET"
        }, (error, response, body) => {
            if (error) {
                callback(noticeObj);
            }
            else if (response.statusCode !== 200) {
                callback(noticeObj);
            }
            else {

                crawler.setTargetStr(body);
                const tbodyStr = crawler.getBetween("<tbody>", "</tbody>");
                const pageingStr = crawler.getBetween('<div class="paging">', "</html>");
                
                let trStrList = [];
                crawler.setTargetStr(tbodyStr);
                while (-1 < crawler.getTargetStr().indexOf("<tr")) {
                    const trStr = crawler.getBetweenMoveTarget("<tr", "</tr>");
                    trStrList.push(trStr);
                }
                
                trStrList.forEach(trStr => {
                    crawler.setTargetStr(trStr);

                    let ntc = {
                        no: 0,
                        type: "",
                        title: "",
                        url: "",
                        date: "",
                        attachment: false
                    };

                    let column = 0;
                    while (-1 < crawler.getTargetStr().indexOf("<td")) {
                        crawler.moveTargetAfter("<td")
                        const tdStr = crawler.getBetweenMoveTarget(">", "</td>");
                        if (column === 0) {
                            let noTmp = tdStr;
                            noTmp = noTmp.replace(/\r/g,"");
                            noTmp = noTmp.replace(/\n/g,"");
                            noTmp = noTmp.replace(/\t/g,"");
                            noTmp = noTmp.replace(/ /g,"");
                            ntc.no = noTmp * 1;
                            if (!ntc.no) {
                                ntc.no = -1;
                            }
                        }
                        else if (column === 1) {
                            let typeTmp = tdStr;
                            typeTmp = typeTmp.replace(/\r/g,"");
                            typeTmp = typeTmp.replace(/\n/g,"");
                            typeTmp = typeTmp.replace(/\t/g,"");
                            typeTmp = typeTmp.replace(/ /g,"");
                            ntc.type = typeTmp
                        }
                        else if (column === 2) {
                            const tmpStr = crawler.getTargetStr();

                            crawler.setTargetStr(tdStr);
                            let ntcURL = crawler.getBetweenMoveTarget('href="', '"');
                            ntcURL = ntcURL.replace(/&amp;/g,"&");
                            ntc.url = ntcURL;

                            let titleTmp = crawler.getBetween('>', '<');
                            titleTmp = titleTmp.replace(/\r/g,"");
                            titleTmp = titleTmp.replace(/\n/g,"");
                            titleTmp = titleTmp.replace(/\t/g,"");
                            titleTmp = titleTmp.replace(/  /g,"");
                            ntc.title = titleTmp

                            crawler.setTargetStr(tmpStr);
                        }
                        else if (column === 3) {
                            if (-1 < tdStr.indexOf("<img")) {
                                ntc.attachment = true;
                            }
                        }
                        else if (column === 4) {ntc.date = tdStr}

                        column += 1;
                    }

                    if (0 < ntc.title.length) {
                        noticeObj.list.push(ntc);
                    }
                });

                let maxOffset = 0;
                crawler.setTargetStr(pageingStr);
                while (-1 < crawler.getTargetStr().indexOf("pager.offset=")) {
                    const offsetTmp = crawler.getBetweenMoveTarget('pager.offset=', '"') * 1;
                    if (maxOffset < offsetTmp) {
                        maxOffset = offsetTmp;
                    }
                }
                noticeObj.last = maxOffset;

                callback(noticeObj);
            }
        }
    );
}