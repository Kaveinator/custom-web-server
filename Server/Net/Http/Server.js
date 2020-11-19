// DETAILS: This class just routes things to the right component so the component can deal with it

// Constants (self-made)
const Debug = require("./../../Debug"),
      MimeTypes = require("./MimeTypes"),
      HttpTemplates = require("./Templates"),
      GenericResponses = require("./GenericResponses"),
      QueryHandler = require("./QueryHandler");

// Other Dependancies
const path = require('path'),
      SystemIO = require('fs'),
      { Console } = require("console"),
      { request } = require("http"),
      QueryCodes = {
        "%0A": "\n",
        "%20": " ",
        "%21": "!",
        "%22": "\"",
        "%23": "#",
        "%24": "$",
        "%2F": "/",

        "%27": "'",
        "%28": "(",
        "%29": ")",

        "%3A": ":",
        "%3B": ";",
        "%3F": "?",

        "%40": "@",

        "%5e": "^",
        "5C": "\\",

        "%25": "%"
      };

// Variables
var HttpServer;
const SiteRoot = path.join(__dirname, "../../..", "wwwstatic");

function Start(port = 80) {
    // Init all the objects
    QueryHandler.Init();
    HttpTemplates.Init();

    // Start the HTTP server
    HttpServer = require("http").createServer((_clientRequest, _serverResponse) => {
        // Once we get a request what do we do?
        // Orginize all the variables and check if they are needed
        // Then do an action based on what is defined
        var requestData = {
            path: (_clientRequest.url.indexOf("?") == -1 ? _clientRequest.url : _clientRequest.url.substring(0, _clientRequest.url.indexOf("?"))),
            query: (_clientRequest.url.indexOf("?") == -1 ? undefined : _clientRequest.url.substring(_clientRequest.url.indexOf("?") + 1, _clientRequest.url.length)),
            fullPath: undefined,
            fileExt: undefined,
            Request: _clientRequest,
            Socket: _serverResponse
        };
        requestData.fullPath = path.join(SiteRoot, requestData.path);
        requestData.fileExt = (requestData.path.indexOf('.') != -1 ? requestData.path.substring(requestData.path.lastIndexOf('.')) : undefined);
        requestData.Send = data => FinishSend(requestData, data);
        requestData.SendErrorPage = (code, body) => GenericResponses.SendErrorPage(requestData, code, body);

        //#region This is to format the requestData.path
        while (requestData.path.indexOf("%20") != -1) requestData.path = requestData.path.replace("%20", " ");
        // This is a query thing: while (requestData.path.indexOf("+") != -1) requestData.path = requestData.path.replace("+", " ");
        while (requestData.path.indexOf("%21") != -1) requestData.path = requestData.path.replace("%21", "!");
        while (requestData.path.indexOf("%22") != -1) requestData.path = requestData.path.replace("%22", "\"");
        while (requestData.path.indexOf("%23") != -1) requestData.path = requestData.path.replace("%23", "#");
        while (requestData.path.indexOf("%24") != -1) requestData.path = requestData.path.replace("%24", "$");
        while (requestData.path.indexOf("%25") != -1) requestData.path = requestData.path.replace("%25", "%");
        while (requestData.path.indexOf("%28") != -1) requestData.path = requestData.path.replace("%28", "(");
        while (requestData.path.indexOf("%29") != -1) requestData.path = requestData.path.replace("%29", ")");
        while (requestData.path.indexOf("%3B") != -1) requestData.path = requestData.path.replace("%3F", ";");
        while (requestData.path.indexOf("%3F") != -1) requestData.path = requestData.path.replace("%3F", "?");
        while (requestData.path.indexOf("%40") != -1) requestData.path = requestData.path.replace("%40", "@");
        while (requestData.path.indexOf("%5e") != -1) requestData.path = requestData.path.replace("%5e", "^");
        //#endregion
        // Everything below is to format the requestData.query
        requestData.parsedQuery = {};
        if (requestData.query) {
            while (requestData.query.indexOf("+") != -1) requestData.query = requestData.query.replace("+", " ");
            while (requestData.query.indexOf("%20") != -1) requestData.query = requestData.query.replace("%20", " ");
            while (requestData.query.indexOf("%21") != -1) requestData.query = requestData.query.replace("%21", "!");
            while (requestData.query.indexOf("%22") != -1) requestData.query = requestData.query.replace("%22", "\"");
            while (requestData.query.indexOf("%23") != -1) requestData.query = requestData.query.replace("%23", "#");
            while (requestData.query.indexOf("%24") != -1) requestData.query = requestData.query.replace("%24", "$");
            while (requestData.query.indexOf("%28") != -1) requestData.query = requestData.query.replace("%28", "(");
            while (requestData.query.indexOf("%29") != -1) requestData.query = requestData.query.replace("%29", ")");
            while (requestData.query.indexOf("%3B") != -1) requestData.query = requestData.query.replace("%3B", ";");
            while (requestData.query.indexOf("%3F") != -1) requestData.query = requestData.query.replace("%3F", "?");
            while (requestData.query.indexOf("%40") != -1) requestData.query = requestData.query.replace("%40", "@");
            while (requestData.query.indexOf("%5e") != -1) requestData.query = requestData.query.replace("%5e", "^");
            while (requestData.query.indexOf("%27") != -1) requestData.query = requestData.query.replace("%27", "'");
            while (requestData.query.indexOf("%0A") != -1) requestData.query = requestData.query.replace("%0A", "\n");
            while (requestData.query.indexOf("%3A") != -1) requestData.query = requestData.query.replace("%3A", ":");
            while (requestData.query.indexOf("%5C") != -1) requestData.query = requestData.query.replace("%5C", "\\");
            while (requestData.query.indexOf("%2F") != -1) requestData.query = requestData.query.replace("%2F", "/")

            while (requestData.query.indexOf("%25") != -1) requestData.query = requestData.query.replace("%25", "%");
            //for (let i = 0; i < QueryCodes.length; i++) requestData.replace(new RegExp(Query, 'g'))
            //Object.keys(QueryCodes).forEach(code => requestData.query.replace(new RegExp(code, 'g'), QueryCodes[code]));
            requestData.parsedQuery = ParseQuery(requestData.query);
        }

        // Precondition 1: Is the currernt working directory valid?
        if (requestData.fullPath.indexOf(SiteRoot) != 0) {
            // Forward to generic responses with code 403 (Forbidden)
            // Reason? Access outside the wwwroot directory is prohibited
            GenericResponses.SendErrorPage(Data, 403);
        }
        // Precondition 2: Is there a query?
        else if (requestData.query) {
            // Send it to the query handler
            QueryHandler.Process(requestData);
        }
        else SendStaticFile(requestData);
    }).listen(port, "0.0.0.0", undefined, undefined, () => { Debug.Log("HTTP Listener Online"); });
}

var HttpCallbacks = [];

async function SendStaticFile(requestData, skipCallback = false) {
    // Check callbacks first
    if (!skipCallback) {
        var i = 0;
        while (i < HttpCallbacks.length) {
            if (requestData.path.toLowerCase().indexOf(HttpCallbacks[i].Name) == 0) {
                HttpCallbacks[i].Callback(requestData);
                return;
            }
            i++;
        }
    }

    // Condition 1: Does the file exist
    if (await FileExists(requestData.fullPath)) {
        // Get the file and return it to the client
        SystemIO.readFile(requestData.fullPath, async function(error, data) {
            if (error) {
                // Error even though the file exists... return err 500 (Internal Server Error)
                GenericResponses.SendErrorPage(requestData, 500);
                Debug.LogNetwork("[HTTP] [" + requestData.Socket.connection.remoteAddress +  "] [500] : " + requestData.path + (requestData.query ? "?" + requestData.query : ""));
            }
            else {
                // File was found then return it
                Debug.LogNetwork("[HTTP] [" + requestData.Socket.connection.remoteAddress +  "] [200] : " + requestData.path + (requestData.query ? "?" + requestData.query : ""));
                requestData.Socket.writeHead(200, { 'Content-Type': await MimeTypes.GetHeader(requestData.fileExt) });
                FinishSend(requestData, data);
            }
        });
    }
    // Condition 2: Does the file exist (+ '/index.html')
    else if (await FileExists(requestData.fullPath + "/index.html")) {
        requestData.fileExt = ".html";
        SystemIO.readFile(requestData.fullPath + "/index.html", function(error, data) {
            if (error) {
                // Error even though the file exists... return err 500 (Internal Server Error)
                GenericResponses.SendErrorPage(requestData, 500);
                Debug.LogError("[HTTP] [" + requestData.Socket.connection.remoteAddress +  "] [500] : " + requestData.path + (requestData.query ? "?" + requestData.query : ""));
            }
            else {
                // File was found then return it
                Debug.LogNetwork("[HTTP] [" + requestData.Socket.connection.remoteAddress +  "] [200] : " + requestData.path + (requestData.query ? "?" + requestData.query : ""));
                requestData.Socket.writeHead(200, { 'Content-Type': MimeTypes.GetHeader(".html") });
                FinishSend(requestData, data);
            }
        });
    }
    // Condition 3: Does a default image exist (made a .webp because it is predicted to become the standard of the web)
    else if (await FileExists(requestData.fullPath.substring(0, requestData.fullPath.lastIndexOf('/')) + "/default.webp")) {
        requestData.fileExt = ".webp";
        SystemIO.readFile(requestData.fullPath.substring(0, requestData.fullPath.lastIndexOf('/')) + "/default.webp", function(error, data) {
            if (error) {
                // Error even though the file exists... return err 500 (Internal Server Error)
                GenericResponses.SendErrorPage(requestData, 500);
                Debug.LogError("[HTTP] [" + requestData.Socket.connection.remoteAddress +  "] [500] : " + requestData.path + (requestData.query ? "?" + requestData.query : ""));
            }
            else {
                // File was found then return it
                Debug.LogNetwork("[HTTP] [" + requestData.Socket.connection.remoteAddress +  "] [200] : " + requestData.path + (requestData.query ? "?" + requestData.query : "") + " {as default.webp}");
                requestData.Socket.writeHead(200, { 'Content-Type': MimeTypes.GetHeader(".webp") });
                FinishSend(requestData, data);
            }
        });
    }
    // Condition 3: Does a default image exist (made a .webp because it is predicted to become the standard of the web)
    else if (await FileExists(requestData.fullPath.substring(0, requestData.fullPath.lastIndexOf('\\')) + "\\default.webp")) {
        requestData.fileExt = ".webp";
        SystemIO.readFile(requestData.fullPath.substring(0, requestData.fullPath.lastIndexOf('\\')) + "\\default.webp", function(error, data) {
            if (error) {
                // Error even though the file exists... return err 500 (Internal Server Error)
                GenericResponses.SendErrorPage(requestData, 500);
                Debug.LogError("[HTTP] [" + requestData.Socket.connection.remoteAddress +  "] [500] : " + requestData.path + (requestData.query ? "?" + requestData.query : ""));
            }
            else {
                // File was found then return it
                Debug.LogNetwork("[HTTP] [" + requestData.Socket.connection.remoteAddress +  "] [200] : " + requestData.path + (requestData.query ? "?" + requestData.query : "") + " {as default.webp}");
                requestData.Socket.writeHead(200, { 'Content-Type': MimeTypes.GetHeader(".webp") });
                FinishSend(requestData, data);
            }
        });
    }
    // Still precondition 3
    else if (await FileExists(requestData.fullPath + "/default.webp")) {
        requestData.fileExt = ".webp";
        SystemIO.readFile(requestData.fullPath + "/default.webp", function(error, data) {
            if (error) {
                // Error even though the file exists... return err 500 (Internal Server Error)
                GenericResponses.SendErrorPage(requestData, 500);
                Debug.LogError("[HTTP] [" + requestData.Socket.connection.remoteAddress +  "] [500] : " + requestData.path + (requestData.query ? "?" + requestData.query : ""));
            }
            else {
                // File was found then return it
                Debug.LogNetwork("[HTTP] [" + requestData.Socket.connection.remoteAddress +  "] [200] : " + requestData.path + (requestData.query ? "?" + requestData.query : ""));
                requestData.Socket.writeHead(200, { 'Content-Type': MimeTypes.GetHeader(".webp") });
                FinishSend(requestData, data);
            }
        });
    }
    // Files do not exist: Return error 404 (Not Found)
    else {
        Debug.LogWarn("[HTTP] [" + requestData.Socket.connection.remoteAddress +  "] [404] : " + requestData.path + (requestData.query ? "?" + requestData.query : ""));
        GenericResponses.SendErrorPage(requestData, 404);
    }
}

module.exports.AddHttpCallback = (rule, callback = (requestData) => { SendStaticFile(requestData, true); }) => {
    HttpCallbacks.push({
        Name: rule.toLowerCase(),
        Callback: callback
    });
}

async function FinishSend(requestData, data) {
    // Format requests and etc
    if (requestData.fileExt == undefined) {
      requestData.Socket.writeHead(200, { 'Content-Type': 'text/html' });
      requestData.fileExt = ".html";
    }
    if (requestData.fileExt == ".html") data = await HttpTemplates.Process(data);
    requestData.Socket.end(data);
}

function FileExists(path = "") {
    return new Promise(async resolve => {
        await SystemIO.stat(path, (statError, stat) => {
            if (statError) resolve(false);
            try { resolve(stat.isFile()); }
            catch { resolve(false); }
        });
    });
}

function ParseQuery(query = "") {
    var _finalData = { };
    var _splitDeclarations = query.split("&");
    for (var i = 0; i < _splitDeclarations.length; i++) {
      var _field = _splitDeclarations[i].split("=");
      if (_field.length == 1) _finalData[_field[0]] = true;
      /*else if (!isNaN(parseFloat(_field[1]))) {
        _finalData[_field[0]] = parseFloat(_field[1]);
      }
      else if (!isNaN(parseInt(_field[1]))) {
        _finalData[_field[0]] = parseInt(_field[1]);
      }
      else if (_field[1].toLowerCase() == 'true' || _field[1].toLowerCase() == 'false'){
        _finalData[_field[0]] = (_field[1].toLowerCase() == "true");
      }*/
      else {
        _finalData[_field[0]] = _field[1];
      }
    }
    return _finalData;
}

module.exports.Start = Start;
module.exports.FinishSend = FinishSend;
module.exports.SendStaticFile = SendStaticFile;
