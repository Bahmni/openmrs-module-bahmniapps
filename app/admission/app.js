'use strict';

angular.module('admission', ['opd.admission', 'bahmni.common.infrastructure', 'bahmni.common.patient'])
angular.module('admission').config(['$routeProvider', function ($routeProvider) {
    	$routeProvider.when("/:patientUuid", { templateUrl: 'modules/admission/views/admissionForm.html',  controller: 'AdmissionController', resolve: {initialization:'initialization'} });
	}]);