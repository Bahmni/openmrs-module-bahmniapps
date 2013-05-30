'use strict';


angular.module('opd', ['opd.navigation','opd.diagnosisController','opd.treatmentController','opd.instructionController'])
angular.module('opd').config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/patient/:patientUuid/consultation', {templateUrl: 'modules/opd/views/consultation.html', controller: 'NavigationController'});
        $routeProvider.when('/patient/:patientUuid/diagnosis', {templateUrl: 'modules/opd/views/addObservation.html', controller: 'DiagnosisController'});
        $routeProvider.when('/patient/:patientUuid/treatment', {templateUrl: 'modules/opd/views/addObservation.html', controller: 'TreatmentController'});
        $routeProvider.when('/patient/:patientUuid/instruction', {templateUrl: 'modules/opd/views/addObservation.html', controller: 'InstructionController'});
        $routeProvider.when('/patient/:patientUuid/templates', {templateUrl: 'modules/navigation/views/comingSoon.html'});
        $routeProvider.otherwise('/blank', {templateUrl: 'modules/navigation/views/comingSoon.html'});
    }]);