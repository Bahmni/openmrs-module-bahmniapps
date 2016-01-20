'use strict';

angular.module('bahmni.common.offline')
    .service('patientDbService', ['$http', '$q', function ($http, $q) {
        var getPatientByIdentifier = function (db, patientIdentifier) {
            var p = db.getSchema().table('patient');
            return db.select(p.identifier, p.givenName, p.familyName, p.gender, p.birthdate, p.uuid)
                .from(p)
                .where(p.identifier.eq(patientIdentifier.toUpperCase())).exec().th
                .then(function (result) {
                    return result;
                });
        };

        var getPatientByUuid = function (db, uuid) {
            var p = db.getSchema().table('patient');
            return db.select(p.patientJson.as('patient'), p.relationships.as('relationships'))
                .from(p)
                .where(p.uuid.eq(uuid)).exec()
                .then(function (result) {
                    return result[0];
                });
        };

        var generateOfflineIdentifier = function (db) {
            var deferred = $q.defer();
            var idgen = db.getSchema().table('idgen');
            db.select(idgen.identifier.as('identifier'))
                .from(idgen).exec()
                .then(function (result) {
                    var identifier = (result[0] && result[0].identifier) ? result[0].identifier : 1;
                    insertIntoIdgen(db, identifier);
                    deferred.resolve({data: "TMP-" + identifier});
                });

            return deferred.promise;
        };

        var insertIntoIdgen = function (db, result) {
            var idgen = db.getSchema().table('idgen');
            var row = idgen.createRow({
                'identifier': ++result
            });
            db.insertOrReplace().into(idgen).values([row]).exec()
        };

        var insertPatientData = function (db, patientData) {
            var patient = patientData.patient;
            var patientTable, patientIdentifier, person;
            patientTable = db.getSchema().table('patient');
            person = patient.person;
            var personName = person.names[0];

            var relationships = patientData.relationships;
            if (!_.isEmpty(relationships)) {
                _.each(relationships, function (relationship) {
                    relationship.personA = {
                        display: personName.givenName + " " + personName.familyName,
                        uuid: patient.uuid
                    };
                })
            }
            patientIdentifier = patient.identifiers[0].identifier;
            var row = patientTable.createRow({
                'identifier': patientIdentifier,
                'uuid': patient.uuid,
                'givenName': personName.givenName,
                'middleName': personName.middleName,
                'familyName': personName.familyName,
                'gender': person.gender,
                'birthdate': new Date(person.birthdate),
                'dateCreated': new Date(patient.person.auditInfo.dateCreated),
                'patientJson': patient,
                'relationships': relationships
            });
            return db.insertOrReplace().into(patientTable).values([row]).exec().then(function () {
                return patient.uuid;
            });
        };

        return {
            getPatientByIdentifier: getPatientByIdentifier,
            getPatientByUuid: getPatientByUuid,
            generateOfflineIdentifier: generateOfflineIdentifier,
            insertPatientData : insertPatientData,
            insertIntoIdgen : insertIntoIdgen
    }
    }]);