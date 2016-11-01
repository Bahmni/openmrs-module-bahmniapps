'use strict';

Bahmni.Clinical.DrugOrder.Util = {
    mergeContinuousTreatments: function (continuousDrugOrders) {
        var sortedDrugOrders = _.sortBy(continuousDrugOrders, 'effectiveStartDate');
        var drugOrders = [];
        sortedDrugOrders.forEach(function (drugOrder) {
            drugOrder.span = {};

            var areValuesEqual = function (value1, value2) {
                if (typeof value1 === "boolean" && typeof value2 === "boolean") {
                    return value1 === value2;
                }
                return value1 === value2 || (_.isEmpty(value1) && _.isEmpty(value2));
            };

            var foundDrugOrder = _.find(drugOrders, function (existingOrder) {
                return areValuesEqual(existingOrder.drugNonCoded, drugOrder.drugNonCoded) &&
                    (existingOrder.drug && drugOrder.drug &&
                    areValuesEqual(existingOrder.drug.uuid, drugOrder.drug.uuid)) &&
                    areValuesEqual(existingOrder.instructions, drugOrder.instructions) &&
                    areValuesEqual(existingOrder.getDoseInformation(), drugOrder.getDoseInformation()) &&
                    areValuesEqual(existingOrder.route, drugOrder.route) &&
                    areValuesEqual(existingOrder.additionalInstructions, drugOrder.additionalInstructions) &&
                    areValuesEqual(existingOrder.asNeeded, drugOrder.asNeeded) &&
                    areValuesEqual(existingOrder.isDiscontinuedOrStopped(), drugOrder.isDiscontinuedOrStopped()) &&
                    Bahmni.Common.Util.DateUtil.diffInDaysRegardlessOfTime(new Date(existingOrder.lastStopDate), new Date(drugOrder.scheduledDate)) <= 1;
            });

            if (foundDrugOrder) {
                if (foundDrugOrder.span.hasOwnProperty(drugOrder.durationUnit)) {
                    foundDrugOrder.span[drugOrder.durationUnit] += drugOrder.duration;
                } else {
                    foundDrugOrder.span[drugOrder.durationUnit] = drugOrder.duration;
                }
                foundDrugOrder.lastStopDate = drugOrder.effectiveStopDate;
            } else {
                drugOrder.span[drugOrder.durationUnit] = drugOrder.duration;
                drugOrder.lastStopDate = drugOrder.effectiveStopDate;
                drugOrders.push(drugOrder);
            }
        });
        return drugOrders;
    },
    sortDrugOrders: function (activeAndScheduledDrugOrders) {
        var descendingOrderFactor = -1;
        return Bahmni.Clinical.DrugOrder.Util.sortOrders(activeAndScheduledDrugOrders, descendingOrderFactor);
    },
    sortDrugOrdersInChronologicalOrder: function (activeAndScheduledDrugOrders) {
        var ascendingOrderFactor = 1;
        return Bahmni.Clinical.DrugOrder.Util.sortOrders(activeAndScheduledDrugOrders, ascendingOrderFactor);
    },
    sortOrders: function (drugOrders, sortOrderFactor) {
        if (_.isEmpty(drugOrders)) {
            return [];
        }
        var DateUtil = Bahmni.Common.Util.DateUtil;
        return drugOrders.sort(function (drug1, drug2) {
            var timeDifference = DateUtil.diffInSeconds(drug1.effectiveStartDate, drug2.effectiveStartDate);
            if (DateUtil.isSameDate(drug1.effectiveStartDate, drug2.effectiveStartDate)) {
                return (timeDifference === 0) ? (drug1.orderNumber - drug2.orderNumber) : timeDifference; // Ascending order
            } else {
                return timeDifference * sortOrderFactor;
            }
        });
    }
};
