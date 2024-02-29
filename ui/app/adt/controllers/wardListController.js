'use strict';

angular.module('bahmni.adt')
    .controller('WardListController', ['$scope', 'queryService', 'spinner', '$q', '$window', '$stateParams', 'appService', '$rootScope',
        function ($scope, queryService, spinner, $q, $window, $stateParams, appService, $rootScope) {
            const enableIPDFeature = appService.getAppDescriptor().getConfigValue('enableIPDFeature');
            $scope.gotoPatientDashboard = function (patientUuid, visitUuid) {
                var options = $.extend({}, $stateParams);
                $.extend(options, {patientUuid: patientUuid, visitUuid: visitUuid || null});
                if (enableIPDFeature) {
                    $window.location = appService.getAppDescriptor().formatUrl(Bahmni.ADT.Constants.mfeIpdDashboard, options, true);
                } else {
                    $window.location = appService.getAppDescriptor().formatUrl(Bahmni.ADT.Constants.ipdDashboard, options, true);
                }
            };

            $scope.searchText = '';

            $scope.searchTextFilter = function (row) {
                var searchText = $scope.searchText;
                if (!searchText) {
                    return true;
                }
                searchText = searchText.toLowerCase();
                const excludedKeys = ["hiddenAttributes", "$$hashKey", "Diagnosis"];
                var attributes = Object.keys(row).filter(function (key) {
                    return !excludedKeys.includes(key);
                });

                return attributes.some(function (attribute) {
                    const rowValue = row[attribute].toString();
                    return rowValue && rowValue.toLowerCase().includes(searchText);
                });
            };
            $scope.iconAttributeName = appService.getAppDescriptor().getConfigValue('iconAttributeName');
            $scope.iconAttributeValue = appService.getAppDescriptor().getConfigValue('iconAttributeValue');
            $scope.icon = appService.getAppDescriptor().getConfigValue('icon');
            $scope.iconStyle = appService.getAppDescriptor().getConfigValue('iconStyle');
            // $scope.showIcon = iconAttributeName && iconAttributeValue && $scope.patientContext.personAttributes
            //                     && $scope.patientContext.personAttributes[iconAttributeName]
            //                     && $scope.patientContext.personAttributes[iconAttributeName].value === iconAttributeValue;

            // if ($scope.patientContext.personAttributes) {
            //     delete $scope.patientContext.personAttributes[iconAttributeName];
            // }

            var getTableDetails = function () {
                var params = {
                    q: "emrapi.sqlGet.wardsListDetails",
                    v: "full",
                    location_name: $scope.ward.ward.name
                };

                return queryService.getResponseFromQuery(params).then(function (response) {
                    $scope.tableDetails = Bahmni.ADT.WardDetails.create(response.data, $rootScope.diagnosisStatus, $scope.iconAttributeName);
                    $scope.tableHeadings = $scope.tableDetails.length > 0 ?
                        Object.keys($scope.tableDetails[0]).filter(function (name) { return name !== $scope.iconAttributeName; })
                        : [];
                });
            };
            spinner.forPromise(getTableDetails());
        }]);
