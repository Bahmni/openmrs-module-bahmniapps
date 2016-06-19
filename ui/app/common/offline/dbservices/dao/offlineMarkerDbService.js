'use strict';

angular.module('bahmni.common.offline')
    .service('offlineMarkerDbService', [function () {
        var db;

        var init = function (_db) {
            db = _db;
        };

        var getMarkers = function (markerTable, markerName) {
            return db.select()
                .from(markerTable)
                .where(markerTable.markerName.eq(markerName)).exec();
        };

        var insertOrUpdateMarker = function (markerTable, row) {
            return db.insertOrReplace().into(markerTable).values([row]).exec();
        };

        var insertMarker = function (markerName, eventUuid, catchmentNumber) {
            var markerTable = db.getSchema().table('event_log_marker');

            var row = markerTable.createRow({
                markerName: markerName,
                lastReadEventUuid: eventUuid,
                catchmentNumber: catchmentNumber,
                lastReadTime: new Date()
            });

            return insertOrUpdateMarker(markerTable, row).then(function () {
                return eventUuid;
            });
        };

        var getMarker = function (markerName) {
            var markerTable = db.getSchema().table('event_log_marker');
            return getMarkers(markerTable, markerName).then(function (markers) {
                return markers[0]
            })
        };

        return {
            init: init,
            insertMarker: insertMarker,
            getMarker: getMarker
        }
    }]);
