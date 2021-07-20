// jshint esversion: 8

/*
  $(document).on('drop', function(...) {...});
    Prevent drop redirect
  parameters
    event (object)
 */
$(document).on('drop', function(event) {
  ipcRenderer.send('app:debug', "Preventing drag and drop redirect");
  event.preventDefault();

  return false;
});

/*
  $(document).on('dragover', function(...) {...});
    Prevent drag over redirect
  parameters
    event (object)
 */
$(document).on('dragover', function(event) {
  event.preventDefault();

  return false;
});

/*
  $('#navButtonDevtools').click(function() {...});
    On click: Button toggle developer tools
 */
$('#navButtonDevtools').click(function() {
  remote.getCurrentWindow().toggleDevTools();
  ipcRenderer.send('app:debug', "#navButtonDevtools was clicked");

  return;
});


/*
  $('.delete').click(function() {...});
    On click: Delete open notifications
 */
$('.delete').click(function() {
  ipcRenderer.send('app:debug', ".delete (notifications) was clicked");
  var notificationId = $(this).attr('data-notif');
  $('#' + notificationId).addClass('is-hidden');

  return;
});

/*
  $(document).keyup(function(...) {...});
    On keyup: Assign [ESC] key to close messages or modals
 */
$(document).keyup(function(event) {
  if (event.keyCode === 27) {}
  
  return;
});

/*
  $('#navButtonExtendedmenu').click(function() {...});
    On click: Button/Toggle special menu items
 */
$('#navButtonExtendedmenu').click(function() {
  ipcRenderer.send('app:debug', "#navButtonExtendedmenu was clicked");
  $('#navButtonExtendedmenu').toggleClass('is-active');
  $('.is-specialmenu').toggleClass('is-hidden');

  return;
});

/*
  $('#navButtonMinimize').click(function() {...});
    On click: Minimize window button
 */
$('#navButtonMinimize').click(function() {
  ipcRenderer.send('app:debug', "#navButtonMinimize was clicked");
  remote.getCurrentWindow().minimize();

  return;
});

/*
  $('#navButtonExit').click(function() {...});
    On click: Close main window button
 */
$('#navButtonExit').click(function() {
  ipcRenderer.send('app:debug', "#navButtonExit was clicked");
  remote.getCurrentWindow().close();

  return;
});
