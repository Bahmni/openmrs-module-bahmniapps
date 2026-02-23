/*
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at https://www.bahmni.org/license/mplv2hd.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */


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
