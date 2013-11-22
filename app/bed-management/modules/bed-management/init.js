'use strict';

var Bahmni = Bahmni || {};
Bahmni.Opd = Bahmni.Opd || {};
Bahmni.Opd.BedManagement = Bahmni.Opd.BedManagement || {};

angular.module('opd.bedManagement.services', []);
angular.module('opd.bedManagement.controllers', ['opd.bedManagement.services']);
angular.module('opd.bedManagement', ['opd.bedManagement.controllers', 'opd.bedManagement.services' ]);