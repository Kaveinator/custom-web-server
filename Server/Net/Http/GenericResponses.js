//const DefaultError = '<!DOCTYPE html><html><head><title>{Title}</title><link href="/src/styles/framework.css" type="text/css" rel="stylesheet" /><link href="/src/styles/errorPageStyles.css" type="text/css" rel="stylesheet" /></head><body style="overflow: hidden;"><model name="header"></model><div id="errorBackground" class="container"></div><div id="errorText" class="container"><div class="background centerize"><h1>{Body}</h1><div class="marginBottom"></div></div></div><model name="footer"></model></body></html>';
const Models = require("./Templates"),
      ServerHandle = require("./Server"),
      Responses = [
          { Code: 200, Title: "OK", Body: "Everything is okay!" },
          { Code: 400, Title: "Bad Request", Body: "Your browser sent a malformed request to the server" },
          { Code: 401, Title: "Unauthorized", Body: "Authorization Required" },
          { Code: 403, Title: "Forbidden", Body: "Access to this resource has been revoked" },
          { Code: 404, Title: "Not Found", Body: "Object or Resource not Found" },
          { Code: 412, Title: "Precondition Failed", Body: "Unable to process or continue to process this request due to a failed precondition" },
          { Code: 500, Title: "Internal Server Error", Body: "An Internal Server Error Occured" },
          { Code: 503, Title: "Service Unavailable", Body: "Service is unavailable due to a server error" }
      ];

function SendErrorPage(clientData, errorCode = 200, replaceBody) {
    var _statusCode;
    for (var i = 0; i < Responses.length; i++) {
        if (Responses[i].Code == errorCode) {
            _statusCode = Responses[i];
            break;
        }
        else if (i + 1 == Responses.length) _statusCode = { Code: errorCode };
    }
    while (true) {
        if (_statusCode == undefined) { sleep(300); }
        else {
            // Old
            /*var _response = Models.Get("Generic/errorPage.html").
                replace("{errorCode}", _statusCode.Code).
                replace("{errorName}", _statusCode.Title).
                replace("{errorName}", _statusCode.Title).
                replace("{errorDesc}", (replaceBody ? replaceBody : _statusCode.Body));*/
            // New
            clientData.Socket.writeHead(errorCode, {'Content-Type': 'text/html'});
            clientData.fileExt = ".html";
            ServerHandle.FinishSend(clientData, Models.Get("Generic/errorPage.html", {
              errorCode: _statusCode.Code,
              errorName: _statusCode.Title,
              errorDesc: replaceBody || _statusCode.Body
            }));
            break;
        }
    }
}

function Redirect(clientData, location = "/") {
    clientData.Socket.writeHead(307, { "Location": "http://" + req.headers['host'] + location });
    clientData.Socket.end();
}

function sleep(ms = 100) {new Promise(resolve => { setTimeout(resolve, ms); })}

module.exports.SendErrorPage = SendErrorPage;
module.exports.Redirect = Redirect;
