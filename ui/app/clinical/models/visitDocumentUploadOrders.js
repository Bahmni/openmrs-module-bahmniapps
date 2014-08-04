'use strict';

Bahmni.Clinical.VisitDocumentUploadOrders = (function () {

    var VisitDocumentUploadOrders = function (orders) {
        this.orders = orders;
    };

    VisitDocumentUploadOrders.prototype = {
    };

    var getDocumentUploadOrders = function (encounterTransactions, encounterTypeUuid) {
        var documentUploadObservations = [];
        encounterTransactions.forEach(function (encounterTransaction) {
            if (encounterTransaction.encounterTypeUuid == encounterTypeUuid) {
                encounterTransaction.observations.forEach(function (observation) {
                    observation.groupMembers.forEach(function (member) {
                        if (member.concept.name === Bahmni.Common.Constants.documentsConceptName) {
                            var imageObservation = new Bahmni.Clinical.ImageObservation(member, observation.concept, encounterTransaction.providers[0]);
                            documentUploadObservations.push(imageObservation);
                        }
                    });
                });
            }
        });
        return documentUploadObservations;
    };

    VisitDocumentUploadOrders.create = function (encounterTransactions, encounterTypeUuid) {
        var documentUploadOrders = getDocumentUploadOrders(encounterTransactions, encounterTypeUuid);
        return new this(documentUploadOrders);
    };

    return VisitDocumentUploadOrders;
})();