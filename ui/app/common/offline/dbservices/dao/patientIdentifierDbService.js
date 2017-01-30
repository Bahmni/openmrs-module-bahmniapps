'use strict';

angular.module('bahmni.common.offline')
    .service('patientIdentifierDbService', function () {
        var getPatientIdentifiersByPatientUuid = function (db, patientUuid) {
            var pi = db.getSchema().table('patient_identifier');
            return db.select(pi.identifierJson)
                .from(pi)
                .where(pi.patientUuid.eq(patientUuid)).exec()
                .then(function (result) {
                    return result;
                });
        };

        var insertPatientIdentifiers = function (db, patientUuid, identifiers) {
            var patientIdentifierTable = db.getSchema().table('patient_identifier');
            var queries = [];
            _.each(identifiers, function (identifier) {
                var identifierTypeUuid = identifier.identifierType && identifier.identifierType.uuid || identifier.identifierType;
                var isPrimaryIdentifier = identifier.identifierType && identifier.identifierType.primary;
                var row = patientIdentifierTable.createRow({
                    'typeUuid': identifierTypeUuid,
                    'identifier': identifier.identifier || null,
                    'primaryIdentifier': identifier.primaryIdentifier,
                    'extraIdentifiers': identifier.extraIdentifiers,
                    'primary': isPrimaryIdentifier,
                    'patientUuid': patientUuid,
                    'identifierJson': identifier
                });
                queries.push(db.insertOrReplace().into(patientIdentifierTable).values([row]));
            });

            var tx = db.createTransaction();
            return tx.exec(queries);
        };

        return {
            insertPatientIdentifiers: insertPatientIdentifiers,
            getPatientIdentifiersByPatientUuid: getPatientIdentifiersByPatientUuid
        };
    });
