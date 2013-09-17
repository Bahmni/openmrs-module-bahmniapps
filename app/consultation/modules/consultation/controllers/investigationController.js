'use strict';

angular.module('opd.consultation.controllers')
    .controller('InvestigationController', ['$scope', '$rootScope', function ($scope, $rootScope) {
        var investigations = $rootScope.consultation.investigations;
        
        $scope.tabs = [
            {name: 'Laboratory'},
            {name: 'Radiology'},
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

        var hasInvestigationByUuid = function(uuid) {
            for(var i=0; i < investigations.length; i++) {
                if(investigations[i].uuid === uuid) {
                    return true;
                }
            }
            return false;
        }

        var removeInvestigationForNode = function(node) {
            for(var i=0; i < investigations.length; i++) {
                if(investigations[i].uuid === node.data.uuid) {
                    investigations.splice(i, 1);
                    return;
                }
            }
        }

        var addInvestigationFromNode = function(node) {
            var investigation = {uuid: node.data.uuid, name: node.data.name.display }
            if(!hasInvestigationByUuid(investigation.uuid)){
                investigations.push(investigation);
            };
        } 

        $scope.onAddNodes = function(nodes){
            nodes.forEach(addInvestigationFromNode);
        };

        $scope.onRemoveNodes = function(nodes){
            nodes.forEach(removeInvestigationForNode);
        };
    }]);
