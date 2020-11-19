// Dependancies
const path = require("path"),
      SystemIO = require("fs"),
      glob = require("glob"),
      getDirectories = (src, callback) => { glob(src + '/**/*.*', callback); },

      // Import { parse as parseHTML } from "node-html-parser";
      HtmlParser = require("node-html-parser"),
      parseHTML = HtmlParser.parse,

      ServerHandle = require("./Server"),
      Debug = require("./../../Debug"),

      // Program
      DirectoryName = "models";
      DirectoryPath = path.join(__dirname, "../../..", DirectoryName);

var Models = {};

async function Init() {
    // This is going to load all the models... but lemme see if I can parse HTML
    // This will take place in Process
    // Actual init
    var _rootDir = path.dirname(require.main.filename);
    getDirectories(DirectoryName, async (err, res) => {
      if (err) { Debug.LogError("The Templates Module failed to load! IO Error (Package: HttpServer/Templates.js)"); return; }
      Debug.LogDebug("[Templates] Found glob length of " + res.length);
      var i = 0,
          continueLoop;
      while (i < res.length) {
        continueLoop = false;
        var _modelName = res[i].substring(DirectoryName.length + 1);
        // This might actually work with spaces : if (_modelName.indexOf(" ") != -1) Debug.LogError("[Templates] Error: Name violation - Model name cannot contain spaces");
        SystemIO.readFile(_rootDir + "/" + res[i], (error, data) => {
          if (err) { Debug.LogError("[Templates] Failed to load model '" + _modelName + "'! IO Error"); return; }
          Models[_modelName.toLowerCase()] = data.toString();
          Debug.Log("[Templates] Loaded '" + res[i].substring(DirectoryName.length + 1) + "'");
          //console.log(Models);
          continueLoop = true;
        });
        while (!continueLoop) await sleep(10);
        i++;
      }
    });
}

function Process(file) {
    return new Promise(resolve => {
        var ParsedHTML = parseHTML(
            file,
            {
                lowerCaseTagName: true,     // convert tag name to lower case (hurt performance heavily)
                script: true,               // retrieve content in <script> (hurt performance slightly)
                style: true,                // retrieve content in <style> (hurt performance slightly)
                pre: true,                  // retrieve content in <pre> (hurt performance slightly)
                comment: false              // retrieve comments (hurt performance slightly)
            }
        ).toString();
        while (ParsedHTML.indexOf("<model ") != -1) {
            const _startingIndex = ParsedHTML.indexOf("<model ") + 7; // (plus 7 to be able to get the name)
            const _endingIndex = ParsedHTML.indexOf("</model>");
            const _attributes = ParsedHTML.substring(_startingIndex, _endingIndex);
            const _nameAttribStartingIndex = _attributes.indexOf("src=\"") + 5;
            const _nameAttribEndingIndex = _attributes.indexOf("\"", _nameAttribStartingIndex);
            var _nameValues = _attributes.substring(_nameAttribStartingIndex, _nameAttribEndingIndex);//.split(' ');
            if (_nameValues[0] == "/") _nameValues = _nameValues.substring(1);
            var _finalHTML = "";
            //var i = 0;
            //while (i < _nameValues.length) {
                if (Models[_nameValues.toLowerCase()] != undefined)
                    _finalHTML += Models[_nameValues.toLowerCase()];
                //i++;
            //}
            ParsedHTML = ParsedHTML.replace(ParsedHTML.substring(_startingIndex - 7, _endingIndex + 8), _finalHTML);
        }
        resolve(ParsedHTML);
    });
}

function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

module.exports.Init = Init;
module.exports.Process = Process;
module.exports.Get = (modelName, parameters) => {
  var _value = Models[modelName.toLowerCase()];
  if (_value == undefined) return "";
  _value = _value.toString();
  if (parameters == undefined) return _value;
  var _keys = Object.keys(parameters),
      i = 0;
  while (i < _keys.length) {
    while (_value.indexOf("{?:" + _keys[i] + "}") != -1) _value = _value.replace("{?:" + _keys[i] + "}", parameters[_keys[i]]);
    i++;
  }
  return _value;
}
