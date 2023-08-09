'use strict';

Modernizr.addTest('ios', function () {
    return !!navigator.userAgent.match(/(iPad|iPhone|iPod)/i);
});

Modernizr.addTest('windowOS', function () {
    return navigator.appVersion.indexOf("Win") != -1;
});
