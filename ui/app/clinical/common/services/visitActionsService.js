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
    .factory('visitActionsService', ['printer', function (printer) {
        return {
            printPrescription: function (patient, visitDate, visitUuid, printParams) {
                printer.print('common/views/prescriptionPrint.html', {patient: patient, visitDate: visitDate, visitUuid: visitUuid, printParams: printParams});
            }
        };
    }]);
