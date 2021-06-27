const electron = require('electron'),
  path = require('path'),
  url = require('url'),
  debug = require('debug')('main'),
  debugb = require('debug')('renderer'),
  fs = require('fs'),
  pdfPoppler = require('./binaries/poppler'),
  pdfGhostscript = require('./binaries/ghostscript'),
  pdfStamper = require('./binaries/pdfstamper'),
  officeToPdf = require('./binaries/officetopdf');

const {
  app,
  BrowserWindow,
  Menu,
  ipcMain,
  dialog,
  remote
} = electron;

var mainOptions = null,
  currentExec = null;

/*
  createWindow
    Creates and loads window
 */
function createWindow() {
  const windowHandle = new BrowserWindow({
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
  });

  windowHandle.loadFile('./app/html/mainPanel.html');
  windowHandle.once('ready-to-show', () => {
    windowHandle.show()
  });

}

/*
  .on('ready')
    On application ready
 */
app.on('ready', () => {
  createWindow();


  /*
    .on('activate')
      On application activate
   */
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});


/*
  .on('window-all-closed')
    On application window closed
 */
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
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
  Input file processing
 */
ipcMain.on('convertpdf:input.file', function(event) {

  if (mainOptions.conversionType === null) return;

  var filePath = dialog.showOpenDialogSync({
    title: "Select file",
    buttonLabel: "Open",
    properties: ['openFile', 'showHiddenFiles']
  });

  var {
    sender
  } = event;

  if (filePath === undefined || filePath == '' || filePath === null) return;

  console.log(`Selected file path OK: ${filePath}`);
  let file = filePath[0];

  convertPdf(file, event);
});

/*
  Input folder processing
 */
ipcMain.on('convertpdf:input.folder', function(event) {

  if (mainOptions.conversionType === null) return;

  var folderPath = dialog.showOpenDialogSync({
    title: "Select folder",
    buttonLabel: "Select",
    properties: ['openDirectory', 'showHiddenFiles']
  });

  var {
    sender
  } = event;

  if (folderPath === undefined || folderPath == '' || folderPath === null) return;

  console.log(`Selected folder path OK: ${folderPath}`);
  let folder = folderPath[0];
  let fileList = fs.readdirSync(folder);
  let numFiles = fileList.length;

  fileList.forEach(function (filename, i) {
    var filePath = folder + '\\' + filename;
    var progress = (i + 1) + '/' + numFiles;
    console.log(filePath);
    console.log(progress);
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

  if (mainOptions.conversionType === null) return;

  console.log(`Dragged file path OK: ${filePath}`);
  let file = filePath;
  convertPdf(file, event);
});

/*
  convertPdf
 */
function convertPdf(file, event, isMassFileConvert = false) {
  var {
    sender
  } = event;

  console.log(mainOptions.conversionType);
  if (mainOptions.conversionType === null) return;

  console.log(mainOptions);

  if (isMassFileConvert == false) sender.send('convertpdf:input.file.converting');

  sender.startDrag({
    file: file,
    icon: app.getAppPath() + '/app/jpg/icon.jpg'
  });

  let opts = getOptions();

  console.log(mainOptions);
  console.log(opts);

  if (opts.format === 'pdf' && opts.action === 'doc2pdf') {
    officeToPdf.convert(file, opts)
      .then((res) => {
        console.log(`Successfully converted file`);
        sender.send('convertpdf:input.file.success');
      })
      .catch((error) => {
        console.log(`Failed to convert with error: ${error.stack}`);
        sender.send('convertpdf:input.file.failure', error);
      });
  } else if (opts.format === 'pdf' && opts.action === 'stamp') {

  } else if ((opts.format === 'pdf' && mainOptions !== 'splitpdf') || opts.format === 'pdfa') {
    pdfGhostscript.convert(file, opts)
      .then((res) => {
        console.log(`Successfully converted file`);
        sender.send('convertpdf:input.file.success');
      })
      .catch((error) => {
        console.log(`Failed to convert with error: ${error.stack}`);
        sender.send('convertpdf:input.file.failure', error);
      });
  } else {
    pdfPoppler.convert(file, opts)
      .then((res) => {
        console.log(`Successfully converted file`);
        sender.send('convertpdf:input.file.success');
      })
      .catch((error) => {
        console.log(`Failed to convert with error: ${error.stack}`);
        sender.send('convertpdf:input.file.failure', error);
      });
  }
  return;

}

/*
  getOptions
    Get options from conversion type
 */
function getOptions() {
  var options;
  switch (mainOptions.conversionType) {
    case 'pdf2jpeglow':
      options = {
        format: 'jpeg',
        scaleTo: '2000'
      };
      break;
    case 'pdf2jpegmedium':
      options = {
        format: 'jpeg',
        scaleTo: '4000'
      };
      break;
    case 'pdf2jpeghigh':
      options = {
        format: 'jpeg',
        scaleTo: '8000'
      };
      break;
    case 'pdf2pnglow':
      options = {
        format: 'png',
        scaleTo: '2000'
      };
      break;
    case 'pdf2pngmedium':
      options = {
        format: 'png',
        scaleTo: '4000'
      };
      break;
    case 'pdf2pnghigh':
      options = {
        format: 'png',
        scaleTo: '8000'
      };
      break;
    case 'pdf2svg':
      options = {
        format: 'svg'
      };
      break;
    case 'pdf2pdflow':
      options = {
        format: 'pdf',
        pdfSettings: 'screen'
      };
      break;
    case 'pdf2pdfmedium':
      options = {
        format: 'pdf',
        pdfSettings: 'ebook'
      };
      break;
    case 'pdf2pdfhigh':
      options = {
        format: 'pdf',
        pdfSettings: 'printer'
      };
      break;
    case 'pdf2split':
      options = {
        format: 'separate'
      };
      break;
    case 'pdf2extract':
      options = {
        format: 'extract'
      };
      break;
    case 'pdf2txt':
      options = {
        format: 'txt'
      };
      break;
    case 'pdf2pdfa':
      options = {
        format: 'pdfa'
      };
      break;
    case 'pdf2pdfalow':
      options = {
        pdfSettings: 'screen',
        format: 'pdfa'
      };
      break;
    case 'pdf2pdfamedium':
      options = {
        pdfSettings: 'ebook',
        format: 'pdfa'
      };
      break;
    case 'pdf2pdfahigh':
      options = {
        pdfSettings: 'printer',
        format: 'pdfa'
      };
      break;
    case 'pdfstamp1':
      options = {
        format: 'pdf',
        action: 'stamp',
        type: '1'
      };
      break;
    case 'doc2pdf':
      options = {
        format: 'pdf',
        action: 'doc2pdf',
        type: '1'
      }
  }

  return options;
}
