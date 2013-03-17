'use strict';

angular.module('registration.createVisit', ['resources.patientData', 'resources.visit', 'resources.concept'])
    .controller('CreateVisitController', ['$scope', '$location', 'patientData', 'visit', 'concept', function ($scope, $location, patientData, visitService, conceptService) {
    var registrationConcepts = [];

    (function () {
        $scope.encounter = {};
        $scope.obs = {};
        $scope.visit = {};
        $scope.patient = patientData.response();

        conceptService.getRegistrationConcepts().success(function (data) {
            var concepts = data.results[0].setMembers;
            concepts.forEach(function (concept) {
                registrationConcepts.push({name:concept.name.name,uuid:concept.uuid });
            });
        });
    })();


    $scope.calculateBMI = function () {
        console.log($scope.obs);
        var weight = $scope.obs.weight;
        var height = $scope.obs.height;
        if (weight === null || height === null) {
            return;
        }
        var heightMtrs = height / 100;
        $scope.obs.bmi = weight / (heightMtrs * heightMtrs);
    };

    $scope.back = function () {
        $location.path("/create");
    }

    $scope.createVisit = function () {
        var datetime = new Date().toISOString();
        $scope.visit.patient = $scope.patient.uuid;
        $scope.visit.startDatetime = datetime;
        $scope.visit.visitType = "REG";

        $scope.encounter.patient = $scope.patient.uuid;
        $scope.encounter.encounterType = "REG";
        $scope.encounter.encounterDatetime = datetime;

        $scope.encounter.obs = [];
        registrationConcepts.forEach(function (concept) {
            var value = "70";
            $scope.encounter.obs.push({concept:concept.uuid,value:value});
        });
        $scope.visit.encounters = [$scope.encounter];

        visitService.create($scope.visit);
    };
}]);
