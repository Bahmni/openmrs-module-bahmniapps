'use strict';

angular.module('opd.consultation.controllers')
    .controller('InvestigationController', ['$scope', '$rootScope', 'spinner', 'labTestsProvider', 'otherTestsProvider', function ($scope, $rootScope, spinner, labTestsProvider, otherTestsProvider) {
        var investigations = $rootScope.consultation.investigations;

        $scope.tabs = [
            {name: 'Laboratory', testsProvider: labTestsProvider, filterColumn: "sample", filterHeader: "Sample",categoryColumn: "department"},
            {name: 'Other', testsProvider: otherTestsProvider, filterColumn: "type", filterHeader: "Investigation",categoryColumn: "category"},
        ];

        $scope.activateTab = function(tab){
            $scope.activeTab && ($scope.activeTab.klass="");
            $scope.activeTab = tab;
            $scope.activeTab.klass="active";
        }

        $scope.activateTab($scope.tabs[0]);
    }]
);
