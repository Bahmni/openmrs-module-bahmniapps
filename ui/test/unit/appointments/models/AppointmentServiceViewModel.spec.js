'use strict';

describe('AppointmentServiceViewModel', function () {

    it('should change date time format to time string', function () {
        var responseFromServer =     {
            appointmentServiceId: 1,
            name: "Ortho",
            description: "Appointment service for otho related services",
            speciality: {},
            startTime: "",
            endTime: "",
            maxAppointmentsLimit: null,
            durationMins: 60,
            location: {uuid: "locationUuid"},
            uuid: "db4708d4-3620-4388-b585-19733090909b",
            color: "#00ff00",
            creatorName: null
        };

        var appointmentServiceModel = Bahmni.Appointments.AppointmentServiceViewModel.createFromResponse(responseFromServer);
        expect(appointmentServiceModel.name).toBe("Ortho");
        expect(appointmentServiceModel.description).toBe(responseFromServer.description);
        expect(appointmentServiceModel.locationUuid).toBe("locationUuid");
        expect(appointmentServiceModel.color).toBe("#00ff00");
    });
});
