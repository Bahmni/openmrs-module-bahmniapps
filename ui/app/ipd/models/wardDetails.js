'use strict';

Bahmni.IPD.WardDetails = {};

Bahmni.IPD.WardDetails.create = function (details, listViewBedLayoutConfig) {
    var detailsMap = {};
    var attributesToCopy = listViewBedLayoutConfig.attributes;
    var copyProperties = function (newDetails, oldDetails, properties) {
        properties.forEach(function (property) {
            newDetails[property] = oldDetails[property];
        });
        return newDetails;
    };

    details.forEach(function (detail) {
        detailsMap[detail.Bed] = detailsMap[detail.Bed] || copyProperties({}, detail, attributesToCopy);
    });

    return _.values(detailsMap);
};
