'use strict';

angular.module('bahmni.common.offline')
    .service('offlineAddressHierarchyDbService', ['$q', function ($q) {
        var db;
        var addressFields;

        var init = function (_db) {
            db = _db;
        };

        var insertAddressHierarchy = function (addressHierarchy) {
            return insertAddressHierarchyLevel(addressHierarchy.addressHierarchyLevel).then(function () {
                return insertAddressHierarchyEntry(addressHierarchy);
            });
        };

        var insertAddressHierarchyEntry = function (entry) {
            var addressHierarchyEntryTable = db.getSchema().table('address_hierarchy_entry');

            var row = addressHierarchyEntryTable.createRow({
                id: entry.addressHierarchyEntryId,
                name: entry.name,
                levelId: entry.addressHierarchyLevel.levelId,
                parentId: entry.parentId,
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
                parentLevelId: level.parentLevelId,
                addressField: level.addressField,
                uuid: level.uuid,
                required: level.required
            });

            return db.insertOrReplace().into(addressHierarchyLevelTable).values([row]).exec().then(function () {
                return level;
            });
        };

        var search = function (params) {
            var addressHierarchyLevelTable = db.getSchema().table('address_hierarchy_level');
            var addressHierarchyEntryTable = db.getSchema().table('address_hierarchy_entry');
            addressFields = Bahmni.Common.Offline.AddressFields;
            var addressHierarchyField;
            var level;

            for (var i in addressFields) {
                if (addressFields[i] === params.addressField) {
                    addressHierarchyField = i;
                }
            }
            return db.select()
                .from(addressHierarchyLevelTable)
                .where(addressHierarchyLevelTable.addressField.eq(addressHierarchyField)).exec()
                .then(function (result) {
                    level = result[0];
                    if (level != null) {
                        if (params.parentUuid != null) {
                            return db.select()
                                .from(addressHierarchyEntryTable)
                                .where(addressHierarchyEntryTable.uuid.eq(params.parentUuid))
                                .exec()
                                .then(function (result) {
                                    var parent = result[0] != null ? result[0] : null;
                                    if (parent != null) {
                                        return db.select()
                                            .from(addressHierarchyEntryTable)
                                            .where(lf.op.and(
                                                addressHierarchyEntryTable.levelId.eq(level.addressHierarchyLevelId),
                                                addressHierarchyEntryTable.parentId.eq(parent.id),
                                                addressHierarchyEntryTable.name.match(new RegExp(params.searchString, 'i')
                                                )))
                                            .limit(params.limit).exec()
                                            .then(
                                                function (result) {
                                                    return getAddresses(result).then(function (response) {
                                                        return {data: response};
                                                    });
                                                });
                                    }
                                });
                        }
                        return db.select()
                            .from(addressHierarchyEntryTable)
                            .where(lf.op.and(
                                addressHierarchyEntryTable.levelId.eq(level.addressHierarchyLevelId),
                                addressHierarchyEntryTable.name.match(new RegExp(params.searchString, 'i')
                                )))
                            .limit(params.limit).exec()
                            .then(
                                function (result) {
                                    return getAddresses(result).then(function (response) {
                                        return {data: response};
                                    });
                                });
                    }
                    return {data: []};
                });
        };

        var getAddresses = function (addressHierarchyEntries) {
            var addressHierarchyModelPromises = [];
            _.each(addressHierarchyEntries, function (entry) {
                addressHierarchyModelPromises.push(getAddressesAndParents(entry));
            });
            return $q.all(addressHierarchyModelPromises).then(function (results) {
                return results;
            });
        };

        var getAddressesAndParents = function (entry) {
            var modelMap = {};
            modelMap.name = entry.name;
            modelMap.uuid = entry.uuid;
            modelMap.userGeneratedId = entry.userGeneratedId;
            if (entry.parentId != null) {
                return getParentAddressById(entry.parentId).then(function (result) {
                    modelMap.parent = result;
                    return modelMap;
                });
            } else {
                var addressPromise = $q.defer();
                addressPromise.resolve(modelMap);
                return addressPromise.promise;
            }
        };

        var getParentAddressById = function (id) {
            var addressHierarchyEntryTable = db.getSchema().table('address_hierarchy_entry');
            return db.select()
                .from(addressHierarchyEntryTable)
                .where(addressHierarchyEntryTable.id.eq(id))
                .exec()
                .then(function (result) {
                    var parent = result[0] != null ? result[0] : null;
                    if (parent != null) {
                        return getAddressesAndParents(parent);
                    }
                });
        };

        return {
            init: init,
            insertAddressHierarchy: insertAddressHierarchy,
            search: search,
            getParentAddressById: getParentAddressById
        };
    }]);
