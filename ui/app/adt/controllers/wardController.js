'use strict';

angular.module('bahmni.adt')
    .controller('WardController', ['$scope', '$rootScope', '$window', 'spinner', 'wardService', 'bedManagementService', 'userService',
        function ($scope, $rootScope, $window, spinner, wardService, bedManagementService, userService) {
            var init = function () {
                if ($scope.readOnly) {
                    $scope.expanded = $rootScope.currentUser.isFavouriteWard($scope.ward.ward.name);
                    $scope.showWardList();
                } else {
                    $scope.expanded = ($rootScope.bedDetails && $rootScope.bedDetails.wardUuid === $scope.ward.ward.uuid);
                    $scope.showWardLayout();
                }
            };

            $scope.toggleExpandState = function () {
                $scope.expanded = !$scope.expanded;
                if (!$scope.expanded) {
                    $scope.showWardList();
                }
                if ($scope.readOnly) {
                    $rootScope.currentUser.toggleFavoriteWard($scope.ward.ward.name);
                    userService.savePreferences();
                }
            };

            $scope.toggleWardView = function () {
                if ($scope.currentView === 'wardLayout') {
                    $scope.showWardList();
                } else {
                    $scope.showWardLayout();
                }
                expandView();
            };

            $scope.showWardLayout = function () {
                $scope.currentView = "wardLayout";
            };

            $scope.showWardList = function () {
                $scope.currentView = "wardList";
            };

            var expandView = function () {
                if (!$scope.expanded) {
                    $scope.toggleExpandState();
                }
            };

            init();
        }]);
