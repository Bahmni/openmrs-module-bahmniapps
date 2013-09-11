'use strict';

angular.module('opd.consultation.controllers')
    .controller('InvestigationController', ['$scope', '$rootScope', 'nodeSelectionService', function ($scope, $rootScope, nodeSelectionService) {
        $scope.tabs = [
            {name: 'Laboratory', template: 'LabTreeSelect'},
            {name: 'Radiology', template: 'RadiologyTreeSelect'},
            {name: 'Endoscopy', template: 'EndoscopyTreeSelect'},
            {name: 'Others', template: 'OthersTreeSelect'},
        ]

        $scope.activateTab = function(tab){
            $scope.activeTab && ($scope.activeTab.klass="");
            $scope.activeTab = tab;
            $scope.activeTab.klass="active";
        }

        $scope.removeNode = function(node){
            nodeSelectionService.remove(node);
        }

        $scope.selectedNodes = nodeSelectionService.getSelectedNodes();

        $scope.activateTab($scope.tabs[0]);

        $scope.$on('$destroy', function() {
            $rootScope.currentConsultation.tests = $scope.selectedNodes.map(function(node){ return node.data; })
        });
    }]);
