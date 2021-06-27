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
  console.log(options);
  ipcRenderer.send('convertpdf:updateoptions', options);
}

$(document).ready(() => {
  require('../js/renderer/navigation');

  /*
    Open file/folder button
   */
  $('#p2ButtonFile').click(function() {
    if ($('#processfoldertickbox').is(':checked')) {
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
  $('#processfoldertickbox').click(function() {
    if ($(this).is(':checked')) {
      $('#openbutton').text('Select folder');
      $('#dragbutton').text('Drag folder here');
      $('#selectlabel').text('2. Select folder');
    } else {
      $('#openbutton').text('Select file');
      $('#dragbutton').text('Drag file here');
      $('#selectlabel').text('2. Select file');
    }
  });

  /*
    Converting file
   */
  ipcRenderer.on('convertpdf:input.file.converting', function(event) {
    $('#p2Intro').addClass('is-hidden');
    $('#p2Converting').removeClass('is-hidden');
    return;
  });

  /*
    Converting files within folder
   */
  ipcRenderer.on('convertpdf:input.folder.converting', function(event, progress) {
    $('#p2Intro').addClass('is-hidden');
    $('#p2ConvertingMass').removeClass('is-hidden');
    $('#massfileProg').text(progress);
    return;
  });

  /*
    On file conversion success
   */
  ipcRenderer.on('convertpdf:input.file.success', function(event) {
    if ($('#processfoldertickbox').is(':checked')) {
      $('#p2ConvertingMass').addClass('is-hidden');
    } else {
      $('#p2Converting').addClass('is-hidden');
    }
    $('#p2Intro').removeClass('is-hidden');
    $('#p2Converted').removeClass('is-hidden');
    setTimeout(() => {
      $('#p2Converted').addClass('is-hidden');
    }, 2500);
    return;
  });

  /*
    On file conversion failure
  */
  ipcRenderer.on('convertpdf:input.file.failure', function(event) {
    $('#p2Converting').addClass('is-hidden');
    $('#p2Intro').removeClass('is-hidden');
    $('#p2Failed').removeClass('is-hidden');
    setTimeout(() => {
      $('#p2Failed').addClass('is-hidden');
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
        if ($('#processfoldertickbox').is(':checked')) {
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
      if ($('#processfoldertickbox').is(':checked')) {
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
      if ($('#processfoldertickbox').is(':checked')) {
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
  $('#selectedAction').on('change', function() {
    var currentAction = this.value;
    options.conversionType = currentAction;
    updateOptions();
  });
});
