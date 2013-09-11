angular.module('opd.consultation.services', []);
angular.module('opd.consultation.controllers', ['opd.consultation.services']);
angular.module('opd.consultation', ['opd.consultation.controllers', 'opd.consultation.services',  'opd.treeSelect']);