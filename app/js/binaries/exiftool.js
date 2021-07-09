const os = require('os'),
  path = require('path');

const {
  execFile
} = require('child_process');

// Startup routine
startupCheckOs();
var exiftoolVars = getExiftoolVars();

/*
  convertFile
    Promisify convert file
 */
function convertFile(file, options) {
  return new Promise((resolve, reject) => {
    var executable = compileExecutablePath(options),
      arguments = compileArguments(file, options);

    currentExec = execFile(executable, arguments, (error, stdout, stderr) => {
      if (error) reject(error);
      resolve(stdout);
    });
  });
}

/*
  compileExecutablePath
    Compiles executable path
 */
function compileExecutablePath(options) {
  var executableName = 'exiftool';
  executable = path.join(exiftoolVars.path, executableName);

  return executable;
}

/*
  compileArguments
    Compile arguments
 */
function compileArguments(file, options) {
  var options = { ...options,
    outputDirectory: options.outputDirectory ? options.outputDirectory : path.dirname(file),
    outputFile: options.outputFile ? options.outputFile : path.basename(file, path.extname(file))
  };
  var arguments = [],
    outputFile = path.join(options.outputDirectory, options.outputFile);

  if (options.action.includes('clone')) { // Clone metadata from file to file
    arguments.push(`-TagsFromFile`);
    arguments.push(`"${sourcefile}"`);
    arguments.push(`"-all:all>all:all"`);
    arguments.push(`"${targetfile}"`);
  }

  if (options.action.includes('remove')) { // Remove all metadata from file
    arguments.push(`-all=`);
    arguments.push(`${file}`);
  }

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
  getExiftoolVars
    Get exiftool default vars
 */
function getExiftoolVars() {
  return {
    path: getExiftoolVarsPath(),
    defaultOptions: getExiftoolVarsDefaultOptions()
  };
}

/*
  getExiftoolVarsPath
    Get exiftool vars path
 */
function getExiftoolVarsPath() {
  return path.join(
    __dirname,
    '..',
    '..',
    'binaries',
    'exiftool-12.28'
  );
}

/*
  getExiftoolVarsDefaultOptions
    Gets exiftool default options
 */
function getExiftoolVarsDefaultOptions() {
  return {};
}

module.exports = {
  path: exiftoolVars.path,
  convert: convertFile,
  convertFile: convertFile
};
