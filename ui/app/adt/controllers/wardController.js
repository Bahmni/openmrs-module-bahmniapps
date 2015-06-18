'use strict';

angular.module('bahmni.adt')
    .controller('WardController', ['$scope', '$rootScope', '$window', '$anchorScroll', 'spinner', 'WardService', 'BedManagementService', 'userService',
        function ($scope, $rootScope, $window, $anchorScroll, spinner, wardService, bedManagementService, userService) {

            var init = function () {
                if ($scope.bedAssignable) {
                    $scope.expanded = ($rootScope.bedDetails && $rootScope.bedDetails.wardUuid == $scope.ward.ward.uuid);
                    $scope.showWardLayout();
                } else {
                    $scope.expanded = $rootScope.currentUser.isFavouriteWard($scope.ward.ward.name);
                    $scope.showWardList()
                }
            };

            $scope.toggleExpandState = function () {
                $scope.expanded = !$scope.expanded;
                if(!$scope.bedAssignable) {
                    $rootScope.currentUser.toggleFavoriteWard($scope.ward.ward.name);
                    userService.savePreferences();
                }
            };

            $scope.toggleWardView = function(){
                if($scope.currentView == 'wardLayout'){
                    $scope.showWardList();
                }else{
                    $scope.showWardLayout();
                }
                expandView();
            };

            $scope.showWardLayout = function () {
                $anchorScroll();
                $scope.currentView = "wardLayout";
            };

            var expandView = function() {
                if(!$scope.expanded){
                    $scope.toggleExpandState();
                }
            };

            $scope.showWardList = function () {
                $scope.currentView = "wards";
            };

            init();
        }]);
