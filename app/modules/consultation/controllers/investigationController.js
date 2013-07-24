'use strict';

angular.module('opd.consultation.controllers')
    .controller('InvestigationController', ['$scope', 'nodeSelectionService', function ($scope, nodeSelectionService) {
       $scope.patient = Bahmni.Opd.currentPatient;

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
            $scope.patient.drugOrders = $scope.selectedNodes.map(function(node){ return node.data; })
        });
    }]);
