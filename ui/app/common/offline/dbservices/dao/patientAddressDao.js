'use strict';

angular.module('bahmni.common.offline')
    .service('patientAddressDao', ['$http', '$q', function ($http, $q) {
        var insertAddress = function (db, patientUuid, address, addressColumnNames) {
            var patientAddressTable = db.getSchema().table('patient_address');
            var constructedRow = {};
            _.each(addressColumnNames, function (addressColumn) {
                constructedRow[addressColumn] = address[addressColumn]
            });
            constructedRow["patientUuid"] = patientUuid;
            var row = patientAddressTable.createRow(constructedRow);

            return db.insertOrReplace().into(patientAddressTable).values([row]).exec()
        };

        return {
            insertAddress : insertAddress
        }
    }]);