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
                            ntc.no = noTmp
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

                    noticeObj.list.push(ntc);
                });

                callback(noticeObj);
            }
        }
    );
}