const poplib = require("./pop3.js");
const simpleParser = require('mailparser').simpleParser;
var multipart = require('parse-multipart');
const iconv = require('iconv-lite'); // to encode enc-kr
const fs = require('fs');

const { crawler } = require('./util.js');

const mailBoxDir = __dirname + "/mailbox/";

let popClient = null;

let isProcessing = false;
let emailList = [];

let totalNumber = 0;
let currentNumber = -1;

exports.init = () => {
    if (isProcessing) {
        if (popClient) {
            popClient.quit();
            popClient = null;
        }
        isProcessing = false;
    }
    emailList = [];

    totalNumber = 0;
    currentNumber = -1;
}

exports.retreiveStart = (userId, userPass, callbackError) => {
    const mailBoxDirUser = mailBoxDir + userId;
    const mailBoxDirPrefix = mailBoxDirUser + "/mail_";

    const isDirExists = fs.existsSync(mailBoxDirUser) && fs.lstatSync(mailBoxDirUser).isDirectory();
    if (!isDirExists) {
        fs.mkdirSync(mailBoxDirUser);
    }

    let error;

    if (isProcessing) {
        error = "is Proccessing";
        callbackError(error);
        return;
    }
    isProcessing = true;

    popClient = new poplib(110, "mail.skku.edu", {
        tlserrs: false,
        enabletls: false,
        debug: false
    });

    popClient.on("error", function (err) {
        error = "err";
        callbackError(error);
        isProcessing = false;
    });

    popClient.on("connect", function () {
        popClient.login(userId, userPass);
    });

    popClient.on("login", function (status, rawdata) {
        if (status) {
            popClient.list();
        } else {
            error = "Login failed";
            callbackError(error);
            isProcessing = false;
            popClient.quit();
        }
    });

    popClient.on("list", function (status, msgcount, msgnumber, data, rawdata) {
        if (status === false) {
            error = "List failed";
            callbackError(error);
            isProcessing = false;
            popClient.quit();
        } else {
            emailList = [];
            for (let index = 1; index <= msgcount; index++) {
                emailList[index] = {
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
                error = "mgscount 0"
                callbackError(error);
                isProcessing = false;
                popClient.quit();
            }
        }
    });

    let retrvStart = () => {
        if (0 < currentNumber) {
            if (fs.existsSync(mailBoxDirPrefix + emailList[currentNumber].id + ".json")) {
                fs.readFile(mailBoxDirPrefix + emailList[currentNumber].id + ".json", (err, data) => {
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
            error = "currentNumber";
            callbackError(error);
            isProcessing = false;
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
                else if (mail.headers.get("content-type").value === 'multipart/mixed') {
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

                fs.writeFile(mailBoxDirPrefix + mailId + ".json", JSON.stringify(emailList[msgnumber]), () => {

                });
            });

            retrvStart();

        } else {
            error = "Retr failed";
            callbackError(error);
            isProcessing = false;
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

exports.attachmentDownload = (emailIndex, attachIndex, downDirectory) => {
    if (emailList[emailIndex]) {
        if (emailList[emailIndex].status) {
            if (attachIndex < emailList[emailIndex].attachments.length) {
                fs.writeFile(downDirectory,
                    Buffer.from((emailList[emailIndex].attachments)[attachIndex].content.data)
                )
            }
        }
    }
};

exports.checkProcessing = () => {
    return isProcessing;
}

exports.getTotalNumber = () => {
    return totalNumber;
};

exports.getCurrentNumber = () => {
    return currentNumber;
};

const rmDir = (dirPath, removeSelf) => {
    if (removeSelf === undefined)
        removeSelf = true;
    try { var files = fs.readdirSync(dirPath); }
    catch (e) { return; }
    if (files.length > 0)
        for (var i = 0; i < files.length; i++) {
            var filePath = dirPath + '/' + files[i];
            if (fs.statSync(filePath).isFile() && files[i] !== "empty") 
                fs.unlinkSync(filePath);
            else
                rmDir(filePath);
        }
    if (removeSelf)
        fs.rmdirSync(dirPath);
};

exports.clearMailbox = () => {
    const fd = mailBoxDir;
    rmDir(fd, false);
};

/// gate web mail
const gatePath = __dirname + "/gate/mail.html";
exports.setGate = (gate) => {
    let gateStr = fs.readFileSync(gatePath, {encoding : "utf8"}).split("// data //");
    gateStr[1] = '\n';
    gateStr[1] += 'D0: "'+gate.D0+'",\n';
    gateStr[1] += 'D1: "'+gate.D1+'",\n';
    gateStr[1] += 'D2: "'+gate.D2+'",\n';
    gateStr[1] += 'D3: "'+gate.D3+'",\n';
    gateStr[1] += 'userid: "'+gate.userid+'",\n';
    gateStr[1] += 'roundkey: "'+gate.roundkey+'",\n';
    gateStr[1] += 'color_style: "'+gate.color_style+'",\n';
    gateStr[1] += '\n';

    const newGateStr = gateStr.join("// data //");
    fs.writeFileSync(gatePath, newGateStr);
};

exports.getGatePath = () => {
    return gatePath;
}

exports.clearGatePath = () => {
    let gateStr = fs.readFileSync(gatePath, {encoding : "utf8"}).split("// data //");
    gateStr[1] = '\n';

    const newGateStr = gateStr.join("// data //");
    fs.writeFileSync(gatePath, newGateStr);
}