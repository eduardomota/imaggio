const os = require('os'),
  path = require('path');

const {
  execFile
} = require('child_process');

// Startup routine
startupCheckOs();
var officetopdfVars = getOfficetopdfVars();

/*
  convertPdfFile
    Promisify convert pdf file
 */
function convertPdfFile(file, options) {
  return new Promise((resolve, reject) => {
    var executable = compileExecutablePath(options),
      arguments = compileArguments(file, options);

    console.log(arguments);

    currentExec = execFile(executable, arguments, (error, stdout, stderr) => {
      if (error) reject(error);
      resolve(stdout);
    })
  });
}

/*
  compileExecutablePath
    Compile executable path
 */
function compileExecutablePath(options) {
  var executable = 'officetopdf';
  return path.join(officetopdfVars.path, executable);
}

/*
  compileArguments
    Compile file and options into a command line usable arguments
 */
/*
*/
function compileArguments(file, options) {
  var options = { ...options,
    outputDirectory: options.outputDirectory ? options.outputDirectory : path.dirname(file),
    outputFile: options.outputFile ? options.outputFile : path.basename(file, path.extname(file))
  };
  var arguments = [],
    outputFile = path.join(options.outputDirectory, options.outputFile);

  // Add bookmarks when possible
  arguments.push(`/bookmarks`);

  // Make it print ready
  arguments.push(`/print`);

  // Try to hide Office application
  arguments.push(`/bookmarks`);

  arguments.push(`${file}`);

  arguments.push(`${outputFile}.pdf`);

  return arguments;
}

/*
  startupCheckOs
    Startup check current operating system
 */
function startupCheckOs() {
  var currentOs = os.platform(),
    supportedOs = 'win32';

  if (currentOs !== 'win32') processQuit();
}

/*
  processQuit
    Quit process
 */
function processQuit() {
  process.exit();
}

/*
  getOfficetopdfVars
    Get default Office To PDF vars
 */
function getOfficetopdfVars() {
  return {
    path: getOfficetopdfVarsPath()
  };
}

/*
  getOfficetopdfVarsPath
    Get default officetopdf directory
 */
function getOfficetopdfVarsPath() {
  return path.join(
    __dirname,
    '..',
    '..',
    'binaries',
    'officetopdf'
  );
}

module.exports = {
  path: officetopdfVars.path,
  convert: convertPdfFile,
  convertPdf: convertPdfFile,
  convertPdfFile: convertPdfFile
};
