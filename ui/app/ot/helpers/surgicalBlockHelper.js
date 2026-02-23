/*
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at https://www.bahmni.org/license/mplv2hd.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */


'use strict';

angular.module('bahmni.ot')
    .service('surgicalBlockHelper', ['surgicalAppointmentHelper', function (surgicalAppointmentHelper) {
        this.getAvailableBlockDuration = function (surgicalBlock) {
            var blockDuration = Bahmni.Common.Util.DateUtil.diffInMinutes(surgicalBlock.startDatetime, surgicalBlock.endDatetime);
            var appointmentsDuration = _.sumBy(_.reject(surgicalBlock.surgicalAppointments, function (appointment) {
                return (appointment.status == "POSTPONED" || appointment.status == "CANCELLED");
            }), function (surgicalAppointment) {
                return surgicalAppointmentHelper.getAppointmentDuration(surgicalAppointment.surgicalAppointmentAttributes.estTimeHours.value, surgicalAppointment.surgicalAppointmentAttributes.estTimeMinutes.value, surgicalAppointment.surgicalAppointmentAttributes.cleaningTime.value);
            });
            return blockDuration - appointmentsDuration;
        };
    }]);
