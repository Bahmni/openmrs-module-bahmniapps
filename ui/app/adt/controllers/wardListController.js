'use strict';

angular.module('bahmni.adt')
    .controller('WardListController', ['$scope', 'queryService', 'spinner', '$q', '$window', '$stateParams', 'appService', '$rootScope',
        function ($scope, queryService, spinner, $q, $window, $stateParams, appService, $rootScope) {
            $scope.gotoPatientDashboard = function (patientUuid, visitUuid) {
                var options = $.extend({}, $stateParams);
                $.extend(options, {patientUuid: patientUuid, visitUuid: visitUuid || null});
                $window.location = appService.getAppDescriptor().formatUrl(Bahmni.ADT.Constants.ipdDashboard, options, true);
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
