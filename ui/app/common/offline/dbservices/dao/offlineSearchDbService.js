'use strict';

angular.module('bahmni.common.offline')
    .service('offlineSearchDbService', ['$http', '$q', '$rootScope', 'age', function ($http, $q, $rootScope, age) {
        var db;

        var search = function (params) {
            var defer = $q.defer();
            var response = {
                "data": {
                    pageOfResults: []
                }
            };

            if ($rootScope.searching) {
                response.data.pageOfResults.push({});
                return defer.resolve(response);
            }

            $rootScope.searching = true;
            var nameParts = null;
            if (params.q) {
                nameParts = params.q.split(" ");
                for (var i = 0; i < nameParts.length; i++) {
                    nameParts[i] = nameParts[i].replace('%', '.');
                }
            }

            if (!params.patientAttributes) {
                params.patientAttributes = "";
            }

            var snakeCaseToCamelCase = function (snake_str) { // eslint-disable-line camelcase
                return snake_str.replace(/_([a-z])/g, function (g) {
                    return g[1].toUpperCase();
                });
            };

            var camelCaseToSnakeCase = function (camelCaseSting) {
                return camelCaseSting.replace(/([A-Z])/g, function ($1) {
                    return "_" + $1.toLowerCase();
                });
            };

            var addressFieldName = null;
            if (params.addressFieldName) {
                addressFieldName = snakeCaseToCamelCase(params.addressFieldName);
            }

            var p = db.getSchema().table('patient');
            var pi = db.getSchema().table('patient_identifier');
            var pa = db.getSchema().table('patient_attribute');
            var pat = db.getSchema().table('patient_attribute_type');
            var padd = db.getSchema().table('patient_address').as('addressFieldValue');
            var encounter = db.getSchema().table('encounter');

            db.select(pat.attributeTypeId)
                .from(pat)
                .where(pat.attributeName.in(params.patientAttributes)).exec()
                .then(function (attributeTypeIds) {
                    var query = db.select(p.uuid.as('uuid'))
                        .from(p)
                        .innerJoin(padd, p.uuid.eq(padd.patientUuid))
                        .leftOuterJoin(pi, p.uuid.eq(pi.patientUuid))
                        .leftOuterJoin(pa, p.uuid.eq(pa.patientUuid))
                        .leftOuterJoin(encounter, p.uuid.eq(encounter.patientUuid))
                        .leftOuterJoin(pat, pa.attributeTypeId.eq(pat.attributeTypeId));
                    var predicates = [];

                    if (!_.isEmpty(params.addressFieldValue)) {
                        params.addressFieldValue = params.addressFieldValue.replace('%', '.');
                        predicates.push(padd[addressFieldName].match(new RegExp(params.addressFieldValue, 'i')));
                    }

                    if (params.duration) {
                        var startDate = Bahmni.Common.Util.DateUtil.subtractDays(new Date(), params.duration);
                        var encounterPredicate = encounter.encounterDateTime.gte(startDate);
                        var dateCreatedPredicate = p.dateCreated.gte(startDate);
                        predicates.push(lf.op.or(encounterPredicate, dateCreatedPredicate));
                    }

                    if (!_.isEmpty(params.identifier)) {
                        params.identifier = params.identifier.replace('%', '.');
                        predicates.push(pi.identifier.match(new RegExp(params.identifier, 'i')));
                        predicates.push(pi.identifier.match(new RegExp(params.identifierPrefix, 'i')));
                    }
                    if (!_.isEmpty(nameParts)) {
                        var nameSearchCondition = [];
                        if (!_.isEmpty(nameParts)) {
                            angular.forEach(nameParts, function (namePart) {
                                nameSearchCondition.push(lf.op.or(p.givenName.match(new RegExp(namePart, 'i')), p.middleName.match(new RegExp(namePart, 'i')),
                                    p.familyName.match(new RegExp(namePart, 'i')), pi.identifier.match(new RegExp(namePart, 'i'))));
                            });
                            predicates.push(lf.op.and.apply(null, nameSearchCondition));
                        }
                    }

                    if (!_.isEmpty(params.customAttribute)) {
                        params.customAttribute = params.customAttribute.replace('%', '.');
                        predicates.push(pa.attributeTypeId.in(_.map(attributeTypeIds, function (attributeTypeId) {
                            return attributeTypeId.attributeTypeId;
                        })));

                        predicates.push(pa.attributeValue.match(new RegExp(params.customAttribute, 'i')));
                    }

                    predicates.push(p.voided.eq(false));
                    var whereCondition = lf.op.and.apply(null, predicates);

                    if (!_.isEmpty(predicates)) {
                        query = query.where(whereCondition);
                    }

                    query.limit(50).skip(params.startIndex).orderBy(p.dateCreated, lf.Order.DESC).groupBy(p.uuid).exec()
                        .then(function (tempResults) {
                            var query = db.select(pi.primaryIdentifier.as('identifier'), pi.extraIdentifiers.as('extraIdentifiers'), p.givenName.as('givenName'), p.middleName.as('middleName'), p.familyName.as('familyName'),
                                p.dateCreated.as('dateCreated'), p.birthdate.as('birthdate'), p.gender.as('gender'), p.uuid.as('uuid'), padd[addressFieldName],
                                pat.attributeName.as('attributeName'), pa.attributeValue.as('attributeValue'), pat.format.as('attributeFormat'))
                                .from(p)
                                .innerJoin(padd, p.uuid.eq(padd.patientUuid))
                                .leftOuterJoin(pi, p.uuid.eq(pi.patientUuid))
                                .leftOuterJoin(pa, p.uuid.eq(pa.patientUuid))
                                .leftOuterJoin(pat, pa.attributeTypeId.eq(pat.attributeTypeId))
                                .where(p.uuid.in(_.map(tempResults, function (tempResult) {
                                    return tempResult.uuid;
                                }))).orderBy(p.dateCreated, lf.Order.DESC);

                            return query.exec()
                                .then(function (results) {
                                    var groupedResults = _.groupBy(results, function (res) {
                                        return res.uuid;
                                    });
                                    var patient;

                                    angular.forEach(groupedResults, function (groupedResult) {
                                        var customAttributes = {};
                                        patient = groupedResult[0];
                                        // ToDo:: Dependency of age factory in Admin page
                                        patient.age = age.fromBirthDate(patient.birthdate).years;
                                        patient.image = "../images/blank-user.png";

                                        angular.forEach(groupedResult, function (result) {
                                            if (result.attributeName) {
                                                customAttributes[result.attributeName] = result.attributeValue;
                                            }
                                        });
                                        patient.customAttribute = JSON.stringify(customAttributes);
                                        patient.extraIdentifiers = JSON.stringify(patient.extraIdentifiers);
                                        patient.addressFieldValue[camelCaseToSnakeCase(addressFieldName)] = patient.addressFieldValue[addressFieldName];
                                        response.data.pageOfResults.push(patient);
                                    });
                                    $rootScope.searching = false;

                                    defer.resolve(response);
                                });
                        }, function (e) {
                            console.log(e);
                            defer.reject(e);
                        });
                });
            return defer.promise;
        };

        var init = function (_db) {
            db = _db;
        };

        return {
            search: search,
            init: init
        };
    }]);
