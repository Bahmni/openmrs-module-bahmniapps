'use strict';

angular.module('bahmni.common.uiHelper')
    .service('offlineSearchService', ['$http', '$q', '$rootScope', 'age', function ($http, $q, $rootScope, age) {

        var search = function (params) {
            var response = {
                pageOfResults: []
            };
            if ($rootScope.searching) {
                response.pageOfResults.push({});
                return $q.when(response);
            }
            $rootScope.searching = true;
            var deferred = $q.defer();
            var nameParts = null;
            if (params.q) {
                nameParts = params.q.split(" ");
            }

            if (!params.patientAttributes) {
                params.patientAttributes = "";
            }

            var addressFieldName = null;
            if (params.address_field_name) {
                addressFieldName = params.address_field_name.replace("_", "");
            }

            var p = $rootScope.db.getSchema().table('patient');
            var pa = $rootScope.db.getSchema().table('patient_attributes');
            var pat = $rootScope.db.getSchema().table('patient_attribute_types');
            var padd = $rootScope.db.getSchema().table('patient_address');

            $rootScope.db.select(pat.attributeTypeId)
                .from(pat)
                .where(pat.attributeName.in(params.patientAttributes)).exec()
                .then(function (attributeTypeIds) {


                    var query = $rootScope.db.select(p.identifier.as('identifier'))
                        .from(p)
                        .innerJoin(padd, p._id.eq(padd.patientId))
                        .leftOuterJoin(pa, p._id.eq(pa.patientId))
                        .leftOuterJoin(pat, pa.attributeTypeId.eq(pat.attributeTypeId));
                    var predicates = [];

                    if (!_.isEmpty(params.address_field_value)) {
                        predicates.push(padd[addressFieldName].match(new RegExp(params.address_field_value, 'i')));
                    }

                    if (!_.isEmpty(params.identifier)) {
                        predicates.push(p.identifier.eq(params.identifierPrefix + params.identifier));
                    }
                    if (!_.isEmpty(nameParts)) {
                        var nameSearchCondition = [];
                        if (!_.isEmpty(nameParts)) {
                            angular.forEach(nameParts, function (namePart) {
                                nameSearchCondition.push(lf.op.or(p.givenName.match(new RegExp(namePart, 'i')), p.middleName.match(new RegExp(namePart, 'i')),
                                    p.familyName.match(new RegExp(namePart, 'i')), p.identifier.eq(namePart.toUpperCase())));
                            });
                            predicates.push(lf.op.and.apply(null, nameSearchCondition));
                        }
                    }

                    if (!_.isEmpty(params.custom_attribute)) {
                        predicates.push(pa.attributeTypeId.in(_.map(attributeTypeIds, function (attributeTypeId) {
                            return attributeTypeId.attributeTypeId;
                        })));
                        predicates.push(pa.attributeValue.match(new RegExp(params.custom_attribute, 'i')));
                    }

                    var whereCondition = lf.op.and.apply(null, predicates);

                    if (!_.isEmpty(predicates))
                        query = query.where(whereCondition);

                    query.limit(50).skip(params.startIndex).orderBy(p.dateCreated, lf.Order.DESC).groupBy(p.identifier).exec()
                        .then(function (tempResults) {
                            $rootScope.db.select(p.identifier.as('identifier'), p.givenName.as('givenName'), p.middleName.as('middleName'), p.familyName.as('familyName'),
                                p.dateCreated.as('dateCreated'), p.birthdate.as('birthdate'), p.gender.as('gender'), p.uuid.as('uuid'), padd[addressFieldName].as('addressFieldValue'),
                                pat.attributeName.as('attributeName'), pa.attributeValue.as('attributeValue'), pat.format.as('attributeFormat'))
                                .from(p)
                                .innerJoin(padd, p._id.eq(padd.patientId))
                                .leftOuterJoin(pa, p._id.eq(pa.patientId))
                                .leftOuterJoin(pat, pa.attributeTypeId.eq(pat.attributeTypeId))
                                .where(p.identifier.in(_.map(tempResults, function (tempResult) {
                                    return tempResult.identifier;
                                }))).exec()
                                .then(function (results) {
                                    var groupedResults = _.groupBy(results, function (res) {
                                        return res.identifier
                                    });
                                    var patient;
                                    angular.forEach(groupedResults, function (groupedResult) {
                                        var customAttributes = {};
                                        patient = groupedResult[0];
                                        //ToDo:: Dependency of age factory in Admin page
                                        patient.age = age.fromBirthDate(patient.birthdate).years;
                                        angular.forEach(groupedResult, function (result) {
                                            if (result.attributeName) {
                                                customAttributes[result.attributeName] = result.attributeValue;
                                            }
                                        });
                                        patient.customAttribute = JSON.stringify(customAttributes);
                                        response.pageOfResults.push(patient);
                                    });
                                    $rootScope.searching = false;
                                    deferred.resolve(response);
                                });

                        }, function (e) {
                            console.log(e);
                        });
                });
            return deferred.promise;
        };

        return {
            search: search
        }
    }]);