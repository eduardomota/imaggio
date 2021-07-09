// jshint esversion: 8

/*
  loadHtml (self-executing)
    Loads HTML files inside the renderer
 */
(async function loadHtml() {
  var htmlpath = './';
  var path = {
    nav: htmlpath + 'navigation/',
    tab: htmlpath + 'tabs/',
  };
  var files = {
    navTop: 'navTop.html',
    p2Container: 'p2.html'
  };

  // Top bar & container
  $('#navTop').load(path.nav + files.navTop);
  $('#p2Container').load(path.tab + files.p2Container);

  return;
})();

//loadHtml();
