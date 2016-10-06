'use strict';

describe('OrderFulfillmentConfig Factory', function () {

    var conceptSetServiceMock, orderFulfillmentConfig;

    beforeEach(function () {
        module('bahmni.orders');

        module(function ($provide) {
            conceptSetServiceMock = jasmine.createSpyObj('conceptSetService',['getConcept']);
            $provide.value('conceptSetService',conceptSetServiceMock);

            var defaultMockData = {results:[{setMembers:[]}]};
            conceptSetServiceMock.getConcept.and.returnValue(specUtil.createFakePromise(defaultMockData));

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

    it("Should fetch concept set members", function () {
        var conceptSetName = "Viral Fever";
        var representation = "custom:(uuid,name,names,conceptClass," +
            "setMembers:(uuid,name,names,conceptClass," +
            "setMembers:(uuid,name,names,conceptClass," +
            "setMembers:(uuid,name,names,conceptClass))))";

        orderFulfillmentConfig(conceptSetName);

        expect(conceptSetServiceMock.getConcept).toHaveBeenCalled();
        expect(conceptSetServiceMock.getConcept).toHaveBeenCalledWith({
            name: conceptSetName,
            v: representation
        });

    });

    it("Should return a config based on the fetched concept set members",function(done){
        var data = {results:[{
            setMembers:[{name:{name:"member1"}},{name:{name:"member2"}}]
        }]};

        conceptSetServiceMock.getConcept.and.returnValue(specUtil.createFakePromise(data));

        orderFulfillmentConfig("Viral Fever").then(function(response){
            var config=response.data;

            expect(config).not.toBeFalsy();

            expect(config.isObservation).toBeTruthy();
            expect(config.showDetailsButton).toBeTruthy();
            expect(config.hideIfEmpty).toBeFalsy();
            expect(config.showHeader).toBeFalsy();
            expect(config.scope).toBe("latest");
            expect(config.conceptNames).toEqual(["member1","member2"]);

            done();
        });
    });

});