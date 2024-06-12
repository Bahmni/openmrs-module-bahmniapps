'use strict';

angular.module('bahmni.adt')
    .controller('WardListController', ['$scope', 'queryService', 'spinner', '$q', '$window', '$stateParams', 'appService', '$rootScope',
        function ($scope, queryService, spinner, $q, $window, $stateParams, appService, $rootScope) {
            const enableIPDFeature = appService.getAppDescriptor().getConfigValue('enableIPDFeature');
            $scope.gotoPatientDashboard = function (patientUuid, visitUuid) {
                var options = $.extend({}, $stateParams);
                $.extend(options, {patientUuid: patientUuid, visitUuid: visitUuid || null});
                if (enableIPDFeature) {
                    $window.location = appService.getAppDescriptor().formatUrl(Bahmni.ADT.Constants.mfeIpdDashboardUrl, options, true);
                } else {
                    $window.location = appService.getAppDescriptor().formatUrl(Bahmni.ADT.Constants.ipdDashboardUrl, options, true);
                }
            };
            $scope.searchText = '';
            $scope.iconAttributeConfig = appService.getAppDescriptor().getConfigValue('iconAttribute') || {};
            $scope.searchTextFilter = function (row) {
                var searchText = $scope.searchText;
                if (!searchText) {
                    return true;
                }
                searchText = searchText.toLowerCase();
                const excludedKeys = ["hiddenAttributes", "$$hashKey", "Diagnosis"];
                const attributes = Object.keys(row).filter(function (key) {
                    return !excludedKeys.includes(key);
                });

                return attributes.some(function (attribute) {
                    const rowValue = row[attribute].toString();
                    return rowValue && rowValue.toLowerCase().includes(searchText);
                });
            };

            var getTableDetails = function () {
                var params = {
                    q: "emrapi.sqlGet.wardsListDetails",
                    v: "full",
                    location_name: $scope.ward.ward.name
                };
                return queryService.getResponseFromQuery(params).then(function (response) {
                    $scope.tableDetails = Bahmni.ADT.WardDetails.create(response.data, $rootScope.diagnosisStatus, $scope.iconAttributeConfig.attrName);
                    $scope.tableHeadings = $scope.tableDetails.length > 0 ? Object.keys($scope.tableDetails[0]).filter(function (name) { return name !== $scope.iconAttributeConfig.attrName; }) : [];
                });
            };
            spinner.forPromise(getTableDetails());
        }]);
