'use strict';

(function () {
    var mapResult = function (drug) {
        return {
            'drug': {
                'name': drug.name,
                'uuid': drug.uuid,
                'form': drug.dosageForm.display
            },
            'value': drug.name
        }
    };
    var selectDrug = function (orderSetMembers, index, selectedTemplate) {
        orderSetMembers[index].orderTemplate.drug = selectedTemplate.drug;
    };
    var deleteDrugIfDrugNameIsEmpty = function (orderSetMembers, index) {
        var orderTemplate = orderSetMembers[index].orderTemplate;
        if (!orderTemplate.drug.name) {
            orderTemplate.drug = {};
        }
    };

    var $inject = ['$scope', 'drugService'];
    var OrderTemplateController = function ($scope, drugService) {
        var search = function (request, drugConceptUuid) {
            return drugService.search(request.term, drugConceptUuid);
        };
        $scope.getDrugResults = function () {
            return _.partial(_.map, _, mapResult);
        };
        $scope.getDrugsOfAConcept = function (concept) {
            return _.partial(search, _, concept.uuid);
        };
        $scope.onSelectOfDrug = function (index) {
            return _.partial(selectDrug, $scope.orderSet.orderSetMembers, index, _);
        };
        $scope.onChange = _.partial(deleteDrugIfDrugNameIsEmpty, $scope.orderSet.orderSetMembers, _);
    };

    OrderTemplateController.$inject = $inject;
    angular.module('bahmni.common.domain').controller('OrderTemplateController', OrderTemplateController);
})();
