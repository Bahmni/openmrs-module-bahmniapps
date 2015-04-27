'use strict';


describe("test clinical's app.json configuration", function () {
    var appSer;
    var appDesc;
    var urlHelper;

    beforeEach(module('bahmni.clinical'));

    beforeEach(module(function ($provide) {
        appSer = jasmine.createSpyObj('appService', ['getAppDescriptor']);
        appDesc = jasmine.createSpyObj('appDescriptor',['getConfigValue']);

        $provide.value('appService', appSer);
        $provide.value('urlHelper',urlHelper);
    }));

    it("ensure the order attributes returned successfully",inject(['clinicalAppConfigService', function (clinicalAppConfigService){

        appSer.getAppDescriptor.and.returnValue(appDesc);
        appDesc.getConfigValue.and.returnValue(orderConfig);

        var actual = clinicalAppConfigService.getOrderAttributes("Lab Orders","conceptSet");
        expect(actual).toEqual("Lab Samples");

        actual = clinicalAppConfigService.getOrderAttributes("Lab Orders","detail");
        expect(actual).toEqual([
            {
                "type": "LabSet",
                "title":"Panel"
            },
            {
                "type": "LabTest",
                "title":"Tests"
            }
        ]);

    }]));

    it("ensure that the order types are returned",inject(['clinicalAppConfigService', function (clinicalAppConfigService){

        appSer.getAppDescriptor.and.returnValue(appDesc);
        appDesc.getConfigValue.and.returnValue(orderConfig);

        var actual = clinicalAppConfigService.getOrderTypes();
        expect(actual).toEqual([{name:"Lab Orders"},{name:"Radiology"}]);

        appDesc.getConfigValue.and.returnValue({});
        var actual = clinicalAppConfigService.getOrderTypes();
        expect(actual).toEqual([]);

    }]));

    var orderConfig = {
        "Lab Orders":{
            "conceptSet":"Lab Samples",
            "detail":[
                {
                    "type": "LabSet",
                    "title":"Panel"
                },
                {
                    "type": "LabTest",
                    "title":"Tests"
                }
            ]
        },
        "Radiology":{
            "conceptSet":"Radiology",
            "detail":[
                {
                    "type": "Procedure Order",
                    "title":"Radiology"
                }
            ]
        }
    };
});

