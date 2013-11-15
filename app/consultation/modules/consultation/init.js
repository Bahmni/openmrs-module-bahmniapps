'use strict';

var Bahmni = Bahmni || {};
Bahmni.Opd = Bahmni.Opd || {};
Bahmni.Opd.Consultation = Bahmni.Opd.Consultation || {};

angular.module('opd.consultation.services', []);
angular.module('opd.consultation.controllers', ['opd.consultation.services']);
angular.module('opd.consultation', ['opd.consultation.controllers', 'opd.consultation.services', 'opd.treeSelect','opd.conceptSet']);