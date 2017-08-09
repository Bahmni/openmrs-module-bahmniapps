'use strict';

Bahmni.Appointments.Appointment = (function () {
    var Appointment = function (appointmentDetails) {
        angular.extend(this, appointmentDetails);
    };

    Appointment.create = function (appointmentDetails) {
        var dateUtil = Bahmni.Common.Util.DateUtil;
        var getDateTime = function (appointmentDate, givenTime) {
            if (!appointmentDate && !givenTime) return appointmentDate;
            var formattedTime = moment(givenTime, ["hh:mm a"]).format("HH:mm");
            return dateUtil.parseServerDateToDate(dateUtil.getDateWithoutTime(appointmentDate) + ' ' + formattedTime);
        };
        var appointment = new Appointment({
            patientUuid: appointmentDetails.patientUuid,
            serviceUuid: appointmentDetails.serviceUuid,
            serviceTypeUuid: appointmentDetails.serviceTypeUuid,
            startDateTime: getDateTime(appointmentDetails.date, appointmentDetails.startTime),
            endDateTime: getDateTime(appointmentDetails.date, appointmentDetails.endTime),
            providerUuid: appointmentDetails.providerUuid,
            locationUuid: appointmentDetails.locationUuid,
            appointmentKind: appointmentDetails.appointmentKind,
            status: appointmentDetails.status,
            comments: appointmentDetails.comments
        });
        return appointment;
    };

    return Appointment;
})();

