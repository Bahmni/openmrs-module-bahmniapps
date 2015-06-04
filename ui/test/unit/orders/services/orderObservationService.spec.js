'use strict';

describe('Order Service', function () {
    var orderObservationService;
    var mockEncounterService = jasmine.createSpyObj('encounterService', ['create']);
    mockEncounterService.create.and.callFake(function(param) {
        return specUtil.respondWith("success");
    });

    var orders = [{
        bahmniObservations : [
            {uuid : "observation1 uuuid", value: "33.0", valueAsString: "33.0"},
            {uuid : "observation2 uuuid", value: "100.0", valueAsString: "100.0"},
            {uuid : "observation3 uuuid", value: null, valueAsString: null},
            {value: null, valueAsString: null}
        ],
        orderUuid : "orderUuid"
    }];

    var patient = {uuid:"patientUuid"};
    var locationUuid = "locationUuid"

    beforeEach(function () {
        module('bahmni.common.orders');
        module(function ($provide) {
            $provide.value('encounterService', mockEncounterService);
        });
        inject(['orderObservationService', function (serviceInjected) {
            orderObservationService = serviceInjected;
        }]);
    });

    it('should add order uuid to observations', function (done) {
        orderObservationService.save(orders, patient, locationUuid);
        expect(orders[0].bahmniObservations[0].orderUuid).toBe("orderUuid");
        done();
    });

    it('should save encounter with observations having value only', function (done) {
        orderObservationService.save(orders, patient, locationUuid);
        expect(mockEncounterService.create).toHaveBeenCalled();
        expect(mockEncounterService.create.calls.mostRecent().args[0].patientUuid).toEqual("patientUuid");
        expect(mockEncounterService.create.calls.mostRecent().args[0].locationUuid).toEqual("locationUuid");
        expect(mockEncounterService.create.calls.mostRecent().args[0].observations.length).toBe(3);
        done();
    });

    it('should void existing observations without any values', function (done) {
        orderObservationService.save(orders, patient, locationUuid);
        expect(mockEncounterService.create).toHaveBeenCalled();
        expect(mockEncounterService.create.calls.mostRecent().args[0].observations.length).toBe(3);
        expect(mockEncounterService.create.calls.mostRecent().args[0].observations[2].voided).toBeTruthy();
        done();
    });
});