'use strict';

(function () {
    if (localStorage.getItem('enableCommandPalette') !== 'true') {
        return;
    }

    var hostUrl = localStorage.getItem('host') ? ('https://' + localStorage.getItem('host')) : '';
    var script = document.createElement('script');
    script.src = hostUrl + '/bahmni-v2/command-palette.js';
    document.body.appendChild(script);
}());
