'use strict';

String.prototype.format = function () { // eslint-disable-line no-extend-native
    var content = this;
    for (var i = 0; i < arguments.length; i++) {
        var replacement = '{' + i + '}';
        content = content.replace(replacement, arguments[i]);
    }
    return content;
};

String.prototype.toValidId = function () { // eslint-disable-line no-extend-native
    var content = this;
    return content.replace(/\s/g, '-');
};
