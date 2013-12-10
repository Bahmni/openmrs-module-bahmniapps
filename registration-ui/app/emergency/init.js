'use strict';

var Bahmni = Bahmni || {};
Bahmni.Registration = Bahmni.Registration || {};
Bahmni.Registration.Emergency = Bahmni.Registration.Emergency || {};

angular.module('registration.emergency.controllers', ['registration.patient.models', 'registration.patient.services','registration.patient.directives']);
angular.module('registration.emergency', ['registration.emergency.controllers', 'registration.util']);