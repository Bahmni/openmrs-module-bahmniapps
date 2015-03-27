Bahmni.Clinical.DrugOrder.Util = {
    mergeContinuousTreatments: function(continuousDrugOrders){
        var sortedDrugOrders = _.sortBy(continuousDrugOrders, 'effectiveStartDate');
        var drugOrders = [];
        sortedDrugOrders.forEach(function (drugOrder) {
            drugOrder.span = {};
            var foundDrugOrder = _.find(drugOrders, function (existingOrder) {
                return existingOrder.drug.uuid == drugOrder.drug.uuid
                    && existingOrder.instructions == drugOrder.instructions
                    && existingOrder.getDoseInformation() == drugOrder.getDoseInformation()
                    && existingOrder.route == drugOrder.route
                    && existingOrder.isDiscontinuedOrStopped() == drugOrder.isDiscontinuedOrStopped()
                    && Bahmni.Common.Util.DateUtil.diffInDaysRegardlessOfTime(new Date(existingOrder.lastStopDate), new Date(drugOrder.scheduledDate)) <= 1
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
    }
};