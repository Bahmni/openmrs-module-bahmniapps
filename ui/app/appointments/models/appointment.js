'use strict';

Bahmni.Appointments.Appointment = (function () {
    var Appointment = function (appointmentDetails) {
        angular.extend(this, appointmentDetails);
    };

    Appointment.create = function (appointmentDetails) {
        var dateUtil = Bahmni.Common.Util.DateUtil;
        var getDateTime = function (appointmentDate, givenTime) {
            if (!appointmentDate && !givenTime) return appointmentDate;
            return dateUtil.parseServerDateToDate(dateUtil.getDateWithoutTime(appointmentDate) + ' ' + givenTime);
        };
        var appointment = new Appointment({
            patientUuid: appointmentDetails.patientUuid,
            comments: appointmentDetails.comments,
            appointmentKind: appointmentDetails.appointmentKind,
            startDateTime: getDateTime(appointmentDetails.date, appointmentDetails.startTime),
            endDateTime: getDateTime(appointmentDetails.date, appointmentDetails.endTime),
            providerUuid: appointmentDetails.providerUuid,
            locationUuid: appointmentDetails.locationUuid,
            serviceUuid: appointmentDetails.serviceUuid,
            serviceTypeUuid: appointmentDetails.serviceTypeUuid,
            status: appointmentDetails.status
        });
        return appointment;
    };

    return Appointment;
})();

