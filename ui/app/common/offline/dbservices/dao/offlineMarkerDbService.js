'use strict';

angular.module('bahmni.common.offline')
    .service('offlineMarkerDbService', [function () {
        var db;

        var init = function (_db) {
            db = _db;
        };

        var getMarkers = function (markerTable) {
            return db.select().from(markerTable).exec();
        };

        var insertOrUpdateMarker = function (markerTable, row) {
            return db.insertOrReplace().into(markerTable).values([row]).exec();
        };

        var insertMarker = function (eventUuid, catchmentNumber) {
            var markerTable = db.getSchema().table('event_log_marker');

            var row = markerTable.createRow({
                lastReadEventUuid: eventUuid,
                catchmentNumber: catchmentNumber,
                lastReadTime: new Date()
            });

            return insertOrUpdateMarker(markerTable, row).then(function () {
                return eventUuid;
            });
        };

        var getMarker = function () {
            var markerTable = db.getSchema().table('event_log_marker');
            return getMarkers(markerTable).then(function (markers) {
                return markers[0]
            })
        };

        return {
            init: init,
            insertMarker: insertMarker,
            getMarker: getMarker
        }
    }]);
