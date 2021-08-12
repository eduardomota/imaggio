// jshint esversion: 8

/*
  loadContents (self-executed)
    Loads application contents
 */
(async function loadContents() {
  loadHtml();
})();

/*
  Load language only when document is ready
 */
$(document).ready(() => {
  loadLanguage();
  return;
});

/*
  loadLanguage (self-executing)
    Loads the adequate language onto the app, defaults to english
 */
function loadLanguage() {
  var language = detectLanguage();

  ipcRenderer.send('language:update', language);

  var languageFile = getLanguageFile(language);

  for (var property in languageFile)
    if (languageFile.hasOwnProperty(property))
      $(`#${property}`).text(languageFile[property]);

  return;
}

/*
  getLanguageFile
    Gets the langauge file
 */
function getLanguageFile(language) {
  var languagePath = getLanguagePathObject();
  languagePath = { ...languagePath,
    language: language
  };
  var fullLanguagePath = getLanguageFullPathVar(languagePath);

  var jsonFile = null;
  $.ajax({
    'async': false,
    'global': false,
    'url': `${fullLanguagePath}`,
    'dataType': "json",
    'success': function(contents) {
      jsonFile = contents;
    }
  });

  return jsonFile;
}

/*
  getLanguagePathObject
 */
function getLanguagePathObject() {
  var languagePathObject = {
    path: '../js/locale/',
    extension: '.json'
  };

  return languagePathObject;
}

/*
  getLanguageFullPathVar
 */
function getLanguageFullPathVar(languagePath) {
  var languageFullPathVar = `${languagePath.path}${languagePath.language}${languagePath.extension}`;

  return languageFullPathVar;
}

/*
  loadHtml
    Loads HTML files inside the renderer
 */
function loadHtml() {
  var base = getHtmlPathObject();
  var fullPath = getHtmlFullPathObject(base);

  // Dynamically load through property, element id
  for (var property in fullPath)
    if (fullPath.hasOwnProperty(property))
      $(`#${property}`).load(fullPath[property]);

  return;
}

/*
  getFullPathObject
    Compiles/gets full path object
 */
function getHtmlFullPathObject(baseVar) {
  var {
    subfolder,
    filenames
  } = baseVar;

  var fullPathObject = {
    navTop: `${baseVar.path}${subfolder.nav}${filenames.navTop}`,
    p2Container: `${baseVar.path}${subfolder.tabs}${filenames.p2Container}`
  };

  return fullPathObject;
}

/*
  getPathObject
    Gets path object for navigation files
 */
function getHtmlPathObject() {
  var pathObject = {
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

  return pathObject;
}

/*
  detectLanguage
    Get user language
 */
function detectLanguage() {
  return navigator.language;
}
