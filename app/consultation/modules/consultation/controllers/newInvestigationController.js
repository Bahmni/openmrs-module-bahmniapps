'use strict';

angular.module('opd.consultation.controllers')
    .controller('NewInvestigationController', ['$scope', '$q', '$rootScope', 'conceptSetService', 'spinner', 'labTestsProvider', function ($scope, $q, $rootScope, conceptSetService, spinner, labTestsProvider) {
        var investigations = $rootScope.consultation.investigations;

        $scope.tabs = [
            {name: 'Laboratory', testsProvider: labTestsProvider, filterColumn: "sample", categoryColumn: "department"},
            {name: 'Other', testsProvider: labTestsProvider, filterColumn: "sample", categoryColumn: "department"},
        ];

        $scope.activateTab = function(tab){
            $scope.activeTab && ($scope.activeTab.klass="");
            $scope.activeTab = tab;
            $scope.activeTab.klass="active";
        }

        $scope.activateTab($scope.tabs[0]);

        $scope.options = {testsProvider: labTestsProvider};
    }]
);
