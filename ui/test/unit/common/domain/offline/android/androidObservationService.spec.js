'use strict';

describe('androidObservationService', function () {

    var observationsServiceStrategy, androidDbService;
    var $q = Q;

    beforeEach(module('bahmni.common.domain'));
    beforeEach(module('bahmni.common.offline'));

    beforeEach(module(function ($provide) {
        $provide.value('$q', $q);
    }));

    beforeEach(inject(['observationsServiceStrategy', 'androidDbService', function (observationsServiceStrategyInjected, androidDbServiceInjected) {
        observationsServiceStrategy = observationsServiceStrategyInjected;
        androidDbService = androidDbServiceInjected;
    }]));


    it('should return no visitUuids and Observations, if no observation data recorded against given patient', function (done) {
        var params = { patientUuid : 'fc6ede09-f16f-4877-d2f5-ed8b2182ec11', numberOfVisits : 3, scope : undefined, patientProgramUuid : undefined };
        var paramsWithVisitUuids = { patientUuid : 'fc6ede09-f16f-4877-d2f5-ed8b2182ec11', numberOfVisits : 3, scope : undefined, patientProgramUuid : undefined };
        paramsWithVisitUuids.visitUuids = [];

        var visitUuids = [];

        var obsData = [];

        spyOn(androidDbService, 'getVisitsByPatientUuid').and.returnValue(specUtil.respondWithPromise($q, visitUuids));
        spyOn(androidDbService, 'getObservationsFor').and.returnValue(specUtil.respondWithPromise($q, obsData));
        observationsServiceStrategy.fetch(params.patientUuid, params.numberOfVisits, params).then(function (response) {
            expect(androidDbService.getVisitsByPatientUuid).toHaveBeenCalledWith(params.patientUuid, params.numberOfVisits);
            expect(androidDbService.getObservationsFor).toHaveBeenCalledWith(paramsWithVisitUuids);
            expect(response.data.length).toBe(0);
            expect(response).toEqual({"data": []});
            done();
        });
    });

    it('should get empty array as visitUuids for given patientUuid and then get the observations called with empty array for visit uuids', function (done) {
        var params = { patientUuid : 'fc6ede09-f16f-4877-d2f5-ed8b2182ec11', numberOfVisits : 3, scope : undefined, patientProgramUuid : undefined };
        var paramsWithVisitUuids = { patientUuid : 'fc6ede09-f16f-4877-d2f5-ed8b2182ec11', numberOfVisits : 3, scope : undefined, patientProgramUuid : undefined };
        paramsWithVisitUuids.visitUuids = [];

        var visitUuids = [];

        var obsData = [
            {"observation": {name: "child health", type: "Field"}},
        ];

        spyOn(androidDbService, 'getVisitsByPatientUuid').and.returnValue(specUtil.respondWithPromise($q, visitUuids));
        spyOn(androidDbService, 'getObservationsFor').and.returnValue(specUtil.respondWithPromise($q, obsData));
        observationsServiceStrategy.fetch(params.patientUuid, params.numberOfVisits, params).then(function (response) {
            expect(androidDbService.getVisitsByPatientUuid).toHaveBeenCalledWith(params.patientUuid, params.numberOfVisits);
            expect(androidDbService.getObservationsFor).toHaveBeenCalledWith(paramsWithVisitUuids);
            expect(response.data.length).toBe(1);
            expect(response).toEqual({"data": [{"name": "child health", type: "Field"}]});
            done();
        });
    });


    it('should get empty array as observations, if data is not recorded in corresponding visits', function (done) {
        var params = { patientUuid : 'fc6ede09-f16f-4877-d2f5-ed8b2182ec11', numberOfVisits : 3, scope : undefined, patientProgramUuid : undefined };
        var paramsWithVisitUuids = { patientUuid : 'fc6ede09-f16f-4877-d2f5-ed8b2182ec11', numberOfVisits : 3, scope : undefined, patientProgramUuid : undefined };
        var visitUuids = [
            {uuid: "fc6ede09-f16f-4877-d2f5-ed8b21811111"},
            {uuid: "fc6ede09-f16f-4877-d2f5-ed8b21822222"},
            {uuid: "fc6ede09-f16f-4877-d2f5-ed8b21833333"}
        ];

        paramsWithVisitUuids.visitUuids = _.map(visitUuids, function (visitUuid) {
            return visitUuid.uuid;
        });

        var obsData = [];

        spyOn(androidDbService, 'getVisitsByPatientUuid').and.returnValue(specUtil.respondWithPromise($q, visitUuids));
        spyOn(androidDbService, 'getObservationsFor').and.returnValue(specUtil.respondWithPromise($q, obsData));
        observationsServiceStrategy.fetch(params.patientUuid, params.numberOfVisits, params).then(function (response) {
            expect(androidDbService.getVisitsByPatientUuid).toHaveBeenCalledWith(params.patientUuid, params.numberOfVisits);
            expect(androidDbService.getObservationsFor).toHaveBeenCalledWith(paramsWithVisitUuids);
            expect(response.data.length).toBe(0);
            expect(response).toEqual({"data": []});
            done();
        });
    });

    it('should get visitUuids for given patientUuid and number of visits and then get the observations recorded in respective visits', function (done) {
        var params = { patientUuid : 'fc6ede09-f16f-4877-d2f5-ed8b2182ec11', numberOfVisits : 3, scope : undefined, patientProgramUuid : undefined };
        var paramsWithVisitUuids = { patientUuid : 'fc6ede09-f16f-4877-d2f5-ed8b2182ec11', numberOfVisits : 3, scope : undefined, patientProgramUuid : undefined };
        var visitUuids = [
            {uuid: "fc6ede09-f16f-4877-d2f5-ed8b21811111"},
            {uuid: "fc6ede09-f16f-4877-d2f5-ed8b21822222"},
            {uuid: "fc6ede09-f16f-4877-d2f5-ed8b21833333"}
        ];

        paramsWithVisitUuids.visitUuids = _.map(visitUuids, function (visitUuid) {
            return visitUuid.uuid;
        });

        var obsData = [
            {observation: {"name": "child health", type: "Field"}},
            {observation: {"name": "Immunization"}}
        ];

        spyOn(androidDbService, 'getVisitsByPatientUuid').and.returnValue(specUtil.respondWithPromise($q, visitUuids));
        spyOn(androidDbService, 'getObservationsFor').and.returnValue(specUtil.respondWithPromise($q, obsData));
        observationsServiceStrategy.fetch(params.patientUuid, params.numberOfVisits, params).then(function (response) {
            expect(androidDbService.getVisitsByPatientUuid).toHaveBeenCalledWith(params.patientUuid, params.numberOfVisits);
            expect(androidDbService.getObservationsFor).toHaveBeenCalledWith(paramsWithVisitUuids);
            expect(response.data.length).toBe(2);
            expect(response).toEqual({data: [{name: "child health", type: "Field"}, {"name": "Immunization"}]});
            done();
        });
    });

    it("should getAllParentsInHierarchy for a given child conceptName", function(done){
        var conceptName = "Oral antibiotics given";
        var response = ["Child Health", "Pneumonia Information", "Oral antibiotics given"];
        spyOn(androidDbService, 'getAllParentsInHierarchy').and.returnValue(specUtil.respondWithPromise($q, response));
        observationsServiceStrategy.getAllParentsInHierarchy(conceptName).then(function (response) {
            expect(androidDbService.getAllParentsInHierarchy).toHaveBeenCalledWith(conceptName);
            expect(response.data.length).toBe(3);
            expect(response.data).toEqual(["Child Health", "Pneumonia Information", "Oral antibiotics given"]);
            done();
        })
    });

     it("should fetch observations for a visit", function (done) {
        var obsData = [
            {observation: {"name": "child health", type: "Field", visitUuid: "visitUuid"}},
            {observation: {"name": "Immunization", visitUuid: "visitUuid"}}
        ];

        var visitUuid = "visitUuid";
        var params = {visitUuid: visitUuid};

        spyOn(androidDbService, 'getObservationsForVisit').and.returnValue(specUtil.respondWithPromise($q, obsData));
        observationsServiceStrategy.fetchObsForVisit(params).then(function (response) {
            expect(androidDbService.getObservationsForVisit).toHaveBeenCalledWith(visitUuid);
            expect(response.data.length).toBe(2);
            expect(response.data[0].visitUuid).toEqual(visitUuid);
            done();
        });
    });
});
