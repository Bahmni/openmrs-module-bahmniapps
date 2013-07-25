'use strict';

angular.module('opd', ['opd.consultation', 'opd.patient'])
angular.module('opd').config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/patient/:patientUuid/consultation', {templateUrl: 'modules/consultation/views/consultation.html', controller: 'ConsultationController', resolve: {initialization: 'initialization'}});
        $routeProvider.when('/patient/:patientUuid/diagnosis', {templateUrl: 'modules/consultation/views/addObservation.html', controller: 'DiagnosisController', resolve: {initialization: 'initialization'}});
        $routeProvider.when('/patient/:patientUuid/treatment', {templateUrl: 'modules/consultation/views/addObservation.html', controller: 'TreatmentController', resolve: {initialization: 'initialization'}});
        $routeProvider.when('/patient/:patientUuid/investigation', {templateUrl: 'modules/consultation/views/investigations.html', controller: 'InvestigationController', resolve: {initialization: 'initialization'}});
        $routeProvider.when('/patient/:patientUuid/notes', {templateUrl: 'modules/consultation/views/notes.html'});
        $routeProvider.when('/patient/:patientUuid/templates', {templateUrl: 'modules/consultation/views/comingSoon.html'});
        $routeProvider.when(Bahmni.Opd.Constants.activePatientsListUrl , { templateUrl: 'modules/patient/views/activePatientsList.html', controller: 'ActivePatientsListController', resolve: {initialization: 'initialization'}});
        $routeProvider.when('/column' , { templateUrl: 'modules/tree-select/views/tree-selector.html', controller: 'TreeSelectController', resolve: {initialization: 'initialization'}});
        $routeProvider.otherwise({redirectTo: Bahmni.Opd.Constants.activePatientsListUrl});
}]).run(['$rootScope', function($rootScope){
  $rootScope.currentConsultation = {};
  $rootScope.currentPatient = Bahmni.Opd.dummyPatient(); // TODO: Set it to null once mapping patient story is palyed
}]);