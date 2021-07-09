const {
  execSync
} = require("child_process");

/*
  convertPath
    Convert Windows path to DOS compatible path
 */
function convertPath(filePath) {
  var command = `cmd /c for %A in ("${filePath}") do @echo %~sA`;
  var pathBuffer = execSync(command);
  var encoding = 'utf8';
  var path = Buffer.from(pathBuffer, encoding).toString().replace(/\n/g, '');

  return path;
}

module.exports = {
  convert: convertPath,
  convertPath: convertPath,
  convertWinPath: convertPath
};
