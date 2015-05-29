'use strict';

Bahmni.Common.Util.DynamicResourceLoader = (function () {

    return {
        includeJs: function (url) {
            var element = document.createElement('script');
            element.setAttribute('src', url);
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