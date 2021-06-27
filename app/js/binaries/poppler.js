const os = require('os'),
  path = require('path');

const {
  execFile
} = require('child_process');

// Startup routine
startupCheckOs();
var popplerVars = getPopplerVars();

/*
  convertPdfFile
    Promisify convert pdf file
 */
function convertPdfFile(file, options) {
  return new Promise((resolve, reject) => {
    var executable = compileExecutablePath(options),
      arguments = compileArguments(file, options);
    var {
      executionOptions
    } = popplerVars;

    console.log(arguments);

    currentExec = execFile(executable, arguments, executionOptions, (error, stdout, stderr) => {
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
  var executable = null;

  if (types.cairo.includes(options.format)) executable = 'pdftocairo';
  if (types.text.includes(options.format)) executable = 'pdftotext';
  if (types.html.includes(options.format)) executable = 'pdftothtml';
  if (types.extract.includes(options.format)) executable = 'pdfimages';
  if (types.separate.includes(options.format)) executable = 'pdfseparate';

  return path.join(popplerVars.path, executable);
}

/*
  compileArguments
    Compile file and options into a command line usable arguments
 */
/*
options = {
  format: '', // -png/-jpeg/..., Specify format
  firstPage: '', // -f NUMBER, Specify first page to convert
  lastPage: '', // -l NUMBER, Specify last page to convert
  singlePage: '', // -f NUMBER -l NUMBER, Specify single page to convert
  oddPages: false, // -o, Generate odd pages only
  evenPages: false, // -e, Generate even pages only
  scaleTo: 1024, // -scale-to NUMBER, Specify scale to downsize to
  grayscale: false, // -gray, Specify whether is grayscale or not
  outputDirectory: path.dirname(file),
  outputFile: path.basename(file, path.extname(file))
  nativeimages: false
}
*/
function compileArguments(file, options) {
  var options = { ...options,
    outputDirectory: options.outputDirectory ? options.outputDirectory : path.dirname(file),
    outputFile: options.outputFile ? options.outputFile : path.basename(file, path.extname(file))
  };
  var arguments = [],
    outputFile = path.join(options.outputDirectory, options.outputFile);
  var {
    excludedFormats,
    types
  } = popplerVars;

  if (types.cairo.includes(options.format)) arguments.push(`-${options.format}`); // Format
  if (options.firstPage) {
    arguments.push(`-f`);
    arguments.push(`${parseInt(options.firstPage)}`);
  } // Start page
  if (options.lastPage) {
    arguments.push(`-l`);
    arguments.push(`${parseInt(options.lastPage)}`);
  } // Last page
  if (options.singlePage) {
    arguments.push(`-f`);
    arguments.push(`${parseInt(options.singlePage)}`);
    arguments.push(`-l`);
    arguments.push(`${parseInt(options.singlePage)}`);
  } // Single page selection
  if (options.oddPages) argmuments.push(`-o`);
  if (options.evenPages) arguments.push(`-e`);
  if (options.scaleTo) {
    arguments.push(`-scale-to`);
    arguments.push(`${parseInt(options.scaleTo)}`);
  } // Scale to
  if (options.grayscale) arguments.push(`-gray`);
  if (options.nativeimages) arguments.push(`-all`);
  if (options.format === 'pdf') outputFile = outputFile + '_min.pdf';
  if (options.format === 'svg') outputFile = outputFile + '.svg';
  if (options.format === 'txt') outputFile = outputFile + '.txt';

  arguments.push(`${file}`);
  if (options.format === 'separate') arguments.push(`${path.join(options.outputDirectory, options.outputFile)}_%d.pdf`);
  if (options.format === 'extract') {
    arguments.push(`-png`);
    arguments.push(`${path.join(options.outputDirectory, options.outputFile)}`);
  }
  if (!(excludedFormats.includes(options.format))) arguments.push(`${outputFile}`);

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
  getPopplerVars
    Get default poppler vars
 */
function getPopplerVars() {
  return {
    path: getPopplerVarsPath(),
    executionOptions: getPopplerVarsExecutionOptions(),
    defaultOptions: getPopplerVarsDefaultOptions(),
    types: getPopplerVarsDefaultTypes(),
    excludedFormats: getPopplerVarsExcludedFormats()
  };
}

/*
  getPopplerVarsPath
    Get default poppler directory
 */
function getPopplerVarsPath() {
  return path.join(
    __dirname,
    '..',
    '..',
    'binaries',
    'poppler-21.03.0',
    'Library',
    'bin'
  );
}

/*
  getPopplerVarsExecutionOptions
    Get default poppler execution options
 */
function getPopplerVarsExecutionOptions() {
  return {
    encoding: 'utf8',
    maxBuffer: 5120000,
    shell: false
  };
}

/*
  getPopplerVarsDefaultOptions
    Get default poppler options
 */
function getPopplerVarsDefaultOptions() {
  return {
    format: 'jpeg',
    scale: 1024,
    out_dir: null,
    out_prefix: null,
    page: null
  };
}

/*
  getPopplerDefaultTypes
    Get default poppler types
 */
function getPopplerVarsDefaultTypes() {
  return types = {
    cairo: ['png', 'jpeg', 'tiff', 'svg', 'pdf', 'ps', 'eps'],
    text: ['txt', 'text'],
    html: ['html'],
    extract: ['extract'],
    separate: ['separate']
  };
}

/*
  getPopplerVarsExcludedFormats
    Gets default poppler excluded formats to exclude -format from command line
 */
function getPopplerVarsExcludedFormats() {
  return ['extract', 'separate', 'html'];
}

module.exports = {
  path: popplerVars.path,
  executionOptions: popplerVars.executionOptions,
  convert: convertPdfFile,
  convertPdf: convertPdfFile,
  convertPdfFile: convertPdfFile
};
