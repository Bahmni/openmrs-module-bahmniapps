'use strict';

angular.module('bahmni.adt')
    .directive('wardList',['QueryService','spinner','$q','$window','$stateParams','appService', function (queryService, spinner, $q, $window, $stateParams, appService) {
        var controller = function ($scope) {

            $scope.gotoPatientDashboard = function(patientUuid, visitUuid){
                var options = $.extend({}, $stateParams);
                $.extend(options, { patientUuid: patientUuid, visitUuid: visitUuid || null});
                $window.location = appService.getAppDescriptor().formatUrl(Bahmni.ADT.Constants.ipdDashboard, options, true);
            };

            var getTableDetails = function() {
                var params = {
                    q: "emrapi.sqlGet.wardsListDetails",
                    v: "full",
                    location_name: $scope.ward.ward.name
                };

                return queryService.getResponseFromQuery(params).then(function (response) {
                    $scope.tableDetails = Bahmni.ADT.WardDetails.create(response.data);
                    $scope.tableHeadings = $scope.tableDetails.length > 0 ? Object.keys($scope.tableDetails[0]) : [];
                });
            };
            spinner.forPromise(getTableDetails());
        };
        return {
            restrict: 'E',
            controller: controller,
            scope: {
               ward:"="
            },
            templateUrl: "../adt/views/wardList.html"
        };
    }]);
