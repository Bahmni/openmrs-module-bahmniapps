'use strict';

describe("Visit Tab Config ", function () {

    it("should set visitUuids and patientUuid to the sections", function () {
        var visitUuids = [1, 2];
        var patientUuid = 200;
        var tabs = [
            {sections: [
                {"config": {}}
            ]},
            {sections: [
                {"config": {}}
            ]}
        ];
        var config = new Bahmni.Clinical.VisitTabConfig(tabs);

        config.setVisitUuidsAndPatientUuidToTheSections(visitUuids, patientUuid);

        expect(tabs[0].sections[0].config.visitUuids).toBe(visitUuids);
        expect(tabs[0].sections[0].config.patientUuid).toBe(patientUuid);
        expect(tabs[1].sections[0].config.visitUuids).toBe(visitUuids);
        expect(tabs[0].sections[0].config.patientUuid).toBe(patientUuid);
    });

});