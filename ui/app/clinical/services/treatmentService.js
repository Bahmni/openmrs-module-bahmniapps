'use strict';

angular.module('bahmni.clinical')
    .factory('TreatmentService', ['$http', '$q', function ($http, $q) {
        var dateUtil = Bahmni.Common.Util.DateUtil,
            activeDrugs = function (drugOrder) {
                return (!drugOrder.autoExpireDate || dateUtil.diffInDays(new Date(), new Date(drugOrder.autoExpireDate)) >= 0);
            },
            toViewModel = function (drugOrder) {
                return Bahmni.Clinical.DrugOrder.createFromOpenMRSRest(drugOrder);
            };

        var getDrugOrders = function (patientUuid) {
            return $http.get(Bahmni.Common.Constants.orderUrl,
                {
                    method: "GET",
                    params: { v: 'custom:(startDate,autoExpireDate,orderer,discontinuedDate,dose,units,prn,frequency,drug,concept:(uuid))',
                        t: "drugorder",
                        patient: patientUuid
                    },
                    withCredentials: true
                }
            );
        };

        var getActiveDrugOrders = function (patientUuid) {
            var allDrugOrders = getDrugOrders(patientUuid);
            return allDrugOrders.then(function (httpResponse) {
                var response = httpResponse.data;
                var deferred = $q.defer();
                var activeDrugOrders = response.results.filter(activeDrugs).map(toViewModel);
                deferred.resolve(activeDrugOrders);
                return deferred.promise;
            });
        };

        return {
            getActiveDrugOrders: getActiveDrugOrders
        };
    }]);