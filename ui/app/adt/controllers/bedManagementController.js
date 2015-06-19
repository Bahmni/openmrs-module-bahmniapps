'use strict';

angular.module('bahmni.adt')
    .controller('BedManagementController', [
        '$scope', '$rootScope', '$location', '$timeout', '$document', '$stateParams', 'spinner', 'WardService',
        'BedManagementService', 'bedService', 'encounterService', 'sessionService', 'messagingService', 'backlinkService',
        function ($scope, $rootScope, $location, $timeout, $document, $stateParams, spinner, wardService,
                  bedManagementService, bedService, encounterService, sessionService, messagingService, backlinkService) {
            $scope.wards = null;
            $scope.encounterUuid = $stateParams.encounterUuid;
            $scope.visitUuid = $stateParams.visitUuid;

            var init = function(){
                loadAllWards();
            };

            var loadAllWards = function () {
                spinner.forPromise(wardService.getWardsList().success(function (wardsList) {
                    $scope.wards = wardsList.results;
                }));
            };

            $scope.$on('$stateChangeSuccess', function () {
                backlinkService.addUrl({
                    url: "#/patient/" + $scope.patient.uuid + "/visit/" + $scope.visitUuid + "/",
                    title: "Back to IPD dashboard",
                    icon: "fa-medkit fa-bed fa-white"
                });
            });

            init();

        }]);
