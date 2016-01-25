'use strict';

angular.module('bahmni.common.offline')
    .service('offlineAddressHierarchyDbService', ['$http', '$q', function ($http, $q) {
        var db;

        var init = function (_db) {
            db = _db;
        };

        var insertAddressHierarchy = function (addressHierarchy) {
            return insertAddressHierarchyLevel(addressHierarchy.addressHierarchyLevel).then(function () {
                return insertAddressHierarchyEntry(addressHierarchy);
            })
        };

        var insertAddressHierarchyEntry = function (entry) {
            var addressHierarchyEntryTable = db.getSchema().table('address_hierarchy_entry');

            var row = addressHierarchyEntryTable.createRow({
                name: entry.name,
                levelId: entry.level.levelId,
                parentId: entry.parent,
                userGeneratedId: entry.userGeneratedId,
                uuid: entry.uuid
            });

            return db.insertOrReplace().into(addressHierarchyEntryTable).values([row]).exec().then(function () {
                return entry;
            });
        };

        var insertAddressHierarchyLevel = function (level) {
            var addressHierarchyLevelTable = db.getSchema().table('address_hierarchy_level');

            var row = addressHierarchyLevelTable.createRow({
                addressHierarchyLevelId: level.levelId,
                name: level.name,
                parentLevelId: level.parent,
                addressField: level.addressField,
                uuid: level.uuid,
                required: level.required
            });

            return db.insertOrReplace().into(addressHierarchyLevelTable).values([row]).exec().then(function () {
                return level;
            });
        };
        
        return {
            init: init,
            insertAddressHierarchy: insertAddressHierarchy
        }
    }]);