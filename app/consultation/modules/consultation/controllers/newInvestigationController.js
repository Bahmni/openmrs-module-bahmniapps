'use strict';

angular.module('opd.consultation.controllers')
    .controller('NewInvestigationController', ['$scope', '$q', '$rootScope', 'conceptSetService', 'spinner', function ($scope, $q, $rootScope, conceptSetService, spinner) {
        var investigations = $rootScope.consultation.investigations;

        var labConceptsPromise =conceptSetService.getConceptSetMembers('Laboratory');
        var departmentConceptsPromise = conceptSetService.getConceptSetMembers('Lab Departments');

        spinner.forPromise($q.all([labConceptsPromise, departmentConceptsPromise]).then(function(results){
            var labConceptsSet = results[0].data.results[0];
            var labDepartmentsSet = results[1].data.results[0];
            var labEntities = new Bahmni.Opd.LabConceptsMapper().map(labConceptsSet, labDepartmentsSet);           
            $scope.tests = labEntities.tests;
            $scope.panels = labEntities.panels;
            $scope.samples = labEntities.samples;
        }));
    }]
);
