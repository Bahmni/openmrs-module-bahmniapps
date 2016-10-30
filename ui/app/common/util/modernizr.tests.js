'use strict';

Modernizr.addTest('ios', function () {
    return navigator.userAgent.match(/(iPad|iPhone|iPod)/i) ? true : false;
});

Modernizr.addTest('windowOS', function () {
    return navigator.appVersion.indexOf("Win") != -1;
});
