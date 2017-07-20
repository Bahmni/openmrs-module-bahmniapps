'use strict';

angular.module('bahmni.clinical')
    .factory('treatmentService', ['$q', 'appService', 'offlineDbService', 'offlineService', 'androidDbService',
        function ($q, appService, offlineDbService, offlineService, androidDbService) {
            if (offlineService.isAndroidApp()) {
                offlineDbService = androidDbService;
            }

            var createDrugOrder = function (drugOrder) {
                return Bahmni.Clinical.DrugOrder.create(drugOrder);
            };

            var getPrescribedAndActiveDrugOrders = function (patientUuid, numberOfVisits, getOtherActive,
                                                         visitUuids, startDate, endDate, getEffectiveOrdersOnly) {
                var params = {
                    patientUuid: patientUuid,
                    numberOfVisits: numberOfVisits,
                    getOtherActive: getOtherActive,
                    visitUuids: visitUuids,
                    startDate: startDate,
                    endDate: endDate,
                    getEffectiveOrdersOnly: getEffectiveOrdersOnly
                };
                var deferred = $q.defer();
                var visitDrugOrders = [];
                offlineDbService.getVisitsByPatientUuid(patientUuid, numberOfVisits).then(function (visits) {
                    var mappedVisitUuids = _.map(visits, function (visit) {
                        return visit.uuid;
                    });
                    if (mappedVisitUuids && mappedVisitUuids.length === 0) {
                        deferred.resolve({"data": {}});
                    }
                    params.visitUuids = mappedVisitUuids || [];
                    offlineDbService.getPrescribedAndActiveDrugOrders(params).then(function (results) {
                        _.each(results, function (result) {
                            var drugOrders = result.encounter.drugOrders ? result.encounter.drugOrders : [];
                            _.each(visits, function (visit) {
                                if (result.encounter.visitUuid === visit.uuid) {
                                    result.encounter.visit = {startDateTime: visit.startDatetime};
                                }
                            });
                            _.each(drugOrders, function (drugOrder) {
                                drugOrder.provider = result.encounter.providers[0];
                                drugOrder.creatorName = result.encounter.providers[0].name;
                                drugOrder.visit = result.encounter.visit;
                            });
                            visitDrugOrders = visitDrugOrders.concat(drugOrders);
                        });
                        var uuids = [];
                        _.each(visitDrugOrders, function (visitDrugOrder) {
                            if (visitDrugOrder.previousOrderUuid) {
                                uuids.push(visitDrugOrder.previousOrderUuid);
                            }
                        });

                        for (var index = 0; index < visitDrugOrders.length; index++) {
                            for (var indx = 0; indx < uuids.length; indx++) {
                                if (uuids[indx] === visitDrugOrders[index].uuid) {
                                    visitDrugOrders.splice(index, 1);
                                }
                            }
                        }

                        var response = {visitDrugOrders: visitDrugOrders};
                        for (var key in response) {
                            response[key] = response[key].map(createDrugOrder);
                        }
                        deferred.resolve({"data": response});
                    });
                });
                return deferred.promise;
            };

            var getConfig = function () {
                return offlineDbService.getReferenceData('DrugOrderConfig');
            };

            var getProgramConfig = function () {
                var programConfig = appService.getAppDescriptor() ? appService.getAppDescriptor().getConfigValue("program") || {} : {};
                return programConfig;
            };

            var getActiveDrugOrders = function () {
                return $q.when({"data": {}});
            };

            var getPrescribedDrugOrders = function () {
                return $q.when({"data": {}});
            };

            var getNonCodedDrugConcept = function () {
                var deferred = $q.defer();
                offlineDbService.getReferenceData('NonCodedDrugConcept').then(function (response) {
                    deferred.resolve(response.data);
                });
                return deferred.promise;
            };

            var getAllDrugOrdersFor = function () {
                return $q.when({"data": {}});
            };

            var voidDrugOrder = function (drugOrder) {
                return $q.when({"data": {}});
            };

            return {
                getActiveDrugOrders: getActiveDrugOrders,
                getConfig: getConfig,
                getPrescribedDrugOrders: getPrescribedDrugOrders,
                getPrescribedAndActiveDrugOrders: getPrescribedAndActiveDrugOrders,
                getNonCodedDrugConcept: getNonCodedDrugConcept,
                getAllDrugOrdersFor: getAllDrugOrdersFor,
                voidDrugOrder: voidDrugOrder
            };
        }]);
