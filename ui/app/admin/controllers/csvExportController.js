'use strict';

angular.module('bahmni.admin')
    .controller('CSVExportController', ['$scope', '$state', 'appService', '$http', function ($scope, $state, appService, $http) {
        $scope.appExtensions = appService.getAppDescriptor().getExtensions("bahmni.admin.csvExport", "link") || [];
        $scope.conceptNameInvalid = false;

        $scope.getConcepts = function (request) {
            return $http.get(Bahmni.Common.Constants.conceptUrl, { params: {q: request.term, v: "custom:(uuid,name)"}}).then(function (result) {
                return result.data.results;
            });
        };
        $scope.conceptSet = null;
        $scope.getDataResults = function (results) {
            return results.map(function (concept) {
                return {'concept': {uuid: concept.uuid, name: concept.name.name}, 'value': concept.name.name};
            });
        };

        $scope.onConceptSelected = function () {
            if ($scope.conceptSet) {
                window.open(Bahmni.Common.Constants.conceptSetExportUrl.replace(":conceptName", $scope.conceptSet));
            }
        };
    }]);
