'use strict';

Bahmni.Clinical.Notifier = function () {
    var callBacks = {};
    this.register = function (key, callback) {
        callBacks[key] = callback;
    };

    this.fire = function () {
        _.each(callBacks, function (callback) {
            callback();
        });
    };
};
