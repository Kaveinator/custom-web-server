const ServerHandle = require("./Server"),
      GenericResponses = require("./GenericResponses"),
      Debug = require("./../../Debug"),
      path = require('path'),
      SystemIO = require('fs'),
      Models = require("./Templates"),
      BodyParser = require('body-parser');
const { exit } = require("process");

const FormFilePath = path.join(__dirname, "..", "..", "..", "FormResponses");
var FormResponses = { };


function Init() {
    // Load any response data in here
    SystemIO.readdir(FormFilePath, async function (error, files) {
      if (error)
        return Debug.LogError('[QueryHandler] [ResponseData] Unable to probe database: ' + error);
      //listing all files using forEach
      files.forEach(function (file) {
          // Do whatever you want to do with the file
          //console.log(file);
          if (file.substring(file.lastIndexOf('.') + 1, file.length).toUpperCase() == "JSON") {
              var _form = file.substring(0, file.lastIndexOf('.'));
              Debug.Log("[QueryHandler] [ResponseData] Found form \"" + _form + "\"");
              // Users[Users.length] = file.substring(0, file.lastIndexOf('.'));
              SystemIO.readFile(FormFilePath + "/" + file, function(error, data) {
                  if (error) {
                      Debug.LogError("[QueryHandler] [ResponseData] Unable to load form \"" + _form + "\"");
                  }
                  else {
                    FormResponses[_form] = JSON.parse(data);
                    Debug.Log("[QueryHandler] [ResponseData] Loaded \"" + _form + "\" into server");
                  }
              });
          }
      });
  });
}

function sleep(ms = 100) {new Promise(resolve => { setTimeout(resolve, ms); })}

const killCode = "TheMostSecurePasswordThatNoOneCanCrack";
async function Process(requestData) {
    var _parsedQuery = requestData.parsedQuery;

    if (requestData.path.toLowerCase().indexOf("action") == 1) {
      if (_parsedQuery.stop) {
        if (_parsedQuery.killCode == killCode) {
         Debug.Log("Kill Code entered! Stopping server!");
         GenericResponses.SendErrorPage(requestData, 200, "Server Stop Initiated");
         await sleep(15000);
         exit(0);
       }
       else {
         GenericResponses.SendErrorPage(requestData, 403, "What do you think your doing?");
       }
      }
      else if (_parsedQuery.restart) {
        if (_parsedQuery.killCode == killCode) {
         Debug.Log("Kill Code entered! Restarting server!");
         GenericResponses.SendErrorPage(requestData, 200, "Server Restart Initiated");
         await sleep(15000);
         exit(-1);
       }
       else {
         GenericResponses.SendErrorPage(requestData, 403, "What do you think your doing?");
       }
     }
     else ServerHandle.SendStaticFile(requestData);
    }
    else {// Default: No action can be done about query, send it to the static responses
      ServerHandle.SendStaticFile(requestData);
      return;
    }

    //GenericResponses.SendErrorPage(requestData, 404);
}

function SaveForm(formName) {
  if (FormResponses[formName]) { // Does such form exist
    SystemIO.writeFileSync(FormFilePath + "/" + formName + ".json", JSON.stringify(FormResponses[formName]));
    Debug.Log('[QueryHandler] [ResponseData] Saved Form Data for "' + formName + '"');
  }
  else Debug.LogError('[QueryHandler] [ResponseData] Recived Save Form Data request but did not find form "' + formName + '"');
}

module.exports.Init = Init;
module.exports.Process = Process;
