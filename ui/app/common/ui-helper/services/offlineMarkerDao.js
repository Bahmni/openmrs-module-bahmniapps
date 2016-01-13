'use strict';

angular.module('bahmni.common.uiHelper')
    .service('offlineMarkerDao', [function () {
        var db;

        var init = function (_db) {
            db = _db;
        };

        var getMarkers = function (markerTable) {
            return db.select().from(markerTable).exec();
        };

        var insertOrUpdateMarker = function(markerTable, row) {
            return db.insertOrReplace().into(markerTable).values([row]).exec();
        };

        var insertMarker = function (eventUuid, catchmentNumber) {
            var markerTable = db.getSchema().table('event_log_marker');
            return getMarkers(markerTable)
                .then(function (markers) {
                    var row = markerTable.createRow({
                        lastReadUuid: eventUuid,
                        catchmentNumber: catchmentNumber,
                        lastReadTime: new Date().toString(),
                        _id: markers[0] ? markers[0]._id : undefined
                    });

                    return insertOrUpdateMarker(markerTable, row).then(function () {
                        return eventUuid;
                    });
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