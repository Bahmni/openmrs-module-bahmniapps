'use strict';

angular.module('bahmni.clinical')
    .controller('OrderController', ['$scope','spinner', 'conceptSetService', 'orderTypes',
        function ($scope,spinner, conceptSetService, orderTypes) {
            $scope.consultation.allOrdersTemplates = $scope.consultation.allOrdersTemplates || {};
            $scope.consultation.testOrders = $scope.consultation.testOrders || [];
            $scope.orderTypeConceptClassMap = orderTypes;

            var init = function(){
                spinner.forPromise(conceptSetService.getConceptSetMembers({name:"All Orderables",v:"custom:(uuid,name,conceptClass,setMembers:(uuid,name,conceptClass))"})).then(function(response){
                    var orderables = response.data.results[0].setMembers;

                    $scope.tabs = [];

                    _.forEach(orderables, function(item){
                        $scope.tabs.push({name: item.name.name, tests: $scope.orderTypeConceptClassMap['\''+item.name.name+'\''].conceptClasses, topLevelConcept: item.name.name});
                    });

                    if($scope.tabs) {
                        $scope.activateTab($scope.tabs[0]);
                    }

                    $scope.getAllOrderTemplates();
                });


            };

            $scope.getTabInclude = function(){
                return 'consultation/views/orderTemplateViews/ordersTemplate.html';
            };

            $scope.getAllOrderTemplates = function() {
                $scope.tabs.forEach(function(tab){
                    spinner.forPromise(conceptSetService.getConceptSetMembers({name:tab.topLevelConcept,v:"custom:(uuid,name,conceptClass,setMembers:(uuid,name,conceptClass,setMembers:(uuid,name,conceptClass)))"})
                    ).then(function(response){
                        $scope.consultation.allOrdersTemplates['\''+tab.topLevelConcept+'\''] = response.data.results[0];
                    });
                });
            };

            $scope.getOrderTemplate = function(templateName) {
                var key = '\''+templateName+'\'';               
                return $scope.consultation.allOrdersTemplates[key];
            };

            $scope.activateTab = function(tab){
                $scope.activeTab && ($scope.activeTab.klass="");
                $scope.activeTab = tab;
                $scope.activeTab.klass="active";
            };

            $scope.showleftCategoryTests = function(leftCategory) {
                $scope.leftCategory && ($scope.leftCategory.klass="");
                $scope.leftCategory = leftCategory;
                $scope.leftCategory.klass = "active";
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