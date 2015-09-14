'use strict';

angular.module('bahmni.clinical')
    .controller('OrderController', ['$scope', 'allOrderables','ngDialog','retrospectiveEntryService',
        function ($scope, allOrderables, ngDialog,retrospectiveEntryService) {
            $scope.consultation.orders = $scope.consultation.orders || [];
            $scope.consultation.childOrders = $scope.consultation.childOrders || [];
            $scope.allOrdersTemplates = allOrderables;

            var testConceptToParentsMapping = {}; //A child concept could be part of multiple parent panels

            var init = function(){
                $scope.tabs = [];
                _.forEach($scope.allOrdersTemplates, function(item){
                    var conceptName = $scope.getName(item);
                    $scope.tabs.push({name: conceptName ? conceptName : item.name.name, topLevelConcept: item.name.name});
                });
                if($scope.tabs) {
                    $scope.activateTab($scope.tabs[0]);
                    initTestConceptToParentsMapping();
                }
            };

            $scope.isRetrospectiveMode = function(){
                return retrospectiveEntryService.getRetrospectiveEntry().isRetrospective;
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

            $scope.updateSelectedOrdersForActiveTab = function(){
                var activeTabTestConcepts = _.pluck(_.flatten(_.pluck($scope.getOrderTemplate($scope.activeTab.name).setMembers, 'setMembers')), 'uuid');
                $scope.selectedOrders =  _.filter($scope.consultation.orders,function(testOrder){
                    return _.indexOf(activeTabTestConcepts, testOrder.concept.uuid) != -1;
                });
            };

            $scope.getOrderTemplate = function(templateName) {
                var key = '\''+templateName+'\'';
                return $scope.allOrdersTemplates[key];
            };

            $scope.showLeftCategoryTests = function(leftCategory) {
                collapseExistingActiveSection($scope.activeTab.leftCategory);
                $scope.activeTab.leftCategory = leftCategory;
                $scope.activeTab.leftCategory.klass = "active";

                $scope.activeTab.leftCategory.groups = $scope.getConceptClassesInSet(leftCategory);
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

            $scope.$watchCollection('consultation.orders', $scope.updateSelectedOrdersForActiveTab);

            $scope.handleOrderClick = function(order) {
                var test = findTest(order.concept.uuid);
                $scope.toggleOrderSelection(test);
            };

            $scope.toggleOrderSelection = function (test) {
                var orderPresent = $scope.isActiveOrderPresent(test);
                if (!orderPresent) {
                    createOrder(test);
                    _.each(test.setMembers, function (child) {
                        removeOrder(child.uuid);
                    });
                } else {
                    removeOrder(test.uuid);
                }
            };

            $scope.isActiveOrderPresent = function (test) {
                var validOrders = _.filter($scope.consultation.orders, function (testOrder) {
                    return !testOrder.isDiscontinued;
                });
                return _.find(validOrders, function (order) {
                    return (order.concept.uuid == test.uuid) || _.contains(testConceptToParentsMapping[test.uuid], order.concept.uuid);
                });
            };

            $scope.isOrderNotEditable = function(order) {
                var test = findTest(order.concept.uuid);
                return $scope.isTestIndirectlyPresent(test);
            };

            $scope.isTestIndirectlyPresent = function (test) {
                var validOrders = _.filter($scope.consultation.orders, function (testOrder) {
                    return !testOrder.isDiscontinued;
                });
                return _.find(validOrders, function (order) {
                    return _.contains(testConceptToParentsMapping[test.uuid], order.concept.uuid);
                });
            };

            $scope.openNotesPopup = function(order) {
                order.previousNote = order.commentToFulfiller;
                $scope.orderNoteText = order.previousNote;
                $scope.dialog = ngDialog.open({ template: 'consultation/views/orderNotes.html', className: 'selectedOrderNoteContainer-dialog ngdialog-theme-default', data: order, scope: $scope
                });
            };

            $scope.$on('ngDialog.opened', function (e, $dialog) {
                $('body').addClass('show-controller-back');
            });

            $scope.$on('ngDialog.closed', function (e, $dialog) {
                $('body').removeClass('show-controller-back');
            });


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

            var collapseExistingActiveSection = function(section){
                section && (section.klass="");
            };

            var showFirstLeftCategoryByDefault = function(){
                if(!$scope.activeTab.leftCategory) {
                    var allLeftCategories = $scope.getOrderTemplate($scope.activeTab.name).setMembers;
                    if (allLeftCategories.length > 0)
                        $scope.showLeftCategoryTests(allLeftCategories[0]);
                }
            };

            var findTest = function(testUuid) {
                var test = undefined;
                var allLeftCategories = $scope.getOrderTemplate($scope.activeTab.name).setMembers;
                _.each(allLeftCategories, function(leftCategory) {
                    var foundTest = _.find(leftCategory.setMembers, function(test) {
                        return test.uuid === testUuid;
                    });
                    if(foundTest) {
                        test = foundTest;
                        return;
                    }
                });
                return test;
            };

            var removeOrder = function (testUuid) {
                var order = _.find($scope.consultation.orders, function (order) {
                    return order.concept.uuid == testUuid;
                });
                if (order) {
                    if (order.uuid) {
                        order.isDiscontinued = true;
                    } else {
                        _.remove($scope.consultation.orders, order);
                    }
                }
            };

            var createOrder = function (test) {
                var discontinuedOrder = _.find($scope.consultation.orders, function(order) {
                    return (test.uuid == order.concept.uuid) && order.isDiscontinued;
                });
                if(discontinuedOrder) {
                    discontinuedOrder.isDiscontinued = false;
                } else {
                    var createdOrder = Bahmni.Clinical.Order.create(test);
                    $scope.consultation.orders.push(createdOrder);
                }
            };

            var initTestConceptToParentsMapping = function () {
                var allLeftCategories = $scope.getOrderTemplate($scope.activeTab.name).setMembers;
                _.each(allLeftCategories, function(leftCategory) {
                    _.each(leftCategory.setMembers, function (member) {
                        if (member.setMembers.length != 0) {
                            _.each(member.setMembers, function (child) {
                                if (testConceptToParentsMapping[child.uuid] === undefined) {
                                    testConceptToParentsMapping[child.uuid] = [];
                                }
                                testConceptToParentsMapping[child.uuid].push(member.uuid);
                            })
                        }
                    });
                });
            };

            init();

        }]);