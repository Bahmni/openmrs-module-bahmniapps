'use strict';

angular.module('bahmni.admin')
.service('adminImportService', ['$http', function ($http) {
    this.getAllStatus = function (numberOfDays) {
        return $http.get(Bahmni.Common.Constants.adminImportStatusUrl, {
            params: { numberOfDays: numberOfDays }
        });
    };
}]);
