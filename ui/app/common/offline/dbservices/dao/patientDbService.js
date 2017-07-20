'use strict';

angular.module('bahmni.common.offline')
    .service('patientDbService', function () {
        var getPatientByUuid = function (db, uuid) {
            var p = db.getSchema().table('patient');
            return db.select(p.patientJson.as('patient'))
                .from(p)
                .where(lf.op.and(p.uuid.eq(uuid), p.voided.eq(false))).exec()
                .then(function (result) {
                    return result[0];
                });
        };

        var insertPatientData = function (db, patientData) {
            var patient = patientData.patient;
            var patientTable, person;
            patientTable = db.getSchema().table('patient');
            person = patient.person;
            var personName = person.names[0] || person.preferredName;
            var row = patientTable.createRow({
                'uuid': patient.uuid,
                'givenName': personName.givenName,
                'middleName': personName.middleName,
                'familyName': personName.familyName,
                'gender': person.gender,
                'voided': patient.voided || false,
                'birthdate': new Date(person.birthdate),
                'dateCreated': new Date(patient.person.auditInfo.dateCreated),
                'patientJson': patient
            });
            return db.insertOrReplace().into(patientTable).values([row]).exec().then(function () {
                return patient.uuid;
            });
        };

        return {
            getPatientByUuid: getPatientByUuid,
            insertPatientData: insertPatientData
        };
    });
