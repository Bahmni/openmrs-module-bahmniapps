'use strict';

var Bahmni = Bahmni || {};
Bahmni.Opd = Bahmni.Opd || {};
Bahmni.Opd.ADT = Bahmni.Opd.ADT || {};

angular.module('opd.adt.controllers', ['opd.consultation.services']);
angular.module('opd.adt', ['opd.adt.controllers','opd.conceptSet']);