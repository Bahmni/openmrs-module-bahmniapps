'use strict';

angular.module('bahmni.common.offline')
    .service('offlineSearchDbService', ['$http', '$q', '$rootScope', 'age', function ($http, $q, $rootScope, age) {

        var db;

        var search = function (params) {
            var response = {
                pageOfResults: []
            };
            if ($rootScope.searching) {
                response.pageOfResults.push({});
                return $q.when(response);
            }
            $rootScope.searching = true;
            var nameParts = null;
            if (params.q) {
                nameParts = params.q.split(" ");
                for(var i = 0; i < nameParts.length; i++){
                    nameParts[i] = nameParts[i].replace('%', '.');
                }
            }

            if (!params.patientAttributes) {
                params.patientAttributes = "";
            }

            var addressFieldName = null;
            if (params.address_field_name) {
                addressFieldName = params.address_field_name.replace("_", "");
            }

            var p = db.getSchema().table('patient');
            var pa = db.getSchema().table('patient_attribute');
            var pat = db.getSchema().table('patient_attribute_type');
            var padd = db.getSchema().table('patient_address');

            return db.select(pat.attributeTypeId)
                .from(pat)
                .where(pat.attributeName.in(params.patientAttributes)).exec()
                .then(function (attributeTypeIds) {


                    var query = db.select(p.uuid.as('uuid'))
                        .from(p)
                        .innerJoin(padd, p.uuid.eq(padd.patientUuid))
                        .leftOuterJoin(pa, p.uuid.eq(pa.patientUuid))
                        .leftOuterJoin(pat, pa.attributeTypeId.eq(pat.attributeTypeId));
                    var predicates = [];

                    if (!_.isEmpty(params.address_field_value)) {
                        params.address_field_value = params.address_field_value.replace('%','.');
                        predicates.push(padd[addressFieldName].match(new RegExp(params.address_field_value, 'i')));
                    }

                    if (!_.isEmpty(params.identifier)) {
                        params.identifier = params.identifier.replace('%','.');
                        predicates.push(p.identifier.match(new RegExp(params.identifier, 'i')));
                        predicates.push(p.identifier.match(new RegExp(params.identifierPrefix,'i')));
                    }
                    if (!_.isEmpty(nameParts)) {
                        var nameSearchCondition = [];
                        if (!_.isEmpty(nameParts)) {
                            angular.forEach(nameParts, function (namePart) {
                                nameSearchCondition.push(lf.op.or(p.givenName.match(new RegExp(namePart, 'i')), p.middleName.match(new RegExp(namePart, 'i')),
                                    p.familyName.match(new RegExp(namePart, 'i')), p.identifier.match(new RegExp(namePart, 'i'))));
                            });
                            predicates.push(lf.op.and.apply(null, nameSearchCondition));
                        }
                    }

                    if (!_.isEmpty(params.custom_attribute)) {
                        params.custom_attribute = params.custom_attribute.replace('%','.');
                        predicates.push(pa.attributeTypeId.in(_.map(attributeTypeIds, function (attributeTypeId) {
                            return attributeTypeId.attributeTypeId;
                        })));

                        predicates.push(pa.attributeValue.match(new RegExp(params.custom_attribute, 'i')));
                    }

                    var whereCondition = lf.op.and.apply(null, predicates);

                    if (!_.isEmpty(predicates)) {
                        query = query.where(whereCondition);
                    }


                    return query.limit(50).skip(params.startIndex).orderBy(p.dateCreated, lf.Order.DESC).groupBy(p.uuid).exec()
                        .then(function (tempResults) {
                            return db.select(p.identifier.as('identifier'), p.givenName.as('givenName'), p.middleName.as('middleName'), p.familyName.as('familyName'),
                                p.dateCreated.as('dateCreated'), p.birthdate.as('birthdate'), p.gender.as('gender'), p.uuid.as('uuid'), padd[addressFieldName].as('addressFieldValue'),
                                pat.attributeName.as('attributeName'), pa.attributeValue.as('attributeValue'), pat.format.as('attributeFormat'))
                                .from(p)
                                .innerJoin(padd, p.uuid.eq(padd.patientUuid))
                                .leftOuterJoin(pa, p.uuid.eq(pa.patientUuid))
                                .leftOuterJoin(pat, pa.attributeTypeId.eq(pat.attributeTypeId))
                                .where(p.uuid.in(_.map(tempResults, function (tempResult) {
                                    return tempResult.uuid;
                                }))).exec()
                                .then(function (results) {

                                    var groupedResults = _.groupBy(results, function (res) {
                                        return res.uuid
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

                                    return response;

                                });

                        }, function (e) {
                            console.log(e);
                        });
                });
        };

        var init = function(_db){
            db = _db;
        };

        return {
            search: search,
            init: init
        }
    }]);