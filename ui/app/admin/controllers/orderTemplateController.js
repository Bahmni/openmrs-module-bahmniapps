/*
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at https://www.bahmni.org/license/mplv2hd.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */

'use strict';

(function () {
    var mapResult = function (drug) {
        return {
            'drug': {
                'name': drug.name,
                'uuid': drug.uuid,
                'form': drug.dosageForm.display,
                'drugReferenceMaps': drug.drugReferenceMaps || []
            },
            'value': drug.name
        };
    };
    var selectDrug = function (selectedTemplate, orderSetMember) {
        orderSetMember.orderTemplate.drug = selectedTemplate.drug;
    };
    var deleteDrugIfDrugNameIsEmpty = function (orderSetMember) {
        if (!orderSetMember.orderTemplate.drug.name) {
            orderSetMember.orderTemplate.drug = {};
        }
    };

    var $inject = ['$scope', 'drugService'];
    var OrderTemplateController = function ($scope, drugService) {
        var search = function (request, orderSetMember) {
            return drugService.search(request.term, orderSetMember.concept.uuid)
                .then(_.partial(_.map, _, mapResult));
        };
        $scope.getDrugsOf = function (orderSetMember) {
            return _.partial(search, _, orderSetMember);
        };
        $scope.onSelectOfDrug = function (orderSetMember) {
            return _.partial(selectDrug, _, orderSetMember);
        };
        $scope.onChange = deleteDrugIfDrugNameIsEmpty;
        $scope.isRuleMode = function (orderSetMember) {
            return typeof orderSetMember.orderTemplate.dosingInstructions !== 'undefined' &&
                orderSetMember.orderTemplate.dosingInstructions.dosingRule != null;
        };
    };

    OrderTemplateController.$inject = $inject;
    angular.module('bahmni.common.domain').controller('OrderTemplateController', OrderTemplateController);
})();
