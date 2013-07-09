'use strict';
var PatientMapper = (function () {
    function PatientMapper() {
    }

    PatientMapper.prototype.map = function (patientConfig, patient) {
        return {
            names: [
                {familyName: patient.familyName, givenName: patient.givenName}
            ],
            age: patient.age,
            birthdate: patient.birthdate,
            gender: patient.gender,
            identifier: patient.identifier,
            centerID: patient.centerID,
            addresses: [patient.address],
            image: patient.getImageData(),
            attributes: this._mapAttributes(patient, patientConfig)
        };
    };

    PatientMapper.prototype._mapAttributes = function (patient, patientConfig) {
        var patientAttributes = patientConfig.personAttributeTypes;
        return patientAttributes.map(function (result) {
            return {"attributeType": result.uuid, "name": result.name, "value": patient[result.name]}
        }).filter(function (result) {
            return result.value != undefined
        });
    };

    return PatientMapper;
})();