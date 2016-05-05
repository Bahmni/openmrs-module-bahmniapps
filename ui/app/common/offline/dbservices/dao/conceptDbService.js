'use strict';

angular.module('bahmni.common.offline')
    .service('conceptDbService', ['$q',
        function ($q) {

            var db;

            var getConcept = function (conceptUuid) {
                var deferred = $q.defer();
                var concept = db.getSchema().table('concept');
                db.select()
                    .from(concept)
                    .where(concept.uuid.eq(conceptUuid)).exec()
                    .then(function (result) {
                        deferred.resolve(result[0]);
                    });
                return deferred.promise;
            };

            var getConceptByName = function (conceptName) {
                var deferred = $q.defer();
                var concept = db.getSchema().table('concept');
                db.select()
                    .from(concept)
                    .where(concept.name.eq(conceptName)).exec()
                    .then(function (result) {
                        deferred.resolve(result[0]);
                    });
                return deferred.promise;
            };

            var insertConceptAndUpdateHierarchy = function (data, parent) {
                return insertConcept(data, parent).then(function () {
                    return updateChildren(data.results[0]).then(function () {
                        return updateParentJson(data.results[0]);
                    })
                })


            };

            var insertConcept = function (data, parent) {
                var concept = db.getSchema().table('concept');
                var uuid = data.results && data.results[0] ? data.results[0].uuid : undefined;
                return getParents(uuid).then(function (response) {
                    var parents = {};
                    if (response.length == 0 || response[0].parents == undefined) {
                        parents.parentUuids = [];
                    } else {
                        parents = response[0].parents;
                    }
                    parents.parentUuids = _.union(parents.parentUuids, parent);

                    var row = concept.createRow({
                        data: data,
                        name: data.results[0].name.name,
                        uuid: uuid,
                        parents: parents
                    });

                    return db.insertOrReplace().into(concept).values([row]).exec();
                });
            };


            var getParents = function (childUuid) {
                var concept = db.getSchema().table('concept');
                return db.select(concept.parents)
                    .from(concept)
                    .where(concept.uuid.eq(childUuid)).exec();
            };

            var updateChildren = function (concept) {
                var deferred = $q.defer();
                var length = concept.setMembers.length;
                if (length == 0)
                    deferred.resolve();
                var count = 0;
                _.each(concept.setMembers, function (child) {
                    insertConcept({"results": [child]}, [concept.uuid]).then(function () {
                        count++;
                        if (count == length) {
                            deferred.resolve();
                        }
                    });
                });
                return deferred.promise;
            };

            var updateParentJson = function (child) {
                return getParents(child.uuid).then(function (response) {
                    if (response[0].parents == undefined)
                        return;
                    _.each(response[0].parents.parentUuids, function (parentUuid) {
                        return getConcept(parentUuid).then(function (parent) {
                            for (var i = 0; i < parent.data.results[0].setMembers.length; i++) {
                                if (parent.data.results[0].setMembers[i].uuid == child.uuid) {
                                    parent.data.results[0].setMembers[i] = child;
                                }
                            }
                            insertConcept(parent.data, parent.parents.parentUuids);
                            updateParentJson(parent.data.results[0]);
                        });
                    });

                });
            };

            var init = function (_db) {
                db = _db;
            };


            return {
                init: init,
                getConcept: getConcept,
                getConceptByName: getConceptByName,
                insertConceptAndUpdateHierarchy: insertConceptAndUpdateHierarchy,
                updateChildren: updateChildren,
                updateParentJson: updateParentJson
            }
        }]);