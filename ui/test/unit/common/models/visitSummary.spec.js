describe('VisitSummary', function () {
    describe("isAdmitted", function () {
        it("should return true if the visit has admission details", function () {
            var visit = {
                admissionDetails: {
                    uuid: "uuid"
                }
            };

            var visitSummary = new Bahmni.Common.VisitSummary(visit);
            expect(visitSummary.isAdmitted()).toEqual(true);
        });

        it("should return false if the visit has no admission details", function () {
            var visit = {
            };

            var visitSummary = new Bahmni.Common.VisitSummary(visit);
            expect(visitSummary.isAdmitted()).toEqual(false);
        });
    });

    describe("isDischarged", function () {
        it("should return true if the visit has discharge details", function () {
            var visit = {
                dischargeDetails: {
                    uuid: "uuid"
                }
            };

            var visitSummary = new Bahmni.Common.VisitSummary(visit);
            expect(visitSummary.isDischarged()).toEqual(true);
        });

        it("should return false if the visit has no discharge details", function () {
            var visit = {
            };

            var visitSummary = new Bahmni.Common.VisitSummary(visit);
            expect(visitSummary.isDischarged()).toEqual(false);
        });
    });

    describe("getAdmissionEncounterUuid", function () {
        it("should return admission encounter uuid if the visit has admission details", function () {
            var visit = {
                admissionDetails: {
                    uuid: "admissionUuid"
                }
            };

            var visitSummary = new Bahmni.Common.VisitSummary(visit);
            expect(visitSummary.getAdmissionEncounterUuid()).toEqual("admissionUuid");
        });

        it("should return undefined if the visit has no admission details", function () {
            var visit = {
            };

            var visitSummary = new Bahmni.Common.VisitSummary(visit);
            expect(visitSummary.getAdmissionEncounterUuid()).toEqual(undefined);
        });
    });

    describe("getDischargeEncounterUuid", function () {
        it("should return discharge encounter uuid if the visit has discharge details", function () {
            var visit = {
                dischargeDetails: {
                    uuid: "dischargeUuid"
                }
            };

            var visitSummary = new Bahmni.Common.VisitSummary(visit);
            expect(visitSummary.getDischargeEncounterUuid()).toEqual("dischargeUuid");
        });

        it("should return undefined if the visit has no discharge details", function () {
            var visit = {
            };

            var visitSummary = new Bahmni.Common.VisitSummary(visit);
            expect(visitSummary.getDischargeEncounterUuid()).toEqual(undefined);
        });
    });
});