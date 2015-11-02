'use strict';

describe("Visit Tab Config ", function () {

    var tabs, config;
    beforeEach(function(){
        tabs = [
            {
                displayByDefault: true,
                sections: [
                    {"config": {}}
                ]
            },
            {
                sections: [
                    {"config": {}}
                ]
            }
        ];
        config = new Bahmni.Clinical.VisitTabConfig(tabs);

    })
    it("should set visitUuids and patientUuid to the sections", function () {
        var visitUuids = [1, 2];
        var patientUuid = 200;

        config.setVisitUuidsAndPatientUuidToTheSections(visitUuids, patientUuid);

        expect(tabs[0].sections[0].config.visitUuids).toBe(visitUuids);
        expect(tabs[0].sections[0].config.patientUuid).toBe(patientUuid);
        expect(tabs[1].sections[0].config.visitUuids).toBe(visitUuids);
        expect(tabs[0].sections[0].config.patientUuid).toBe(patientUuid);
    });

    it("should have identifierkey as title when there is no translation key", function(){
        expect(config.identifierKey).toBe("title");
    });

    it("should not have identifierkey as dashboardName when there is translation key", function(){
        tabs[0].translationKey = 'general_tab_trans_key';
        tabs[1].translationKey = 'orders_tab_trans_key';
        var visitTabConfig = new Bahmni.Clinical.VisitTabConfig(tabs);
        expect(visitTabConfig.identifierKey).toBe("translationKey");
    })


});