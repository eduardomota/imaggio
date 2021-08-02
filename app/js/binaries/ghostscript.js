const os = require('os'),
  path = require('path');

const {
  exec
} = require('child_process');

// Startup routine
startupCheckOs();
var ghostscriptVars = getGhostscriptVars();

/*
  convertPdfFile
    Promisify convert pdf file
 */
function convertPdfFile(file, options) {
  return new Promise((resolve, reject) => {
    var executable = compileExecutablePath(options),
      arguments = compileArguments(file, options);

    executable = `${executable} ${arguments.join(' ')}`;

    currentExec = exec(executable, arguments, (error, stdout, stderr) => {
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
  var executableName = 'gswin32c';
  var executable = path.join(ghostscriptVars.path, executableName);

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

  if (options.format.includes('pdfa')) { // PDF/A CONVERSION
    arguments.push(`-dPDFA`); // PDFA format
    arguments.push(`-dBATCH`);
    arguments.push(`-dNOPAUSE`);
    arguments.push(`-dUseCIEColor`);
    arguments.push(`-sProcessColorModel=DeviceRGB`);
    if (options.pdfSettings) arguments.push(`-dPDFSETTINGS=/${options.pdfSettings}`); // PDF compression settings
    arguments.push(`-sDEVICE=pdfwrite`);
    arguments.push(`-sPDFACompatibilityPolicy=1`);
    arguments.push(`-sOutputFile="${path.join(options.outputDirectory, options.outputFile)}_pdfa.pdf"`);
    arguments.push(`"${file}"`);
  } else { // Other, pdf compression
    arguments.push(`-sDEVICE=pdfwrite`);
    arguments.push(`-dCompatibilityLevel=1.4`);
    if (options.pdfSettings) arguments.push(`-dPDFSETTINGS=/${options.pdfSettings}`); // PDF compresssion settings
    arguments.push(`-dNOPAUSE`);
    arguments.push(`-dBATCH`);
    arguments.push(`-sOutputFile="${path.join(options.outputDirectory, options.outputFile)}_min.pdf"`);
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
  getGhostscriptVars
    Get ghostscript default vars
 */
function getGhostscriptVars() {
  return {
    path: getGhostscriptVarsPath(),
    defaultOptions: getGhostscriptVarsDefaultOptions()
  };
}

/*
  getGhostscriptVarsPath
    Get Ghostscript vars path
 */
function getGhostscriptVarsPath() {
  return path.join(
    __dirname,
    '..',
    '..',
    'binaries',
    'gs9540w32',
    'bin'
  );
}

/*
  getGhostscriptVarsDefaultOptions
    Gets Ghostscript default options
 */
function getGhostscriptVarsDefaultOptions() {
  return {};
}

module.exports = {
  path: ghostscriptVars.path,
  convert: convertPdfFile,
  convertPdf: convertPdfFile,
  convertPdfFile: convertPdfFile
};
