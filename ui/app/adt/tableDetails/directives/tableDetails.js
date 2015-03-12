'use strict';

angular.module('bahmni.adt')
    .directive('tableDetails',['QueryService','spinner','$q', function (queryService, spinner, $q) {
        var controller = function ($scope) {

            var getTableDetails = function() {
                var details = $q.defer();
                queryService.getResponseFromQuery($scope.params).then(function (response) {
                    $scope.tableDetails = response.data;
                    $scope.tableHeadings = Object.keys(response.data[0]);
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
