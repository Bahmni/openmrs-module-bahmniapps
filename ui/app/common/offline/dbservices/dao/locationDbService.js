'use strict';

angular.module('bahmni.common.offline')
    .service('locationDbService', [ function () {
        var insertLocations = function (db, locations) {
            var table, queries = [];
            table = db.getSchema().table('login_locations');
            for (var i = 0; i < locations.length; i++) {
                var row = table.createRow({
                    'uuid': locations[i].uuid,
                    'value': locations[i]
                });
                queries.push(db.insertOrReplace().into(table).values([row]));
            }
            var tx = db.createTransaction();
            return tx.exec(queries);
        };

        var getLocationByUuid = function (db, uuid) {
            var loginLocationTable = db.getSchema().table('login_locations');

            return db.select(loginLocationTable.value)
                     .from(loginLocationTable)
                     .where(loginLocationTable.uuid.eq(uuid))
                     .exec()
                     .then(function (loginLocation) {
                         return loginLocation[0].value;
                     });
        };

        return {
            insertLocations: insertLocations,
            getLocationByUuid: getLocationByUuid
        };
    }]);
