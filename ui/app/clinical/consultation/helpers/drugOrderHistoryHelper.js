'use strict';

angular.module('bahmni.clinical')
    .service('drugOrderHistoryHelper', [function () {
        this.getInactiveDrugsFromPastVisit = function (activeAndScheduledDrugs, previousVisitDrugs) {
            var inactivePreviousVisitDrugs = [];
            _.each(previousVisitDrugs, function (previousVisitDrug) {
                var presentInActiveAndScheduledDrugs = _.find(activeAndScheduledDrugs, function (activeAndScheduledDrug) {
                    if (activeAndScheduledDrug.drug && previousVisitDrug.drug) {
                        return activeAndScheduledDrug.drug.uuid === previousVisitDrug.drug.uuid;
                    } else if (activeAndScheduledDrug.drugNonCoded && previousVisitDrug.drugNonCoded) {
                        return activeAndScheduledDrug.drugNonCoded === previousVisitDrug.drugNonCoded;
                    }
                    return false;
                });
                if (!presentInActiveAndScheduledDrugs) {
                    inactivePreviousVisitDrugs.push(previousVisitDrug);
                }
            });
            return inactivePreviousVisitDrugs;
        };

        this.getRefillableDrugOrders = function (activeAndScheduledDrugOrders, previousVisitDrugOrders, showOnlyActive) {
            var drugOrderUtil = Bahmni.Clinical.DrugOrder.Util;
            var now = new Date();
            var partitionedDrugOrders = _.groupBy(activeAndScheduledDrugOrders, function (drugOrder) {
                return (drugOrder.effectiveStartDate > now) ? "scheduled" : "active";
            });
            var sortedDrugOrders = [];

            sortedDrugOrders.push(drugOrderUtil.sortDrugOrders(partitionedDrugOrders.scheduled));
            sortedDrugOrders.push(drugOrderUtil.sortDrugOrders(partitionedDrugOrders.active));
            if (!showOnlyActive) {
                sortedDrugOrders.push(drugOrderUtil.sortDrugOrders(this.getInactiveDrugsFromPastVisit(activeAndScheduledDrugOrders, previousVisitDrugOrders)));
            }
            return _.flatten(sortedDrugOrders);
        };
    }]);
