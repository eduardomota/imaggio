const os = require('os'),
  path = require('path');

const {
  exec
} = require('child_process');

// dosPath conversion
const dosPath = require('./dospath');

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

    console.log(4);

    executable = `${executable} ${arguments.join(' ')}`;

    console.log("TEST", executable);

    currentExec = exec(executable, executionOptions, (error, stdout, stderr) => {
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
  var {
    cairo,
    text,
    html,
    ppm,
    extract,
    separate,
    detach
  } = types, {
    format
  } = options,
  executable = null;

  console.log(options.format);
  console.log(types);

  if (cairo.includes(format)) {
    executable = 'pdftocairo';
  } else if (text.includes(format)) {
    executable = 'pdftotext';
  } else if (html.includes(format)) {
    executable = 'pdftohtml';
  } else if (ppm.includes(format)) {
    executable = 'pdftoppm';
  } else if (extract.includes(format)) {
    executable = 'pdfimages';
  } else if (separate.includes(format)) {
    executable = 'pdfseparate';
  } else if (detach.includes(format)) {
    executable = 'pdfdetach';
  } else {
    executable = 'pdftocairo';
  }

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
  var outputDir = path.dirname(file);
  var options = { ...options,
      outputDirectory: options.outputDirectory ? options.outputDirectory : outputDir,
      outputFile: options.outputFile ? options.outputFile : path.basename(file, path.extname(file))
    },
    {
      excludedFormats,
      types
    } = popplerVars,
    arguments = [],
    outputFile = path.join(options.outputDirectory, options.outputFile);

  // Cairo format
  if (types.cairo.includes(options.format))
    arguments.push(`-${options.format}`);
  // First page
  if (options.firstPage) {
    arguments.push(`-f`);
    arguments.push(`${parseInt(options.firstPage)}`);
  }
  // Last page
  if (options.lastPage) {
    arguments.push(`-l`);
    arguments.push(`${parseInt(options.lastPage)}`);
  }
  // Single page
  if (options.singlePage) {
    arguments.push(`-f`);
    arguments.push(`${parseInt(options.singlePage)}`);
    arguments.push(`-l`);
    arguments.push(`${parseInt(options.singlePage)}`);
  }
  // Odd pages only
  if (options.oddPages) argmuments.push(`-o`);
  // Even pages only
  if (options.evenPages) arguments.push(`-e`);

  // Scale to option if is not excluded
  if (options.scaleTo && !(excludedFormats.includes(options.format))) {
    arguments.push(`-scale-to`);
    arguments.push(`${parseInt(options.scaleTo)}`);
  }

  // Grayscale option
  if (options.grayscale) arguments.push(`-gray`);
  if (options.nativeimages) arguments.push(`-all`);

  // Pdf format
  if (options.format === 'pdf') outputFile = `${outputFile}_min.pdf`;
  // SVG vector format
  if (options.format === 'svg') outputFile = `${outputFile}.svg`;
  // Text format
  if (options.format === 'txt') outputFile = `${outputFile}.txt`;
  // Detach operation
  if (options.format === 'detach') arguments.push(`-saveall`);

  // Input file
  arguments.push(`"${file}"`);

  // If not excluded format insert output format
  if (!(excludedFormats.includes(options.format))) arguments.push(`"${outputFile}"`);

  // Separate action, output file
  if (options.format === 'separate') arguments.push(`"${path.join(options.outputDirectory, options.outputFile)}_%d.pdf"`);
  // Extract action, png option + output file
  if (options.format === 'extract') {
    arguments.push(`-png`);
    arguments.push(`"${path.join(options.outputDirectory, options.outputFile)}"`);
  }

  // PPM output file
  if (types.ppm.includes(options.format)) arguments.push(`"${outputFile}"`);
  // PPM format
  if (types.ppm.includes(options.format) && options.format != 'ppm') arguments.push(`-${options.format}`);
  // PPM scale to
  if (options.scaleTo && excludedFormats.includes(options.format)) {
    arguments.push(`-scale-to`);
    arguments.push(`${parseInt(options.scaleTo)}`);
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
    maxBuffer: 51200000,
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
    cairo: ['png', 'jpeg', 'svg', 'pdf', 'ps', 'eps'],
    ppm: ['ppm', 'tiff'],
    text: ['txt', 'text'],
    html: ['html'],
    extract: ['extract'],
    separate: ['separate'],
    detach: ['detach']
  };
}

/*
  getPopplerVarsExcludedFormats
    Gets default poppler excluded formats to exclude -format from command line
 */
function getPopplerVarsExcludedFormats() {
  return ['extract', 'separate', 'html', 'detach', 'ppm', 'tiff'];
}

module.exports = {
  path: popplerVars.path,
  executionOptions: popplerVars.executionOptions,
  convert: convertPdfFile,
  convertPdf: convertPdfFile,
  convertPdfFile: convertPdfFile
};
