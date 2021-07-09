const electron = require('electron'),
  path = require('path'),
  app = electron.remote.app,
  fs = require('fs');

const {
  ipcRenderer,
  remote,
  dialog
} = electron;

var options = {
  conversionType: null
};

updateOptions();

/*
  updateOptions
    Updates options on main
 */
function updateOptions() {
  ipcRenderer.send('convertpdf:updateoptions', options);
}

$(document).ready(() => {
  require('../js/renderer/navigation');

  /*
    Open file/folder button
   */
  $('#S2OneButton').click(function() {
    if ($('#SOProcessFolderTickbox').is(':checked')) {
      ipcRenderer.send('convertpdf:input.folder');
    } else {
      ipcRenderer.send('convertpdf:input.file');
    }
    return;
  });

  /*
    Kill current process
   */
  $('#p2killprocess').click(function() {
    ipcRenderer.send('convertpdf:killprocess');
    return;
  });

  /*
    Process folder tickbox
   */
  $('#SOProcessFolderTickbox').click(function() {
    if (options.conversionType === 'pdfmetaclone') return;

    if ($(this).is(':checked')) {
      $('#S2OneButtonLabel').text('Select folder');
      $('#S2ThreeButtonLabel').text('Drag folder here');
      $('#S2OneLabel').text('2. Select folder');
    } else {
      $('#S2OneButtonLabel').text('Select file');
      $('#S2ThreeButtonLabel').text('Drag file here');
      $('#S2OneLabel').text('2. Select file');
    }
  });

  /*
    Converting file
   */
  ipcRenderer.on('convertpdf:input.file.converting', function(event) {
    $('#Start').addClass('is-hidden');
    $('#Processing').removeClass('is-hidden');
    return;
  });

  /*
    Converting files within folder
   */
  ipcRenderer.on('convertpdf:input.folder.converting', function(event, progress) {
    $('#Start').addClass('is-hidden');
    $('#MassProcessing').removeClass('is-hidden');
    $('#MPLabel').text(progress);
    return;
  });

  /*
    On file conversion success
   */
  ipcRenderer.on('convertpdf:input.file.success', function(event) {
    if ($('#SOProcessFolderTickbox').is(':checked')) {
      $('#MassProcessing').addClass('is-hidden');
    } else {
      $('#Processing').addClass('is-hidden');
    }
    $('#Start').removeClass('is-hidden');
    $('#ProcessingFinished').removeClass('is-hidden');
    setTimeout(() => {
      $('#ProcessingFinished').addClass('is-hidden');
    }, 2500);
    return;
  });

  /*
    On file conversion failure
  */
  ipcRenderer.on('convertpdf:input.file.failure', function(event) {
    $('#Processing').addClass('is-hidden');
    $('#Start').removeClass('is-hidden');
    $('#ProcessingFailed').removeClass('is-hidden');
    setTimeout(() => {
      $('#ProcessingFailed').addClass('is-hidden');
    }, 2500);
    return;
  });

  /*
    dragDropInitialization (self-executing)
   */
  (function dragDropInitialization() {
    var holder = $('#p2Container');
    holder.ondragover = function() {
      return false;
    };

    holder.ondragleave = function() {
      return false;
    };

    holder.ondragend = function() {
      return false;
    };

    holder.ondrop = function(event) {
      event.preventDefault();
      for (let f of event.dataTransfer.files) {
        if ($('#SOProcessFolderTickbox').is(':checked')) {
          ipcRenderer.send('convertpdf:drag.folder', f.path);
        } else {
          ipcRenderer.send('convertpdf:drag.file', f.path);
        }
      }
      return false;
    };
  })();

  /*
    Drag and drop action
   */
  $('#p2Container').on('drop', function(event) {
    event.preventDefault();
    for (let f of event.originalEvent.dataTransfer.files) {
      if ($('#SOProcessFolderTickbox').is(':checked')) {
        ipcRenderer.send('convertpdf:drag.folder', f.path);
      } else {
        ipcRenderer.send('convertpdf:drag.file', f.path);
      }
    }

    return false;
  });

  /*
    Drag and drop action
   */
    $('#p2ButtonDragndrop').on('drop', function(event) {
    event.preventDefault();
    for (let f of event.originalEvent.dataTransfer.files) {
      if ($('#SOProcessFolderTickbox').is(':checked')) {
        ipcRenderer.send('convertpdf:drag.folder', f.path);
      } else {
        ipcRenderer.send('convertpdf:drag.file', f.path);
      }
    }

    return false;
  });

  /*
    Update current conversion type to selection
   */
  $('#SOSelect').on('change', function() {
    var currentAction = this.value;
    options.conversionType = currentAction;
    updateOptions();
    switch (currentAction) {
      case 'pdfmetaclone':
        $('#S2OneButtonLabel').text('Select file');
        $('#S2ThreeButtonLabel').text('Drag target file');
        $('#S2OneLabel').text('2. Select source file');
        $('#S2Two').css('display', 'none');
        $('#S2Three').css('display', 'none');
        $('#StepThree').removeClass('is-hidden');
        $('#SOProcessFolderContainer').css('display', 'none');
        break;

      default:
        $('#S2Two').css('display', 'block');
        $('#S2Three').css('display', 'block');
        $('#StepThree').addClass('is-hidden');
        $('#SOProcessFolderContainer').css('display', 'block');
        if ($('#SOProcessFolderTickbox').is(':checked')) {
          $('#S2OneButtonLabel').text('Select folder');
          $('#S2ThreeButtonLabel').text('Drag folder here');
          $('#S2OneLabel').text('2. Select folder');
        } else {
          $('#S2OneButtonLabel').text('Select file');
          $('#S2ThreeButtonLabel').text('Drag file here');
          $('#S2OneLabel').text('2. Select file');
        }
    }
  });
});
