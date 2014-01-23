Bahmni.Opd.Consultation.VisitSummary = function (visitStartDateTime, mostRecentEncounterDateTime, diagnoses, dispositions, encounterTransactions, labTestOrderObsMap) {
    this.visitStartDateTime = visitStartDateTime;
    this.mostRecentEncounterDateTime = mostRecentEncounterDateTime;
    this.diagnoses = diagnoses;
    this.dispositions = dispositions;
    this.labTestOrderObsMap = labTestOrderObsMap;
    this.encounterTransactions = encounterTransactions;
};

Bahmni.Opd.Consultation.VisitSummary.prototype = {
    isConfirmedDiagnosis: function (certainity) {
        return certainity === 'CONFIRMED';
    },

    isPrimaryOrder: function (order) {
        return order === 'PRIMARY';
    },

    hasDiagnosis: function () {
        return this.diagnoses.length > 0;
    },

    hasDisposition: function () {
        return this.dispositions.length > 0;
    },

    hasEncounters: function () {
        return this.encounterTransactions.length > 0;
    },

    hasLabTests: function () {
        return this.labTestOrderObsMap.length > 0;
    },

    numberOfDosageDaysForDrugOrder: function (drugOrder) {
        return Bahmni.Common.Util.DateUtil.diffInDays(new Date(drugOrder.endDate), new Date(drugOrder.startDate));
    }
}

Bahmni.Opd.Consultation.VisitSummary.create = function (encounterTransactions, orderTypes) {
    var diagnoses = [];
    var dispositions = [];
    var visitStartDateTime;
    var mostRecentEncounterDateTime;
    var labTestOrderObsMap = [];


    var labTestOrderTypeUuid = orderTypes[Bahmni.Opd.Consultation.Constants.labOrderType];

    var mapTestOrderWithObs = function (testOrder) {
        var obs = [];
        angular.forEach(encounterTransactions, function (encounterTransaction) {
            getObservationForOrderIfExist(encounterTransaction.observations, testOrder, obs);
        });
        labTestOrderObsMap.push({"testOrder": testOrder, "observations": obs});
    }

    var getObservationForOrderIfExist = function (observations, testOrder, obs) {
         angular.forEach(observations, function (observation) {
            if (testOrder.uuid === observation.orderUuid) {
                obs.push(observation);
            } else if (observation.orderUuid == null && observation.groupMembers.length > 0) {
                 getObservationForOrderIfExist(observation.groupMembers, testOrder, obs);
            }
        });
    }

    angular.forEach(encounterTransactions, function (encounterTransaction) {
        angular.forEach(encounterTransaction.testOrders, function (testOrder) {
            if (!testOrder.voided) {
                testOrder.provider = encounterTransaction.providers[0];
                if (testOrder.orderTypeUuid === labTestOrderTypeUuid) {
                    mapTestOrderWithObs(testOrder);
                }
            }
        });
    });


    if (encounterTransactions.length > 0) {
        var encountersInAscendingOrder = encounterTransactions.slice(0).sort(function (e1, e2) {
            return e1.encounterDateTime > e2.encounterDateTime;
        })
        var mostRecentEncounter = encountersInAscendingOrder[encountersInAscendingOrder.length - 1];
        var firstEncounter = encountersInAscendingOrder[0];
        visitStartDateTime = new Date(firstEncounter.encounterDateTime);
        mostRecentEncounterDateTime = new Date(mostRecentEncounter.encounterDateTime);


        angular.forEach(encounterTransactions, function (encounterTransaction) {
            angular.forEach(encounterTransaction.diagnoses, function (diagnosis) {
                diagnosis.provider = encounterTransaction.providers[0];
                diagnoses.push(diagnosis);
            });
        });

        angular.forEach(encounterTransactions, function (encounterTransaction) {
            if (encounterTransaction.disposition) {
                encounterTransaction.disposition.provider = encounterTransaction.providers[0];
                dispositions.push(encounterTransaction.disposition);
            }
        });


    }

    return new this(visitStartDateTime, mostRecentEncounterDateTime, diagnoses, dispositions, encounterTransactions, labTestOrderObsMap);
}