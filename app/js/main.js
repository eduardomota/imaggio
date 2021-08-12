const electron = require('electron'),
  path = require('path'),
  debug = require('debug')('main'),
  debugb = require('debug')('renderer'),
  fs = require('fs'),
  pdfPoppler = require('./binaries/poppler'),
  pdfGhostscript = require('./binaries/ghostscript'),
  pdfStamper = require('./binaries/pdfstamper'),
  officeToPdf = require('./binaries/officetopdf'),
  exiftool = require('./binaries/exiftool'),
  imagemagick = require('./binaries/imagemagick');

const {
  app,
  BrowserWindow,
  ipcMain,
  dialog
} = electron;

var mainOptions = null,
  currentExec = null,
  currentLanguage = null;

/*
  createWindow
    Creates and loads window
 */
function createWindow() {
  const windowHandle = new BrowserWindow(
    getBrowserWindowParameters()
  );

  windowHandle.loadFile('./app/html/mainPanel.html');
  windowHandle.once('ready-to-show', function() {
    windowHandle.show();
  });

}

/*
  getBrowserWindowParameters
 */
function getBrowserWindowParameters() {
  var browserWindowParameters = {
    frame: false, // Is basic frame shown (default: false)
    show: false, // Show app before load (default: false)
    height: 550, // Window height in pixels (default: 700)
    width: 700, // Window width in pixels (default: 1000)
    icon: "app.png", // App icon path (default: ...app.png)
    center: true, // Center window
    minimizable: true, // Make window minimizable
    maximizable: false, // Make window maximizable
    movable: true, // Make window movable
    resizable: true, // Make window resizable
    closable: true, // Make window closable
    focusable: true, // Make window focusable
    alwaysOnTop: false, // Keep window on top
    fullscreen: false, // Show window in fullscreen
    fullscreenable: false, // Make window able to go fullscreen
    kiosk: false, // Enable kiosk mode
    darkTheme: true, // GTK dark theme mode
    thickFrame: "WS_THICKFRAME", // Use WS_THICKFRAME style for frameless windows on Windows, which adds standard window frame. Setting it to false will remove window shadow and window animations.
    webPreferences: {
      nodeIntegration: true, // Enable node integration
      contextIsolation: false, // Context isolation
      zoomFactor: 1, // Page zoom factor
      image: true, // Image support
      experimentalFeatures: true, // Enable Chromium experimental features
      backgroundThrottling: false, // Whether to throttle animations and timers when the page becomes background
      offscreen: false, // enable offscreen rendering for the browser window
      spellcheck: false, // Enable builtin spellchecker
      enableRemoteModule: true // Enable remote module
    }
  };

  return browserWindowParameters;
}

/*
  .on('ready')
    On application ready
 */
app.on('ready', () => {
  createWindow();
  onActivate();
});

/*
  onActivate
 */
function onActivate() {
  /*
    .on('activate')
      On application activate
   */
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0)
      createWindow();
  });

}

/*
  .on('window-all-closed')
    On application window closed
 */
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin')
    app.quit();
});

// Update Current conversion options
ipcMain.on('convertpdf:updateoptions', function(event, updatedOptions) {
  mainOptions = updatedOptions;
});

// Kill process
ipcMain.on('convertpdf:killprocess', function(event) {
  currentExec.kill();
  sender.send('convertpdf:input.file.failure', 'error');
});

/*
  .on('language:update')
    On language update, update and load language file to variable
 */
ipcMain.on('language:update', function(event, updatedLanguage) {
  var languagePath = getLanguagePath(),
    languageContents = null;

  languagePath = getLanguageFullPath(languagePath, updatedLanguage);

  try {
    languageContents = fs.readFileSync(languagePath.fullPath, languagePath.encoding);
  } catch (err) {
    languageContents = fs.readFileSync(languagePath.defaultPath, languagePath.encoding);
  }

  languageContents = JSON.parse(languageContents);
  currentLanguage = getCurrentLanguage(updatedLanguage, languageContents);
});

/*
  getCurrentLanguage
 */
function getCurrentLanguage(updatedLanguage, languageContents) {
  var currentLanguage = {
    lang: updatedLanguage,
    contents: languageContents
  };

  return currentLanguage;
}


/*
  getLanguagePath
 */
function getLanguagePath() {
  var languagePath = {
    path: '/locale/',
    defaultLanguage: 'en-US',
    extension: '.json',
    encoding: 'utf8'
  };

  return languagePath;
}

/*
  getLanguageFullPath
 */
function getLanguageFullPath(languagePath, updatedLanguage) {
  var languageFullPath = {
    ...languagePath,
    fullPath: path.join(
      __dirname,
      languagePath.path,
      `${updatedLanguage}${languagePath.extension}`
    ),
    defaultPath: path.join(
      __dirname,
      languagePath.path,
      `${languagePath.defaultLanguage}${languagePath.extension}`
    )
  };

  return languageFullPath;
}

/*
  .on('convertpdf:input.file')
    Input file processing
 */
ipcMain.on('convertpdf:input.file', function(event) {
  if (mainOptions.conversionType === null)
    return;

  var {
    dialogSelectFile,
    dialogSelectOpen
  } = currentLanguage.contents;

  var filePath = dialog.showOpenDialogSync({
    title: dialogSelectFile,
    buttonLabel: dialogSelectOpen,
    properties: ['openFile', 'showHiddenFiles']
  });

  var {
    sender
  } = event;

  if (filePath === undefined || filePath == '' || filePath === null)
    return;

  var file = `${filePath[0]}`;

  convertPdf(file, event);
});


/*
  .on('convertpdf:input.file.clone')
    Clone file selection source
 */
ipcMain.on('convertpdf:input.file.clone', function(event) {
  if (mainOptions.conversionType === null)
    return;

  var {
    dialogSelectFile,
    dialogSelectOpen
  } = currentLanguage.contents;

  var filePath = dialog.showOpenDialogSync({
    title: dialogSelectFile,
    buttonLabel: dialogSelectOpen,
    properties: ['openFile', 'showHiddenFiles']
  });

  var {
    sender
  } = event;

  if (filePath === undefined || filePath == '' || filePath === null)
    return;

  var file = `${filePath[0]}`;

  mainOptions.inputFile = file;
});

/*
  Input folder processing
 */
ipcMain.on('convertpdf:input.folder', function(event) {
  if (mainOptions.conversionType === null)
    return;

  var {
    dialogSelectFolder,
    dialogSelectOpenFolder
  } = currentLanguage.contents;

  var folderPath = dialog.showOpenDialogSync({
    title: dialogSelectFolder,
    buttonLabel: dialogSelectOpenFolder,
    properties: ['openDirectory', 'showHiddenFiles']
  });

  var {
    sender
  } = event;

  if (folderPath === undefined || folderPath == '' || folderPath === null)
    return;

  var folder = folderPath[0];
  var fileList = fs.readdirSync(folder);
  var numFiles = fileList.length;

  fileList.forEach(function(filename, i) {
    var filePath = folder + '\\' + filename;
    var progress = (i + 1) + '/' + numFiles;
    sender.send('convertpdf:input.folder.converting', progress);
    convertPdf(filePath, event, true);
  });

  sender.send('convertpdf:input.file.success');
});

/*
  ipcMain.on('ondragstart', function(...) {...});
    On event: drag and dropping file
  parameters
    event (object) - renderer object
    filePath (string) - dropped file path
 */
ipcMain.on('convertpdf:drag.file', function(event, filePath) {
  if (mainOptions.conversionType === null)
    return;

  var file = filePath;
  convertPdf(file, event);
});

/*
  convertPdf
 */
function convertPdf(file, event, isMassFileConvert = false) {
  var {
    sender
  } = event;

  if (mainOptions.conversionType === null)
    return;

  if (isMassFileConvert == false)
    sender.send('convertpdf:input.file.converting');

  sender.startDrag({
    file: file,
    icon: app.getAppPath() + '/app/jpg/icon.jpg'
  });

  var options = getOptions();

  var execute = getExecutable(options);

  execute.convert(file, opts)
    .then((res) => {
      console.log(`Successfully converted file`);
      sender.send('convertpdf:input.file.success');
    })
    .catch((error) => {
      console.log(`Failed to convert with error: ${error.stack}`);
      sender.send('convertpdf:input.file.failure', error);
    });
}

/*
  getExecutable
 */
function getExecutable(options) {
  var execute = null;

  if (opts.action === 'grayscale') {
    execute = imagemagick;
  } else if (opts.format === 'pdf' && opts.action === 'doc2pdf') {
    execute = officeToPdf;
  } else if (opts.format === 'pdf' && opts.action === 'stamp') {
    execute = pdfStamper;
  } else if ((opts.format === 'pdf' && mainOptions !== 'splitpdf') || opts.format === 'pdfa') {
    execute = pdfGhostscript;
  } else if (opts.action === 'pdfmetaremove' || opts.action === 'pdfmetaclone') {
    execute = exiftool;
  } else {
    execute = pdfPoppler;
  }

  return execute;
}

/*
  getOptions
    Get options from conversion type
 */
function getOptions() {
  var options,
    conversionMap = getConversionMap(),
    conversionType = mainOptions.conversionType;

  if (conversionType in conversionMap)
    options = conversionMap[conversionType];

  if (mainOptions.hasOwnProperty('inputFile'))
    options = {
      ...options,
      inputFile: mainOptions.inputFile
    };

  return options;
}

/*
  getConversionMap
    Gets the current conversion map
 */
function getConversionMap() {
  var conversionMap = {
    /*
      PDF to JPEG
    */
    pdf2jpeglow: {
      format: 'jpeg',
      scaleTo: '2000'
    },
    pdf2jpegmedium: {
      format: 'jpeg',
      scaleTo: '4000'
    },
    pdf2jpeghigh: {
      format: 'jpeg',
      scaleTo: '8000'
    },

    /*
      PDF to PNG
     */
    pdf2pnglow: {
      format: 'png',
      scaleTo: '2000'
    },
    pdf2pngmedium: {
      format: 'png',
      scaleTo: '4000'
    },
    pdf2pnghigh: {
      format: 'png',
      scaleTo: '8000'
    },

    /*
      PDF to SVG
     */
    pdf2svg: {
      format: 'svg'
    },

    /*
    PDF to TIFF
     */
    pdf2tifflow: {
      format: 'tiff',
      scaleTo: '2000'
    },
    pdf2tiffmedium: {
      format: 'tiff',
      scaleTo: '4000'
    },
    pdf2tiffhigh: {
      format: 'tiff',
      scaleTo: '8000'
    },

    /*
      PDF to PPM
     */
    pdf2ppmlow: {
      format: 'ppm',
      scaleTo: '2000'
    },
    pdf2ppmmedium: {
      format: 'ppm',
      scaleTo: '4000'
    },
    pdf2ppmhigh: {
      format: 'ppm',
      scaleTo: '8000'
    },

    /*
      PDF Compression
     */
    pdf2pdflow: {
      format: 'pdf',
      pdfSettings: 'screen'
    },
    pdf2pdfmedium: {
      format: 'pdf',
      pdfSettings: 'ebook'
    },
    pdf2pdfhigh: {
      format: 'pdf',
      pdfSettings: 'printer'
    },

    /*
      PDF splitting
     */
    pdf2split: {
      format: 'separate'
    },

    /*
      PDF extraction
     */
    pdf2extract: {
      format: 'extract'
    },

    /*
      PDF detach
     */
    pdf2detach: {
      format: 'detach'
    },

    /*
      PDF remove metadata
     */
    pdfmetaremove: {
      action: 'pdfmetaremove'
    },

    /*
      PDF clone metadata
     */
    pdfmetaclone: {
      action: 'pdfmetaclone'
    },

    /*
      PDF to Text
     */
    pdf2txt: {
      format: 'txt'
    },

    /*
      PDF to PDFA
     */
    pdf2pdfa: {
      format: 'pdfa'
    },

    /*
      PDF to PDFA + compression
     */
    pdf2pdfalow: {
      pdfSettings: 'screen',
      format: 'pdfa'
    },
    pdf2pdfamedium: {
      pdfSettings: 'ebook',
      format: 'pdfa'
    },
    pdf2pdfahigh: {
      pdfSettings: 'printer',
      format: 'pdfa'
    },

    /*
      PDF custom stamping
     */
    pdfstamp1: {
      format: 'pdf',
      action: 'stamp',
      type: '1'
    },

    /*
      Document to PDF
     */
    doc2pdf: {
      format: 'pdf',
      action: 'doc2pdf',
      type: '1'
    },

    /*
      Image to grayscale
     */
    grayscalepic: {
      action: 'grayscale'
    }
  }

  return conversionMap;
}
