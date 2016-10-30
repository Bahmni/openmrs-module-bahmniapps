'use strict';

Bahmni.Common.Util.DynamicResourceLoader = (function () {
    return {
        includeJs: function (script, isOfflineApp) {
            var element = document.createElement('script');
            if (isOfflineApp) {
                var file = new Blob([script], {type: 'text/javascript'});
                var url = URL.createObjectURL(file);
                element.setAttribute('src', url);
            } else {
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
