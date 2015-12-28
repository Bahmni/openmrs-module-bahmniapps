'use strict';

Bahmni.Common.OrderTemplate = function () {
    var OrderTemplate = function (data) {
        angular.extend(this, data);
    };

    OrderTemplate.create = function (orderTemplate) {
        var orderTemplate = new OrderTemplate({
            name: undefined,
            form: undefined,
            uuid: undefined,
            conceptUuid: undefined,
            dose: undefined,
            doseUnits: undefined,
            frequency: undefined,
            duration: undefined,
            route: undefined
        });
        return orderTemplate;
    };

    return OrderTemplate;
};
