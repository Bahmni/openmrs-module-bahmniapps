'use strict';

Bahmni.Common.Util.DynamicResourceLoader = (function () {

    return {
        includeJs: function (script, isOfflineApp) {
            var element = document.createElement('script');
            if(isOfflineApp) {
                element.appendChild(document.createTextNode(script));
            }
            else {
                element.setAttribute('src', script);
            }
            document.body.appendChild(element);
        },
        includeCss: function (url) {
            var element = document.createElement('link');
            element.setAttribute('href', url);
            element.setAttribute('rel', "stylesheet");
            element.setAttribute('type', "text/css");
            document.head.appendChild(element);
        }
    };
})();