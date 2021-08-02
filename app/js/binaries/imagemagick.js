const os = require('os'),
  path = require('path');

const {
  exec
} = require('child_process');

// Startup routine
startupCheckOs();
var imagemagickVars = getImagemagickVars();

/*
  convertFile
    Promisify convert file
 */
function convertFile(file, options) {
  return new Promise((resolve, reject) => {
    var executable = compileExecutablePath(),
      arguments = compileArguments(file, options),
      {
        executionOptions
      } = imagemagickVars;

    executable = `${executable} ${arguments.join(' ')}`;

    currentExec = exec(executable, executionOptions, (error, stdout, stderr) => {
      if (error) reject(error);
      resolve(stdout);
    });
  });
}

/*
  compileExecutablePath
    Compiles executable path
 */
function compileExecutablePath() {
  var executableName = 'convert';
  executable = path.join(imagemagickVars.path, executableName);

  return executable;
}

/*
  compileArguments
    Compile arguments
 */
function compileArguments(file, options) {
  var options = { ...options,
      outputDirectory: options.outputDirectory ?
        options.outputDirectory : path.dirname(file),
      outputFile: options.outputFile ?
        options.outputFile : path.basename(file, path.extname(file))
    },
    arguments = [];

  if (options.action.includes('grayscale')) { // Clone metadata from file to file
    var sourceFile = file,
      targetFile = `${path.join(options.outputDirectory, options.outputFile)}_gray${path.extname(file)}`;;

    arguments.push(`"${sourceFile.toString()}"`);
    arguments.push(`-colorspace`);
    arguments.push(`Gray`);
    arguments.push(`"${targetFile.toString()}"`);
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

  if (currentOs !== supportedOs) processQuit();
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
function getImagemagickVars() {
  return {
    path: getImagemagickVarsPath(),
    defaultOptions: getImagemagickVarsDefaultOptions(),
    executionOptions: getImagemagickVarsExecutionOptions()
  };
}

/*
  getExiftoolVarsPath
    Get exiftool vars path
 */
function getImagemagickVarsPath() {
  return path.join(
    __dirname,
    '..',
    '..',
    'binaries',
    'imagemagick'
  );
}

function getImagemagickVarsExecutionOptions() {
  return {
    encoding: 'utf8',
    maxBuffer: 5120000,
    shell: false
  };
}


/*
  getExiftoolVarsDefaultOptions
    Gets exiftool default options
 */
function getImagemagickVarsDefaultOptions() {
  return {};
}

module.exports = {
  path: imagemagickVars.path,
  convert: convertFile,
  convertFile: convertFile
};
