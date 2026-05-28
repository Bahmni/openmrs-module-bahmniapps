'use strict';
(function () {
    var base = (Bahmni.Common.Constants && Bahmni.Common.Constants.bahmniDistroUrl);
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = base + '/command-palette.css';
    document.head.appendChild(link);
    var script = document.createElement('script');
    script.src = base + '/command-palette.js';
    document.body.appendChild(script);
}());
