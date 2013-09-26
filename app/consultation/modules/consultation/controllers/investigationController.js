'use strict';

angular.module('opd.consultation.controllers')
    .controller('InvestigationController', ['$scope', '$rootScope', function ($scope, $rootScope) {
        var investigations = $rootScope.consultation.investigations;
        
        $scope.tabs = [
            {name: 'Laboratory', orderType: 'Lab Order'},
            {name: 'Radiology', orderType: 'Radiology Order'},
            {name: 'Endoscopy'},
            {name: 'Others'},
        ]

        $scope.activateTab = function(tab){
            $scope.activeTab && ($scope.activeTab.klass="");
            $scope.activeTab = tab;
            $scope.activeTab.klass="active";
        }

        $scope.activateTab($scope.tabs[0]);

        $scope.removeInvestigation = function(investigation){
            var index = investigations.indexOf(investigation);
            if(index >= 0) {
                investigations.splice(index, 1);
            }
        }

        $scope.investigationComparer = function(investigation1, investigation2) {
            return investigation1.uuid === investigation2.uuid;
        }
        
        $scope.conceptToInvestigationMapper = function(concept, treeAdditionalData) {
            return{ uuid: concept.uuid, name: concept.name.display,
                    isSet: concept.set, orderTypeUuid: $rootScope.encounterConfig.orderTypes[treeAdditionalData.orderType] };
        }
    }]);
