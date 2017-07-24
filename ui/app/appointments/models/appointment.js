'use strict';

Bahmni.Appointments.Appointment = (function () {
    var timeFormat = 'HH:mm:ss';
    var Appointment = function (appointmentDetails) {
        angular.extend(this, appointmentDetails);
    };

    Appointment.create = function (appointmentDetails) {
        var dateUtil = Bahmni.Common.Util.DateUtil;
        var getDateTime = function (appointmentDate, givenTime) {
            return dateUtil.parseLongDateToServerFormat(dateUtil.getDateWithoutTime(appointmentDate) + ' ' + givenTime);
        };
        var appointment = new Appointment({
            patientUuid: appointmentDetails.patientUuid,
            comments: appointmentDetails.comments,
            appointmentsKind: appointmentDetails.appointmentsKind,
            startDateTime: getDateTime(appointmentDetails.date, appointmentDetails.startTime),
            endDateTime: getDateTime(appointmentDetails.date, appointmentDetails.endTime),
            providerUuid: appointmentDetails.providerUuid,
            locationUuid: appointmentDetails.locationUuid,
            serviceUuid: appointmentDetails.serviceUuid,
            serviceTypeUuid: appointmentDetails.serviceTypeUuid,
            status: 'Scheduled'
        });
        return appointment;
    };

    return Appointment;
})();

