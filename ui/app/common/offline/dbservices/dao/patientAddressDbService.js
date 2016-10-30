'use strict';

angular.module('bahmni.common.offline')
    .service('patientAddressDbService', [function () {
        var insertAddress = function (db, patientUuid, address) {
            var patientAddressTable = db.getSchema().table('patient_address');
            var row = patientAddressTable.createRow({
                address1: address['address1'],
                address2: address['address2'],
                address3: address['address3'],
                address4: address['address4'],
                address5: address['address5'],
                address6: address['address6'],
                cityVillage: address['cityVillage'],
                stateProvince: address['stateProvince'],
                postalCode: address['postalCode'],
                country: address['country'],
                countyDistrict: address['countyDistrict'],
                patientUuid: patientUuid
            });

            return db.insertOrReplace().into(patientAddressTable).values([row]).exec();
        };

        return {
            insertAddress: insertAddress
        };
    }]);
