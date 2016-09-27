'use strict';

angular.module('bahmni.adt')
    .controller('WardListController', ['$scope', 'QueryService', 'spinner', '$q', '$window', '$stateParams', 'appService',
        'diagnosisService',
        function ($scope, queryService, spinner, $q, $window, $stateParams, appService, diagnosisService) {

            $scope.gotoPatientDashboard = function (patientUuid, visitUuid) {
                var options = $.extend({}, $stateParams);
                $.extend(options, {patientUuid: patientUuid, visitUuid: visitUuid || null});
                $window.location = appService.getAppDescriptor().formatUrl(Bahmni.ADT.Constants.ipdDashboard, options, true);
            };

            var getTableDetails = function () {
                var params = {
                    q: "emrapi.sqlGet.wardsListDetails",
                    v: "full",
                    location_name: $scope.ward.ward.name
                };

                return queryService.getResponseFromQuery(params).then(function (response) {
                    $scope.tableDetails = Bahmni.ADT.WardDetails.create(response.data, diagnosisService.getDiagnosisStatuses());
                    $scope.tableHeadings = $scope.tableDetails.length > 0 ? Object.keys($scope.tableDetails[0]) : [];
                });
            };
            spinner.forPromise(getTableDetails());
        }]);