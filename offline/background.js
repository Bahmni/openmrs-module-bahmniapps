/**
 * Global properties.
 */
var CONSTANTS = {
    APP_WIDTH: 1024,
    APP_HEIGHT: 800
};

/**
 * Listens for the app launching then creates the window
 *
 * @see http://developer.chrome.com/apps/app.window.html
 */
chrome.app.runtime.onLaunched.addListener(function() {
    runApp();
});

/**
 * Listens for the app restarting then re-creates the window.
 *
 * @see http://developer.chrome.com/apps/app.runtime.html
 */
chrome.app.runtime.onRestarted.addListener(function() {
    runApp();
});

var runApp = function () {
    chrome.app.window.create('index.html', {
        id: 'main',
        bounds: { width: CONSTANTS.APP_WIDTH, height: CONSTANTS.APP_HEIGHT },
        resizable: true
    });
};

