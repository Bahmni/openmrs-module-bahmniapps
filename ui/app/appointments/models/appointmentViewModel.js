'use strict';

Bahmni.Appointments.AppointmentViewModel = (function () {
    var Appointment = function (appointmentDetails) {
        angular.extend(this, appointmentDetails);
    };

    Appointment.create = function (appointmentDetails, config) {
        var getDateWithoutTime = function (dateTime) {
            return dateTime ? new Date(moment(dateTime)) : undefined;
        };

        var getTimeWithoutDate = function (dateTime) {
            return dateTime ? moment(dateTime).format('hh:mm a') : undefined;
        };

        var parsePatient = function (patientInfo) {
            var patient = {};
            patient.label = patientInfo.name + " (" + patientInfo.identifier + ")";
            patient.uuid = patientInfo.uuid;
            return patient;
        };

        var getSpecialityFromConfig = function (selectedSpeciality, config) {
            var specialities = config.specialities;
            return _.find(specialities, function (speciality) {
                return selectedSpeciality.uuid === speciality.uuid;
            });
        };

        var getProviderFromConfig = function (selectedProvider, config) {
            var providers = config.providers;
            return _.find(providers, function (provider) {
                return selectedProvider.uuid === provider.uuid;
            });
        };

        var getLocationFromConfig = function (selectedLoc, config) {
            var locations = config.locations;
            return _.find(locations, function (location) {
                return location.uuid === selectedLoc.uuid;
            });
        };

        var getServiceFromConfig = function (selectedService, config) {
            var services = config.services;
            return _.find(services, function (service) {
                return selectedService.uuid === service.uuid;
            });
        };

        var getServiceTypeFromConfig = function (selectedServiceType, config) {
            var serviceTypes = config.selectedService.serviceTypes;
            return _.find(serviceTypes, function (serviceType) {
                return serviceType.uuid === selectedServiceType.uuid;
            });
        };

        var appointment = new Appointment({
            uuid: appointmentDetails.uuid,
            patient: appointmentDetails.patient && parsePatient(appointmentDetails.patient),
            speciality: appointmentDetails.service && getSpecialityFromConfig(appointmentDetails.service.speciality, config),
            service: appointmentDetails.service && getServiceFromConfig(appointmentDetails.service, config),
            serviceType: appointmentDetails.serviceType && getServiceTypeFromConfig(appointmentDetails.serviceType, config),
            providers: appointmentDetails.providers || [],
            location: appointmentDetails.location && getLocationFromConfig(appointmentDetails.location, config),
            date: getDateWithoutTime(appointmentDetails.startDateTime),
            startTime: getTimeWithoutDate(appointmentDetails.startDateTime),
            endTime: getTimeWithoutDate(appointmentDetails.endDateTime),
            appointmentKind: appointmentDetails.appointmentKind,
            status: appointmentDetails.status,
            comments: appointmentDetails.comments
        });
        return appointment;
    };

    return Appointment;
})();
