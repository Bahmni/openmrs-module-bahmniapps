'use strict';

angular.module('bahmni.clinical')
    .controller('OrderController', ['$scope', 'allOrderables','ngDialog',
        function ($scope, allOrderables, ngDialog) {
            $scope.consultation.testOrders = $scope.consultation.testOrders || [];
            $scope.allOrdersTemplates = allOrderables;

            var init = function(){

                $scope.tabs = [];

                _.forEach($scope.allOrdersTemplates, function(item){
                    var conceptName = $scope.getName(item);
                    $scope.tabs.push({name: conceptName ? conceptName : item.name.name, topLevelConcept: item.name.name});
                });

                if($scope.tabs) {
                    $scope.activateTab($scope.tabs[0]);
                }
            };

            $scope.getConceptClassesInSet = function(conceptSet) {
                var conceptsWithUniqueClass = _.uniq(conceptSet? conceptSet.setMembers:[],function(concept){return concept.conceptClass.uuid;});
                var conceptClasses = [];
                _.forEach(conceptsWithUniqueClass, function(concept){
                    conceptClasses.push({name:concept.conceptClass.name, description: concept.conceptClass.description});
                });
                conceptClasses = _.sortBy(conceptClasses, 'name');
                return conceptClasses;
            };

            $scope.getOrderTemplate = function(templateName) {
                var key = '\''+templateName+'\'';
                return $scope.allOrdersTemplates[key];
            };

            $scope.updateSelectedOrdersForActiveTab = function(){
                var activeTabTestConcepts = _.pluck(_.flatten(_.pluck($scope.getOrderTemplate($scope.activeTab.name).setMembers, 'setMembers')), 'uuid');
                $scope.selectedOrders =  _.filter($scope.consultation.testOrders,function(testOrder){
                       return _.indexOf(activeTabTestConcepts, testOrder.concept.uuid) != -1;
                });
            };

            $scope.$watchCollection('consultation.testOrders', $scope.updateSelectedOrdersForActiveTab);

            var collapseExistingActiveSection = function(section){
                section && (section.klass="");
            };

            $scope.activateTab = function(tab){
                if(tab.klass=="active"){
                    tab.klass="";
                    $scope.activeTab = undefined;
                }
                else{
                    collapseExistingActiveSection($scope.activeTab);
                    $scope.activeTab = tab;
                    $scope.activeTab.klass="active";
                    $scope.updateSelectedOrdersForActiveTab();
                    showFirstLeftCategoryByDefault();
                }
            };

            var showFirstLeftCategoryByDefault = function(){
                if(!$scope.activeTab.leftCategory) {
                    var allCategories = $scope.getOrderTemplate($scope.activeTab.name).setMembers;
                    if (allCategories.length > 0)$scope.showLeftCategoryTests(allCategories[0]);
                }
            };

            $scope.showLeftCategoryTests = function(leftCategory) {
                collapseExistingActiveSection($scope.activeTab.leftCategory);
                $scope.activeTab.leftCategory = leftCategory;
                $scope.activeTab.leftCategory.klass = "active";

                $scope.activeTab.leftCategory.groups = $scope.getConceptClassesInSet(leftCategory);
            };

            $scope.diSelect = function(selectedOrder) {
                var order = _.find($scope.consultation.testOrders, function(order) {
                    return order.concept.uuid === selectedOrder.concept.uuid;
                });

                if (order.uuid) {
                    order.voided = !order.voided;
                }
                else {
                    removeOrder(order);
                }
            };

            $scope.openNotesPopup = function(order) {
                order.previousNote = order.commentToFulfiller;
                $scope.orderNoteText = order.previousNote;
                $scope.dialog = ngDialog.open({ template: 'consultation/views/orderNotes.html', className: 'selectedOrderNoteContainer-dialog ngdialog-theme-default', data: order, scope: $scope});
            };

            $scope.setEditedFlag = function(order, orderNoteText){
               if(order.previousNote != orderNoteText){
                   order.commentToFulfiller = orderNoteText;
                   order.hasBeenModified = true;
               }
                $scope.closePopup();
            };

            $scope.closePopup = function(){
                ngDialog.close();
            };

            $scope.getName = function (sample) {
                var name = _.find(sample.names, {conceptNameType: "SHORT"}) || _.find(sample.names, {conceptNameType: "FULLY_SPECIFIED"});
                return name ? name.name : undefined;
            };

            var removeOrder = function(order){
                _.remove($scope.consultation.testOrders, function(o){
                    return o.concept.uuid == order.concept.uuid;
                });
            };

            init();

        }]);