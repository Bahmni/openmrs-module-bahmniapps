angular.module('opd.admission.services', []);
angular.module('opd.admission.controllers', ['opd.admission.services','bahmni.common.infrastructure.mappers']);
angular.module('opd.admission', ['opd.admission.controllers']);