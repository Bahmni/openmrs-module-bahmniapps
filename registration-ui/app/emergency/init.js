'use strict';

var Bahmni = Bahmni || {};
Bahmni.Registration = Bahmni.Registration || {};
Bahmni.Registration.Emergency = Bahmni.Registration.Emergency || {};

angular.module('registration.emergency.controllers', ['registration.patient.models', 'registration.patient.services']);
angular.module('registration.emergency', ['registration.emergency.controllers', 'registration.util']);