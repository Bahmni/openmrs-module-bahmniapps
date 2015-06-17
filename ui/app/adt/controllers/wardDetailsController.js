'use strict';

angular.module('bahmni.adt')
    .controller('WardDetailsController', ['$scope', '$rootScope', '$window', '$document', '$anchorScroll', 'spinner', 'WardService', 'bedService', 'BedManagementService', 'userService',
        function ($scope, $rootScope, $window, $document, $anchorScroll, spinner, wardService, bedService, bedManagementService, userService) {
            $scope.wards = null;

            var init = function () {
                return loadAllWards();
            };

            var loadAllWards = function () {
                $scope.confirmationMessage = null;
                return wardService.getWardsList().success(function (wardsList) {
                    $scope.wards = wardsList.results;
                });
            };
            spinner.forPromise(init());

        }]);
