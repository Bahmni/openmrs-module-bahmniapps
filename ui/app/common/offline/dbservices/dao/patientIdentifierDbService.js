'use strict';

angular.module('bahmni.common.offline')
    .service('patientIdentifierDbService', ['$q', function ($q) {
        var getPatientIdentifiersByPatientUuid = function (db, patientUuid) {
            var pi = db.getSchema().table('patient_identifier');
            return db.select(pi.identifierJson)
                .from(pi)
                .where(pi.patientUuid.eq(patientUuid)).exec()
                .then(function (result) {
                    return result;
                });
        };

        var insertQueries = function (identifier, patientIdentifierTable, patientUuid, queries, db) {
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
            return queries;
        };

        var insertPatientIdentifiers = function (db, patientUuid, identifiers) {
            var patientIdentifierTable = db.getSchema().table('patient_identifier');
            var defer = $q.defer();
            var promises = [], queries = [];
            _.each(identifiers, function (identifier) {
                if (!identifier.primaryIdentifier) {
                    queries = insertQueries(identifier, patientIdentifierTable, patientUuid, queries, db);
                }
                else {
                    var promise = db.select(patientIdentifierTable.primaryIdentifier)
                        .from(patientIdentifierTable)
                        .where(lf.op.and(patientIdentifierTable.primaryIdentifier.eq(identifier.primaryIdentifier), patientIdentifierTable.patientUuid.neq(patientUuid))).exec()
                        .then(function (results) {
                            if (results.length > 0) {
                                return defer.reject({code: 201});
                            } else {
                                queries = insertQueries(identifier, patientIdentifierTable, patientUuid, queries, db);
                            }
                        });
                    promises.push(promise);
                }
            });
            $q.all(promises).then(function () {
                var tx = db.createTransaction();
                return tx.exec(queries).then(function () {
                    return defer.resolve();
                });
            });
            return defer.promise;
        };

        return {
            insertPatientIdentifiers: insertPatientIdentifiers,
            getPatientIdentifiersByPatientUuid: getPatientIdentifiersByPatientUuid
        };
    }]);
