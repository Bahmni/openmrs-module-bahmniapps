/*
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at https://www.bahmni.org/license/mplv2hd.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */

'use strict';

angular.module('bahmni.clinical')
    .controller('CustomDrugOrderHistoryController', ['$scope', 'treatmentConfig', function ($scope, treatmentConfig) {
        var drugOrderHistoryConfig = treatmentConfig.drugOrderHistoryConfig || {};
        $scope.treatmentConfig = treatmentConfig;
        $scope.drugOrderHistorySections = _.values(drugOrderHistoryConfig.sections);
    }]);
