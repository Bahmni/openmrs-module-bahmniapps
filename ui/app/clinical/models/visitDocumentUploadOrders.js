'use strict';

Bahmni.Clinical.VisitDocumentUploadOrders = (function () {



    var VisitDocumentUploadOrders = function (orders) {
        this.orders = orders;
    };

    VisitDocumentUploadOrders.prototype = {
    };



    var getDocumentUploadEncounters = function (encounterTransactions, encounterTypeUuid, documentUploadOrders) {
        encounterTransactions.forEach(function (encounterTransaction) {
            if (encounterTransaction.encounterTypeUuid == encounterTypeUuid) {
                encounterTransaction.observations.forEach(function (observation) {
                    observation.groupMembers.forEach(function (member) {
                        if (member.concept.name === Bahmni.Common.Constants.documentsConceptName) {
                            documentUploadOrders.push({imageObservation: member, concept: observation.concept, dateTime: observation.observationDateTime, provider: encounterTransaction.providers[0]});
                        }
                    });
                });
            }
        });
    };

    VisitDocumentUploadOrders.create = function (encounterTransactions, encounterTypeUuid) {
        var documentUploadOrders = [];
        getDocumentUploadEncounters(encounterTransactions, encounterTypeUuid, documentUploadOrders);
        return new this(documentUploadOrders);
    };


    return VisitDocumentUploadOrders;
})();