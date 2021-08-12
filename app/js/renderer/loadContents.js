// jshint esversion: 8

/*
  loadHtml (self-executing)
    Loads HTML files inside the renderer
 */
(async function loadHtml() {
  var base = {
    path: './',
    subfolder: {
      nav: 'navigation/',
      tabs: 'tabs/'
    },
    filenames: {
      navTop: 'navTop.html',
      p2Container: 'p2.html'
    }
  };
  var {
    subfolder,
    filenames
  } = base;

  var fullPath = {
    navTop: `${base.path}${subfolder.nav}${filenames.navTop}`,
    p2Container: `${base.path}${subfolder.tabs}${filenames.p2Container}`
  };

  // Dynamically load, property
  for (var property in fullPath) {
    if (fullPath.hasOwnProperty(property)) $(`#${property}`).load(fullPath[property]);
  }

  return;
})();

/*
  Load language only when document is ready
 */
$(document).ready(() => {
  /*
    loadLanguage (self-executing)
      Loads the adequate language onto the app, defaults to english
   */
  (async function loadLanguage() {
    var basePath = '../js/locale/',
      language = detectLanguage(),
      extension = '.json';

    ipcRenderer.send('language:update', language);

    var languageFile = (function() {
      var jsonFile = null;
      $.ajax({
        'async': false,
        'global': false,
        'url': `${basePath}${language}${extension}`,
        'dataType': "json",
        'success': function(contents) {
          jsonFile = contents;
        }
      });

      return jsonFile;
    })();

    for (var property in languageFile) {
      if (languageFile.hasOwnProperty(property)) {
        $(`#${property}`).text(languageFile[property]);
      }
    }
    //console.log(json);

  })();

  /*
    detectLanguage
      Get user language
   */
  function detectLanguage() {
    return navigator.language;
  }

});

//loadHtml();
