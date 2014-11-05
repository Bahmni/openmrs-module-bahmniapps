'use strict';

Bahmni.Clinical.SaveHandler = function () {
    var callBacks = [];
    this.register = function (callback) {
        callBacks.push(callback);
    };

    this.fire = function () {
        callBacks.forEach(function (callback) {
            callback();
        });
    };

    this.reset = function () {
        callBacks = [];
    }
};