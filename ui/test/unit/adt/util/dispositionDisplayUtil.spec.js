/*
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at https://www.bahmni.org/license/mplv2hd.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */

describe('DispositionDisplayUtil', function () {
    describe("getEncounterToDisplay", function () {
        var encounterConfig = {
            getAdmissionEncounterTypeUuid: function () {
                return "AdmissionEncounterTypeUuid"
            },
            getTransferEncounterTypeUuid: function () {
                return "TransferEncounterTypeUuid"
            },
            getDischargeEncounterTypeUuid: function () {
                return "DischargeEncounterTypeUuid"
            }
        };

        it("should return transfer encounter type uuid if the visit has admission details and no discharge details.", function () {
            var visit = {
                isAdmitted: function () {
                    return true;
                },
                isDischarged: function () {
                    return false;
                }
            };

            var encounterTypeUuid = Bahmni.ADT.DispositionDisplayUtil.getEncounterToDisplay(encounterConfig, visit);
            expect(encounterTypeUuid).toEqual("TransferEncounterTypeUuid")
        });

        it("should return admission encounter type if visit has no admission details.", function () {
            var visit = {
                isAdmitted: function () {
                    return false;
                },
                isDischarged: function () {
                    return false;
                }
            };

            var encounterTypeUuid = Bahmni.ADT.DispositionDisplayUtil.getEncounterToDisplay(encounterConfig, visit);
            expect(encounterTypeUuid).toEqual("AdmissionEncounterTypeUuid")
        });

        it("should return discharge encounter type if the visit has dischargeDetails", function () {
            var visit = {
                isAdmitted: function () {
                    return false;
                },
                isDischarged: function () {
                    return true;
                }
            };

            var encounterTypeUuid = Bahmni.ADT.DispositionDisplayUtil.getEncounterToDisplay(encounterConfig, visit);
            expect(encounterTypeUuid).toEqual("DischargeEncounterTypeUuid")
        });
    });
});