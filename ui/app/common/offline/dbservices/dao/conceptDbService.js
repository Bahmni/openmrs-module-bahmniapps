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
                    });
                });
            };

            var insertConcept = function (data, parent) {
                var concept = db.getSchema().table('concept');
                var uuid = data.results && data.results[0] ? data.results[0].uuid : undefined;
                return getParents(uuid).then(function (response) {
                    var parents = {};
                    if (response.length == 0 || response[0].parents == undefined) {
                        parents.parentConcepts = [];
                    } else {
                        parents = response[0].parents;
                    }

                    if (parent && parent.length > 0) {
                        _.each(parent, function (member) {
                            if (!_.find(parents.parentConcepts, member)) {
                                parents.parentConcepts.push(member);
                            }
                        });
                    }

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
                if (length == 0) {
                    deferred.resolve();
                }
                var count = 0;
                _.each(concept.setMembers, function (child) {
                    insertConcept({"results": [child]}, [{conceptName: concept.name.name, uuid: concept.uuid}]).then(function () {
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
                    if (response[0].parents == undefined) {
                        return;
                    }
                    _.each(response[0].parents.parentConcepts, function (eachParent) {
                        return getConcept(eachParent.uuid).then(function (parent) {
                            for (var i = 0; i < parent.data.results[0].setMembers.length; i++) {
                                if (parent.data.results[0].setMembers[i].uuid == child.uuid) {
                                    parent.data.results[0].setMembers[i] = child;
                                }
                            }
                            insertConcept(parent.data, parent.parents.parentConcepts);
                            updateParentJson(parent.data.results[0]);
                        });
                    });
                });
            };

            var init = function (_db) {
                db = _db;
            };

            var getAllParentsInHierarchy = function (conceptName, conceptNamesInHierarchy) {
                return getConceptByName(conceptName).then(function (result) {
                    if (!result) {
                        return [];
                    }
                    conceptNamesInHierarchy.push(conceptName);
                    var parentConcepts = result.parents.parentConcepts;
                    // TODO not considering all the parents
                    if (parentConcepts && parentConcepts.length > 0) {
                        return getAllParentsInHierarchy(parentConcepts[0].conceptName, conceptNamesInHierarchy);
                    }
                    return conceptNamesInHierarchy;
                });
            };

            return {
                init: init,
                getConcept: getConcept,
                getConceptByName: getConceptByName,
                insertConceptAndUpdateHierarchy: insertConceptAndUpdateHierarchy,
                updateChildren: updateChildren,
                updateParentJson: updateParentJson,
                getAllParentsInHierarchy: getAllParentsInHierarchy
            };
        }]);
