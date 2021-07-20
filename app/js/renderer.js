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

startupRoutine();

/*
  updateOptions
    Updates options on main
 */
function updateOptions() {
  ipcRenderer.send('convertpdf:updateoptions', options);
}

/*
  startupRoutine
    Startup routines
 */
function startupRoutine() {
  updateOptions();
}

$(document).ready(() => {
  require('../js/renderer/navigation');

  /*
    Open file/folder button
   */
  $('#S2OneButton').click(function() {
    if (options.conversionType === 'pdfmetaclone') {
      ipcRenderer.send('convertpdf:input.file.clone');
      return;
    }
    if ($('#SOProcessFolderTickbox').is(':checked')) {
      ipcRenderer.send('convertpdf:input.folder');
    } else {
      ipcRenderer.send('convertpdf:input.file');
    }
    return;
  });

  /*
  meta clone button
   */
  $('#S3Button').click(function() {
    ipcRenderer.send('convertpdf:input.file');
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
      $('#stepTwoLabel').addClass('is-hidden');
      $('#stepTwoLabel2').removeClass('is-hidden');
      $('#stepTwoButtonLabel').addClass('is-hidden');
      $('#stepTwoButtonLabel2').removeClass('is-hidden');
      $('#stepTwoDragLabel').addClass('is-hidden');
      $('#stepTwoDragLabel2').removeClass('is-hidden');
    } else {
      $('#stepTwoLabel').removeClass('is-hidden');
      $('#stepTwoLabel2').addClass('is-hidden');
      $('#stepTwoButtonLabel').removeClass('is-hidden');
      $('#stepTwoButtonLabel2').addClass('is-hidden');
      $('#stepTwoDragLabel').removeClass('is-hidden');
      $('#stepTwoDragLabel2').addClass('is-hidden');
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
      if (options.conversionType === 'pdfmetaclone') return;
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
    if (options.conversionType === 'pdfmetaclone') return;
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
      // PDF metadata clone option
      case 'pdfmetaclone':
        // Hide and show correct labels, file option
        $('#stepTwoLabel').removeClass('is-hidden');
        $('#stepTwoLabel2').addClass('is-hidden');
        $('#stepTwoButtonLabel').removeClass('is-hidden');
        $('#stepTwoButtonLabel2').addClass('is-hidden');
        $('#stepTwoDragLabel').removeClass('is-hidden');
        $('#stepTwoDragLabel2').addClass('is-hidden');
        // Hide step 2 partially
        $('#S2Two').css('display', 'none');
        $('#S2Three').css('display', 'none');
        // Show step 3
        $('#StepThree').removeClass('is-hidden');
        // Hide process folder tickbox option
        $('#SOProcessFolderContainer').css('display', 'none');
        break;

      default:
        // Show step 2
        $('#S2Two').css('display', 'block');
        $('#S2Three').css('display', 'block');
        // Hide step 3
        $('#StepThree').addClass('is-hidden');
        $('#SOProcessFolderContainer').css('display', 'block');
        if ($('#SOProcessFolderTickbox').is(':checked')) {
          // Hide and show correct labels, folder option
          $('#stepTwoLabel').addClass('is-hidden');
          $('#stepTwoLabel2').removeClass('is-hidden');
          $('#stepTwoButtonLabel').addClass('is-hidden');
          $('#stepTwoButtonLabel2').removeClass('is-hidden');
          $('#stepTwoDragLabel').addClass('is-hidden');
          $('#stepTwoDragLabel2').removeClass('is-hidden');
        } else {
          // Hide and show correct labels, file option
          $('#stepTwoLabel').removeClass('is-hidden');
          $('#stepTwoLabel2').addClass('is-hidden');
          $('#stepTwoButtonLabel').removeClass('is-hidden');
          $('#stepTwoButtonLabel2').addClass('is-hidden');
          $('#stepTwoDragLabel').removeClass('is-hidden');
          $('#stepTwoDragLabel2').addClass('is-hidden');
        }
    }
  });
});
