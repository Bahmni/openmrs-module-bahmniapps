angular.module('opd.patient.services', []);
angular.module('opd.patient.controllers', ['opd.patient.services', 'infinite-scroll']);
angular.module('opd.patient', ['opd.patient.services', 'opd.patient.controllers']);

