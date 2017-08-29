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
