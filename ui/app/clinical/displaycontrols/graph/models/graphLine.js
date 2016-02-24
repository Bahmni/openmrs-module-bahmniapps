'use strict';

(function () {
    Bahmni = Bahmni || {};
    Bahmni.Clinical = Bahmni.Clinical || {};

    Bahmni.Clinical.ObservationGraphLine = function (proto) {
        angular.extend(this, proto);
    };

    Bahmni.Clinical.ObservationGraphLine.prototype.addPoint = function (point) {
        if (point[this.name]) {
            this.values.push(point);
        }
    };
})();
