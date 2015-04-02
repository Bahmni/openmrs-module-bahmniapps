'use strict';

angular.module('bahmni.adt')
    .directive('tableDetails',['QueryService','spinner','$q','$window','$stateParams','appService', function (queryService, spinner, $q, $window, $stateParams, appService) {
        var controller = function ($scope) {

            $scope.gotoPatientDashboard = function(patientUuid, visitUuid){
                var options = $.extend({}, $stateParams);
                $.extend(options, { patientUuid: patientUuid, visitUuid: visitUuid || null});
                $window.location = appService.getAppDescriptor().formatUrl(Bahmni.ADT.Constants.ipdDashboard, options, true);
            };

            var getTableDetails = function() {
                var details = $q.defer();
                queryService.getResponseFromQuery($scope.params).then(function (response) {
                    $scope.tableDetails = Bahmni.ADT.WardDetails.create(response.data);
                    $scope.tableHeadings = $scope.tableDetails.length > 0 ? Object.keys($scope.tableDetails[0]) : [];
                    details.resolve();
                });
                return details.promise;
            };
            spinner.forPromise(getTableDetails());
        };
        return {
            restrict: 'E',
            controller: controller,
            scope: {
               params:"="
            },
            templateUrl: "tableDetails/views/tableDetails.html"
        };
    }]);
