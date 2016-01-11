'use strict'

angular.module('bahmni.common.domain')
    .controller('OrderTemplateController', ['$scope', '$state', '$http', 'orderSetService', 'spinner', function ($scope, $state, $http, orderSetService, spinner) {

        console.log($scope);
        $scope.getDrugResults = function () {
            return function (results) {
                return results.map(function (drug) {
                    return {
                        'template': {
                            'name': drug.name,
                            'uuid': drug.uuid,
                            'form': drug.dosageForm.display
                        },
                        'value': drug.dosageForm ? drug.name + " (" + drug.dosageForm.display + ")" : drug.name
                    }
                });
            }
        };

        $scope.getDrugsOfAConcept = function (concept) {
            return function (request) {
                return $http.get(Bahmni.Common.Constants.drugUrl, {
                    method: "GET",
                    params: {
                        v: 'custom:(uuid,name,doseStrength,units,dosageForm,concept:(uuid,name,names:(name)))',
                        conceptUuid: concept.uuid,
                        q: request.term
                    },
                    withCredentials: true
                }).then(function (response) {
                    return response.data.results;
                });
            }
        };

        $scope.onSelectOfDrug = function (index) {
            return function (selectedDrug) {
                $scope.orderSet.orderSetMembers[index].orderTemplate.name = selectedDrug.template.name;
                $scope.orderSet.orderSetMembers[index].orderTemplate.uuid = selectedDrug.template.uuid;
                $scope.orderSet.orderSetMembers[index].orderTemplate.form = selectedDrug.template.form;
            };
        };
    }]
)