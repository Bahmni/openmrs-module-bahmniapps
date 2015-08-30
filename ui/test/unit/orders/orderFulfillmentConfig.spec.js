'use strict';

describe('OrderFulfillmentConfig Factory', function () {

    var spinnerMock, conceptSetServiceMock, orderFulfillmentConfig;

    beforeEach(function () {
        module('bahmni.orders');

        module(function ($provide) {
            spinnerMock = jasmine.createSpyObj('spinner', ['forPromise']);
            $provide.value('spinner', spinnerMock);

            spinnerMock.forPromise.and.callFake(function(promise){return promise;});

            conceptSetServiceMock = jasmine.createSpyObj('conceptSetService',['getConceptSetMembers']);
            $provide.value('conceptSetService',conceptSetServiceMock);

            var defaultMockData = {results:[{setMembers:[]}]};
            conceptSetServiceMock.getConceptSetMembers.and.returnValue(specUtil.createFakePromise(defaultMockData));

        });

        inject(function (_orderFulfillmentConfig_) {
            orderFulfillmentConfig = _orderFulfillmentConfig_;
        });
    });

    it("Should be a function", function () {
        expect(angular.isFunction(orderFulfillmentConfig)).toBeTruthy();
    });

    it("Should not return null", function () {
        expect(orderFulfillmentConfig("Viral Fever")).not.toBeUndefined();
    });

    it("Should initiate spinner on call", function () {
        orderFulfillmentConfig("Viral Fever");
        expect(spinnerMock.forPromise).toHaveBeenCalled();
    });

    it("Should fetch concept set members", function () {
        var conceptSetName = "Viral Fever";
        orderFulfillmentConfig(conceptSetName);

        expect(conceptSetServiceMock.getConceptSetMembers).toHaveBeenCalled();
        expect(conceptSetServiceMock.getConceptSetMembers).toHaveBeenCalledWith({
            name: conceptSetName,
            v: Bahmni.Common.conceptSetRepresentationForOrderFulfillmentConfig
        });

    });

    it("Should return a config based on the fetched concept set members",function(done){
        var data = {results:[{
            setMembers:[{name:{name:"member1"}},{name:{name:"member2"}}]
        }]};

        conceptSetServiceMock.getConceptSetMembers.and.returnValue(specUtil.createFakePromise(data));

        orderFulfillmentConfig("Viral Fever").then(function(response){
            var config=response.data;

            expect(config).not.toBeFalsy();

            expect(config.isObservation).toBeTruthy();
            expect(config.numberOfVisits).toBe(2);
            expect(config.showDetailsButton).toBeTruthy();
            expect(config.hideIfEmpty).toBeFalsy();
            expect(config.showHeader).toBeFalsy();
            expect(config.scope).toBe("latest");
            expect(config.conceptNames).toEqual(["member1","member2"]);

            done();
        });
    });

    it("The whole process should happen with a spinner loaded",function(){
        var resultantPromise = orderFulfillmentConfig("Viral Fever");
        expect(spinnerMock.forPromise).toHaveBeenCalledWith(resultantPromise);
    });
});