'use strict';

(function () {
    var mapDrug = function (drug) {
        return {
            'drug': {
                'name': drug.name,
                'uuid': drug.uuid,
                'form': drug.dosageForm.display
            },
            'value': drug.name
        }
    };

    var $inject = ['$scope', 'drugService'];
    var OrderTemplateController = function ($scope, drugService) {
        var search = function (request, drugConceptUuid) {
            return drugService.search(request.term, drugConceptUuid);
        };
        $scope.getDrugResults = function () {
            return _.partial(_.map, _, mapDrug);
        };
        $scope.getDrugsOfAConcept = function (concept) {
            return _.partial(search, _, concept.uuid);
        };
        $scope.onSelectOfDrug = function (index) {
            return function (selectedDrug) {
                $scope.orderSet.orderSetMembers[index].orderTemplate.drug = selectedDrug.drug;
            };
        };
    };

    OrderTemplateController.$inject = $inject;
    angular.module('bahmni.common.domain').controller('OrderTemplateController', OrderTemplateController);
})();
