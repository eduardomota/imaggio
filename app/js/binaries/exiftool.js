const os = require('os'),
  path = require('path');

const {
  exec
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
    var {
      executionOptions
    } = exiftoolVars;

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
    var sourceFile = options.inputFile,
      targetFile = file;
    arguments.push(`-TagsFromFile`);
    arguments.push(`"${sourceFile.toString()}"`);
    arguments.push(`"-all:all>all:all"`);
    arguments.push(`"${targetFile.toString()}"`);
  }

  if (options.action.includes('remove')) { // Remove all metadata from file
    arguments.push(`-all=`);
    arguments.push(`"${file}"`);
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
    defaultOptions: getExiftoolVarsDefaultOptions(),
    executionOptions: getExiftoolVarsExecutionOptions()
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

function getExiftoolVarsExecutionOptions() {
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
function getExiftoolVarsDefaultOptions() {
  return {};
}

module.exports = {
  path: exiftoolVars.path,
  convert: convertFile,
  convertFile: convertFile
};
