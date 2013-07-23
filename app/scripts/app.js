'use strict';

angular.module('opd', ['opd.consultation', 'opd.patient'])
angular.module('opd').config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/patient/:patientUuid/consultation', {templateUrl: 'modules/consultation/views/consultation.html', controller: 'ConsultationController'});
        $routeProvider.when('/patient/:patientUuid/diagnosis', {templateUrl: 'modules/consultation/views/addObservation.html', controller: 'DiagnosisController'});
        $routeProvider.when('/patient/:patientUuid/treatment', {templateUrl: 'modules/consultation/views/addObservation.html', controller: 'TreatmentController'});
        $routeProvider.when('/patient/:patientUuid/investigation', {templateUrl: 'modules/consultation/views/investigations.html', controller: 'InvestigationController'});
        $routeProvider.when('/patient/:patientUuid/notes', {templateUrl: 'modules/consultation/views/notes.html'});
        $routeProvider.when('/patient/:patientUuid/templates', {templateUrl: 'modules/consultation/views/comingSoon.html'});
        $routeProvider.when(constants.activePatientsListUrl , { templateUrl: 'modules/patient/views/activePatientsList.html', controller: 'ActivePatientsListController'});
        $routeProvider.when('/column' , { templateUrl: 'modules/tree-select/views/tree-selector.html', controller: 'TreeSelectController'});
        $routeProvider.otherwise({redirectTo: constants.activePatientsListUrl});
    }]);