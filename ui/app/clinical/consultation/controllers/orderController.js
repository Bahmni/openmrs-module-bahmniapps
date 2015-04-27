'use strict';

angular.module('bahmni.clinical')
    .controller('OrderController', ['$scope','spinner', 'clinicalAppConfigService', 'conceptSetService',
        function ($scope,spinner, clinicalAppConfigService, conceptSetService) {
            $scope.consultation.allOrdersTemplates = $scope.consultation.allOrdersTemplates || {};
            $scope.consultation.testOrders = $scope.consultation.testOrders || [];

            var init = function(){
                var ordersConfig = clinicalAppConfigService.getOrders();
                $scope.tabs = [];

                _.forEach(ordersConfig, function(item){
                    $scope.tabs.push({name: item.name, tests: item.tests, topLevelConcept: item.conceptSet});
                });

                if($scope.tabs) {
                    $scope.activateTab($scope.tabs[0]);
                }

                $scope.getAllOrderTemplates();
            };

            $scope.getTabInclude = function(){
                return 'consultation/views/orderTemplateViews/ordersTemplate.html';
            }

            $scope.getAllOrderTemplates = function() {
                $scope.tabs.forEach(function(tab){
                    spinner.forPromise(conceptSetService.getConceptSetMembers({name:tab.topLevelConcept,v:"custom:(uuid,name,conceptClass,setMembers:(uuid,name,conceptClass,setMembers:(uuid,name,conceptClass)))"})
                    ).then(function(response){
                        $scope.consultation.allOrdersTemplates['\''+tab.topLevelConcept+'\''] = response.data.results[0];
                    });
                });
            }

            $scope.getOrderTemplate = function(templateName) {
                var key = '\''+templateName+'\'';               
                return $scope.consultation.allOrdersTemplates[key];
            };

            $scope.activateTab = function(tab){
                $scope.activeTab && ($scope.activeTab.klass="");
                $scope.activeTab = tab;
                $scope.activeTab.klass="active";
                $scope.labSample = undefined;
            };

            $scope.showLabSampleTests = function(labSample) {
                $scope.labSample && ($scope.labSample.klass="");
                $scope.labSample = labSample;
                $scope.labSample.klass = "active";
            };

            $scope.diSelect = function(selectedOrder) {
                var order = _.find($scope.consultation.testOrders, function(order) {
                    return order.concept.uuid === selectedOrder.concept.uuid;
                });

                if (order.uuid) {
                    order.voided = true;
                }
                else {
                    removeOrder(order);
                }
            };

            var removeOrder = function(order){
                _.remove($scope.consultation.testOrders, function(o){
                    return o.concept.uuid == order.concept.uuid;
                });
            };

            init();

        }]);