const ConsoleColor = require("colors");

function Log(message = "") {
    if (message) console.log(("[" + GetTime() + "] [NodeJS] [Info]\t: " + message).brightGreen);
}

function LogDebug(message = "") {
    if (message) console.log(("[" + GetTime() + "] [NodeJS] [Debug]\t: " + message).green);
}

function LogWarn(message = "") {
    if (message) console.log(("[" + GetTime() + "] [NodeJS] [Warn]\t: " + message).brightYellow);
}

function LogError(message = "") {
    if (message) console.log(("[" + GetTime() + "] [NodeJS] [Error]\t: " + message).red);
}

function LogNetwork(message = "") {
    if (message) console.log(("[" + GetTime() + "] [NodeJS] [Network]\t: " + message).brightCyan);
}

function GetTime() {
    var DateTime = new Date();
    return DateTime.getMonth() + "/" + DateTime.getDay() + "/" + DateTime.getFullYear() + " " + (DateTime.getHours() < 10 ? "0" : "") + DateTime.getHours() + ":" + (DateTime.getMinutes() < 10 ? "0" : "") + DateTime.getMinutes() + ":" + (DateTime.getSeconds() < 10 ? "0" : "") + DateTime.getSeconds();
}

module.exports.Log = Log;
module.exports.LogDebug = LogDebug;
module.exports.LogWarn = LogWarn;
module.exports.LogError = LogError;
module.exports.LogNetwork = LogNetwork;