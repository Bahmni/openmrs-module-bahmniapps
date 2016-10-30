'use strict';

Bahmni.Common.VisitSummary = function (visitSummary) {
    angular.extend(this, visitSummary);

    this.isAdmitted = function () {
        return this.admissionDetails && this.admissionDetails.uuid ? true : false;
    };

    this.isDischarged = function () {
        return this.dischargeDetails && this.dischargeDetails.uuid ? true : false;
    };

    this.getAdmissionEncounterUuid = function () {
        return this.isAdmitted() ? this.admissionDetails.uuid : undefined;
    };

    this.getDischargeEncounterUuid = function () {
        return this.isDischarged() ? this.dischargeDetails.uuid : undefined;
    };

    this.hasBeenAdmitted = function () {
        return this.isAdmitted() && !this.isDischarged();
    };
};

