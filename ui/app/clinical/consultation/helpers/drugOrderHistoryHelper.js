'use strict';

angular.module('bahmni.clinical')
    .service('drugOrderHistoryHelper', [function () {

        this.getInactiveDrugsFromPastVisit = function (activeAndScheduledDrugs, previousVisitDrugs) {
            var inactivePreviousVisitDrugs = [];
            _.each(previousVisitDrugs, function (previousVisitDrug) {
                var presentInActiveAndScheduledDrugs = _.find(activeAndScheduledDrugs, function (activeAndScheduledDrug) {
                    return activeAndScheduledDrug.drug.uuid == previousVisitDrug.drug.uuid;
                });
                if (!presentInActiveAndScheduledDrugs) {
                    inactivePreviousVisitDrugs.push(previousVisitDrug);
                }
            });
            return inactivePreviousVisitDrugs;
        };

        this.getRefillableDrugOrders = function (activeAndScheduledDrugOrders, previousVisitDrugOrders) {
            var drugOrderUtil = Bahmni.Clinical.DrugOrder.Util;
            var now = new Date();
            var partitionedDrugOrders = _.groupBy(activeAndScheduledDrugOrders, function (drug) {
                return (drug.effectiveStartDate > now) ? "scheduled" : "active";
            });
            var sortedDrugs = [];

            sortedDrugs.push(drugOrderUtil.sortDrugs(partitionedDrugOrders.scheduled));
            sortedDrugs.push(drugOrderUtil.sortDrugs(partitionedDrugOrders.active));
            sortedDrugs.push(drugOrderUtil.sortDrugs(this.getInactiveDrugsFromPastVisit(activeAndScheduledDrugOrders, previousVisitDrugOrders)));
            return _.flatten(sortedDrugs);
        };

    }]);
