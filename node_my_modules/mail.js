const poplib = require("./pop3.js");
const simpleParser = require('mailparser').simpleParser;
var multipart = require('parse-multipart');
const iconv = require('iconv-lite'); // to encode enc-kr
const fs = require('fs');

const { crawler } = require('./util.js');

const mailBoxDir = __dirname + "/mailbox/mail_";

let isProccessing = false;
let emailList = [];

let totalNumber = 0;
let currentNumber = 0;

exports.getEmailList = (userId, userPass, callback) => {
    let error;

    if (isProccessing) {
        error = "is Proccessing";
        callback(error);
        return;
    }
    isProccessing = true;

    totalNumber = 0;
    currentNumber = 0;

    const popClient = new poplib(110, "mail.skku.edu", {
        tlserrs: false,
        enabletls: false,
        debug: false
    });

    popClient.on("error", function (err) {
        error = err;
        callback(error);
        isProccessing = false;
    });

    popClient.on("connect", function () {
        popClient.login(userId, userPass);
    });

    popClient.on("login", function (status, rawdata) {
        if (status) {
            popClient.list();
        } else {
            error = "Login failed";
            callback(error);
            isProccessing = false;
            popClient.quit();
        }
    });

    popClient.on("list", function (status, msgcount, msgnumber, data, rawdata) {
        if (status === false) {
            error = "List failed";
            callback(error);
            isProccessing = false;
            popClient.quit();
        } else {
            emailList = [];
            for (let index = 1; index <= msgcount; index++) {
                emailList[index]={
                    status: false,
                    id: data[index],
                    title: "",
                    from: "",
                    to: "",
                    date: "",
                    body: "",
                    attachments: []
                };
            }

            if (msgcount > 0) {
                totalNumber = msgcount;
                currentNumber = totalNumber;
                retrvStart();
            }
            else {
                callback(error);
                isProccessing = false;
                popClient.quit();
            }
        }
    });

    let retrvStart = () => {
        if (0 < currentNumber) {
            if (fs.existsSync(mailBoxDir + emailList[currentNumber].id  + ".json")){
                fs.readFile(mailBoxDir + emailList[currentNumber].id  + ".json", (err, data) => {
                    if (!err) {
                        emailList[currentNumber] = JSON.parse(data);
                    }

                    currentNumber -= 1;
                    retrvStart();
                });
            }
            else {
                popClient.retr(currentNumber);
                currentNumber -= 1;
            }
        }
        else {
            callback(error);
            isProccessing = false;
            popClient.quit();
        }
    }

    popClient.on("retr", function (status, msgnumber, data, rawdata, buffer) {
        if (status === true) {
            simpleParser(data, (err, mail) => {
                let decodedData = ""
                let bodyStr = ""

                let charset;
                if (mail.headers.has("content-type")) {
                    charset = mail.headers.get("content-type").params.charset;
                }

                if (charset) {
                    decodedData = iconv.decode(buffer, charset);
                    crawler.setTargetStr(decodedData);
                    bodyStr = crawler.getAfter("\r\n\r\n");
                }
                else if (mail.headers.get("content-type").value === 'multipart/mixed'){
                    decodedData = iconv.decode(buffer, "euc-kr");
                    crawler.setTargetStr(decodedData);

                    let boundary = mail.headers.get("content-type").params.boundary;
                    crawler.moveTargetAfter(boundary);
                    crawler.moveTargetAfter(boundary);
                    crawler.moveTargetAfter("\r\n\r\n");
                    bodyStr = crawler.getUntil(boundary);
                }
                else {
                    bodyStr = mail.html;
                }

                if (mail.headers.has("content-transfer-encoding")) {
                    if (mail.headers.get("content-transfer-encoding") === 'base64') {
                        let tempBuffer = Buffer.from(bodyStr, 'base64');
                        if (charset) {
                            bodyStr = iconv.decode(tempBuffer, charset).toString();
                        }
                        else {
                            bodyStr = tempBuffer.toString();
                        }
                    }
                    else if (mail.headers.get("content-transfer-encoding") === 'quoted-printable') {
                        bodyStr = mail.html;
                    }
                }

                emailList[msgnumber].status = true;
                if ('subject' in mail) {
                    emailList[msgnumber].title = mail.subject;
                }
                if ('from' in mail) {
                    emailList[msgnumber].from = mail.from.text;
                }
                if ('to' in mail) {
                    emailList[msgnumber].to = mail.to.text;
                }
                if ('date' in mail) {
                    emailList[msgnumber].date = mail.date;
                }
                emailList[msgnumber].body = bodyStr;
                emailList[msgnumber].attachments = mail.attachments;

                let mailId = emailList[msgnumber].id;

                fs.writeFile(mailBoxDir+mailId+".json", JSON.stringify(emailList[msgnumber]), () =>{

                });
            });

            retrvStart();

        } else {
            error = "Retr failed";
            callback(error);
            isProccessing = false;
            popClient.quit();
        }
    });
}

exports.getEmail = (emailIndex) => {
    let email = {
        status: false,
        id: emailIndex,
        title: "",
        from: "",
        to: "",
        date: "",
        attachments: []
    };

    if (emailList[emailIndex]) {
        if (emailList[emailIndex].status) {
            email = emailList[emailIndex]
        }
    }
    return email;
};

exports.getTotalNumber = () => {
    return totalNumber;
};

exports.getCurrentNumber = () => {
    return currentNumber;
};