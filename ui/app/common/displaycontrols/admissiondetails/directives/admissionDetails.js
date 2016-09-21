"use strict";

angular.module('bahmni.common.displaycontrol.admissiondetails')
    .directive('admissionDetails', ['bedService', 'visitService', 'spinner', '$q', function (bedService, visitService, spinner, $q) {
        var controller = function($scope){
            $scope.showDetailsButton = function(encounter){
                return $scope.params && $scope.params.showDetailsButton && !encounter.notes
            };
            $scope.toggle= function(element){
                element.show = !element.show;
            };
            spinner.forPromise(init($scope), "#admissionDetails");
        };
        var isReady = function ($scope) {
            return !_.isUndefined($scope.patientUuid) && !_.isUndefined($scope.visitSummary);
        };
        var onReady = function($scope, promise){
            var visitUuid = _.get($scope.visitSummary,'uuid');
            bedService.getAssignedBedForPatient($scope.patientUuid,visitUuid).then(function(bedDetails){
                $scope.bedDetails = bedDetails;
                promise.resolve();
            });
        };
        var init = function($scope){
            var defer = $q.defer();
            var stopWatching = $scope.$watchGroup(['patientUuid', 'visitSummary'], function() {
                if(isReady($scope)){
                    stopWatching();
                    onReady($scope, defer);
                }
            });
            return defer.promise;
        };
        return {
            restrict: 'E',
            controller: controller,
            templateUrl: "../common/displaycontrols/admissiondetails/views/admissionDetails.html",
            scope: {
                params: "=",
                patientUuid: "=",
                visitSummary: "="
            }
        };
    }]);
