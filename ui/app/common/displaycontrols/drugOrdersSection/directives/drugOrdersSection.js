'use strict';

angular.module('bahmni.common.displaycontrol.drugOrdersSection')
    .directive('drugOrdersSection', ['TreatmentService', 'spinner', '$rootScope',
        function (treatmentService, spinner, $rootScope) {
        var controller = function ($scope) {
            var DateUtil = Bahmni.Common.Util.DateUtil;

            $scope.toggle = true;
            $scope.toggleDisplay = function () {
                $scope.toggle = ! $scope.toggle
            };

            var treatmentConfigColumnHeaders = $scope.config.columnHeaders;
            $scope.columnHeaders = {
                "drugName": (treatmentConfigColumnHeaders && treatmentConfigColumnHeaders.drugName) || "DRUG_DETAILS_DRUG_NAME",
                "dosage": (treatmentConfigColumnHeaders && treatmentConfigColumnHeaders.dosage) || "DRUG_DETAILS_DOSE_INFO",
                "route": (treatmentConfigColumnHeaders && treatmentConfigColumnHeaders.route) || "DRUG_DETAILS_ROUTE",
                "duration": (treatmentConfigColumnHeaders && treatmentConfigColumnHeaders.duration) || "DRUG_DETAILS_DURATION",
                "frequency": (treatmentConfigColumnHeaders && treatmentConfigColumnHeaders.frequency) || "DRUG_DETAILS_FREQUENCY",
                "startDate": (treatmentConfigColumnHeaders && treatmentConfigColumnHeaders.startDate) || "DRUG_DETAILS_START_DATE",
                "stopDate": (treatmentConfigColumnHeaders && treatmentConfigColumnHeaders.stopDate) || "DRUG_DETAILS_STOP_DATE",
                "stopReason": (treatmentConfigColumnHeaders && treatmentConfigColumnHeaders.stopReason) || "DRUG_DETAILS_ORDER_REASON_CODED",
                "instructions": (treatmentConfigColumnHeaders && treatmentConfigColumnHeaders.instructions) || "DRUG_DETAILS_INSTRUCTIONS_TEXT",
                "quantity": (treatmentConfigColumnHeaders && treatmentConfigColumnHeaders.quantity) || "DRUG_DETAILS_QUANTITY_TEXT"
            };

            $scope.scheduledDate = DateUtil.getDateWithoutTime(DateUtil.now());

            var initialiseColumns = function() {
                var mandatoryColumns = ["drugName", "dosage", "startDate"];
                var defaultColumns = ["frequency", "route"];

                if (_.isEmpty($scope.config.columns)) {
                    $scope.columns = _.union(mandatoryColumns, defaultColumns);
                } else {
                    $scope.columns = _.union($scope.config.columns, mandatoryColumns);
                }
            };

            var init = function () {
                initialiseColumns();
                if (_.isEmpty($scope.config.title) && _.isEmpty($scope.config.translationKey)){
                    $scope.config.title = "Drug Orders";
                }
                if (_.isArray($scope.drugOrders)) {
                    $scope.isDrugOrderSet = true;
                    return ;
                }
                return treatmentService.getAllDrugOrdersFor($scope.patientUuid, $scope.config.includeConceptSet, $scope.config.excludeConceptSet, $scope.config.active, $scope.enrollment).then(function (drugOrderResponse) {
                    var createDrugOrder = function (drugOrder) {
                        return Bahmni.Clinical.DrugOrderViewModel.createFromContract(drugOrder, $scope.treatmentConfig);
                    };
                    $scope.drugOrders = sortOrders(drugOrderResponse.map(createDrugOrder));
                    $scope.stoppedOrderReasons = $scope.treatmentConfig.stoppedOrderReasonConcepts;
                });
            };

            var sortOrders = function(drugOrders){
                var drugOrderUtil = Bahmni.Clinical.DrugOrder.Util;
                var sortedDrugOrders = [];
                sortedDrugOrders.push(drugOrderUtil.sortDrugOrdersInChronologicalOrder(drugOrders));
                return _.flatten(sortedDrugOrders)
            };

            var clearOtherDrugOrderActions = function(revisedDrugOrder) {
                $scope.drugOrders.forEach(function (drugOrder) {
                    if(drugOrder != revisedDrugOrder) {
                        drugOrder.isDiscontinuedAllowed = true;
                        drugOrder.isBeingEdited = false;
                    }
                });
            };

            $scope.$on("event:reviseDrugOrder", function (event, drugOrder) {
                clearOtherDrugOrderActions(drugOrder);
            });

            $scope.refill = function (drugOrder) {
                $rootScope.$broadcast("event:refillDrugOrder", drugOrder);
            };

            $scope.remove = function (drugOrder) {
                var promise = treatmentService.voidDrugOrder(drugOrder);

                spinner.forPromise(promise);

                promise.then(function() {
                    $rootScope.$broadcast("event:sectionUpdated");
                });
            };

            $scope.$on("event:sectionUpdated", function () {
                init();
            });

            $scope.revise = function (drugOrder, drugOrders) {
                if (drugOrder.isEditAllowed) {
                    $rootScope.$broadcast("event:reviseDrugOrder", drugOrder, drugOrders);
                }
            };
            $scope.checkConflictingDrug = function(drugOrder) {
                $rootScope.$broadcast("event:includeOrderSetDrugOrder", drugOrder);
            };
            $scope.edit = function (drugOrder) {
                var index = _.indexOf($scope.drugOrders,drugOrder);
                $rootScope.$broadcast("event:editDrugOrder", drugOrder, index);
            };

            $scope.toggleShowAdditionalInstructions = function (line) {
                line.showAdditionalInstructions = !line.showAdditionalInstructions;
            };

            $scope.discontinue = function (drugOrder) {
                if (drugOrder.isDiscontinuedAllowed) {
                    $rootScope.$broadcast("event:discontinueDrugOrder", drugOrder);
                    $scope.updateFormConditions(drugOrder);
                }
            };

            $scope.undoDiscontinue = function (drugOrder) {
                $rootScope.$broadcast("event:undoDiscontinueDrugOrder", drugOrder);
            };

            $scope.getMinDateForDiscontinue = function(drugOrder) {
                var minDate = DateUtil.today();
                if(DateUtil.isBeforeDate(drugOrder.effectiveStartDate, minDate)) {
                    minDate = drugOrder.effectiveStartDate;
                }
                return DateUtil.getDateWithoutTime(minDate);
            };

            $scope.updateFormConditions = function(drugOrder){
                var formCondition = Bahmni.ConceptSet.FormConditions.rules ? Bahmni.ConceptSet.FormConditions.rules["Medication Stop Reason"] : undefined ;
                if(formCondition){
                    if(drugOrder.orderReasonConcept) {
                        if (!formCondition(drugOrder, drugOrder.orderReasonConcept.name.name)) {
                            disableAndClearReasonText(drugOrder);
                        }
                    }
                    else {
                        disableAndClearReasonText(drugOrder);
                    }
                }else{
                    drugOrder.orderReasonNotesEnabled = true;
                }
            };

            var disableAndClearReasonText = function(drugOrder){
                drugOrder.orderReasonText = null;
                drugOrder.orderReasonNotesEnabled = false;
            };


            var promise = init();
            if(promise){
                spinner.forPromise(promise);
            }
        };
        return {
            restrict: 'E',
            controller: controller,
            scope: {
                config: "=",
                patientUuid: "=",
                treatmentConfig: "=",
                enrollment: "=",
                drugOrders:"=?"
            },
            templateUrl: "../common/displaycontrols/drugOrdersSection/views/drugOrdersSection.html"
        };
    }]);
