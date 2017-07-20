'use strict';

angular.module('bahmni.common.offline')
    .service('offlineMarkerDbService', [function () {
        var getMarkers = function (db, markerTable, markerName) {
            return db.select()
                .from(markerTable)
                .where(markerTable.markerName.eq(markerName)).exec();
        };

        var insertOrUpdateMarker = function (db, markerTable, row) {
            return db.insertOrReplace().into(markerTable).values([row]).exec();
        };

        var insertMarker = function (db, markerName, eventUuid, filters) {
            var markerTable = db.getSchema().table('event_log_marker');

            var marker = {
                markerName: markerName,
                lastReadEventUuid: eventUuid,
                filters: filters,
                lastReadTime: new Date()
            };
            var row = markerTable.createRow(marker);

            return insertOrUpdateMarker(db, markerTable, row).then(function () {
                return marker;
            });
        };

        var getMarker = function (db, markerName) {
            var markerTable = db.getSchema().table('event_log_marker');
            return getMarkers(db, markerTable, markerName).then(function (markers) {
                return markers[0];
            });
        };

        return {
            insertMarker: insertMarker,
            getMarker: getMarker
        };
    }]);
