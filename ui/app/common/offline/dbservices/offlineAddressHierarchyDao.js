'use strict';

angular.module('bahmni.common.offline')
    .service('offlineAddressHierarchyDao', ['$http', '$q', function ($http, $q) {
        var db;

        var init = function (_db) {
            db = _db;
        };

        var insertAddressHierarchyEntry = function (entry) {
            var addressHierarchyEntryTable = db.getSchema().table('address_hierarchy_entry');
            var row = addressHierarchyEntryTable.createRow({
                "name": entry.name,
                "level_id": entry.level_id,
                "parent_id": entry.parent_id,
                "user_generated_id": entry.user_generated_id,
                "uuid": entry.uuid
            });

            return db.insertOrReplace().into(addressHierarchyEntryTable).values([row]).exec().then(function () {
                return entry;
            });
        };
        return {
            init: init,
            insertAddressHierarchyEntry: insertAddressHierarchyEntry
        }
    }]);