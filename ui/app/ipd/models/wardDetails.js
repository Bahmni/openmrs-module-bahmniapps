'use strict';

Bahmni.IPD.WardDetails = {};

Bahmni.IPD.WardDetails.create = function (details) {
    var detailsMap = {};
    details.forEach(function (detail) {
        detailsMap[detail.Bed] = detailsMap[detail.Bed] || detail;
    });

    return _.values(detailsMap);
};
