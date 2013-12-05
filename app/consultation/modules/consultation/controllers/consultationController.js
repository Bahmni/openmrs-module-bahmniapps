'use strict';

angular.module('opd.consultation.controllers')
    .controller('ConsultationController', ['$scope', '$rootScope', 'encounterService', '$route', '$location', function ($scope, $rootScope, encounterService, $route, $location) {

    $scope.save = function () {
        
        var encounterData = {};
        encounterData.patientUuid = $scope.patient.uuid;
        encounterData.encounterTypeUuid = $rootScope.encounterConfig.getOpdConsultationEncounterUuid();
        encounterData.encounterDateTime = new Date();

        if ($rootScope.consultation.diagnoses && $rootScope.consultation.diagnoses.length > 0){
            encounterData.diagnoses = $rootScope.consultation.diagnoses.map(function (diagnosis) {
                return {
                    codedAnswer: { uuid: diagnosis.concept.conceptUuid },
                    order:diagnosis.order,
                    certainty:diagnosis.certainty,
                    existingObs:diagnosis.existingObsUuid
                }
            });
        }

        encounterData.testOrders = $rootScope.consultation.investigations.map(function (investigation) {
            return { uuid:investigation.uuid, concept: {uuid: investigation.concept.uuid }, orderTypeUuid:investigation.orderTypeUuid, voided: investigation.voided || false};
        });

        var startDate = new Date();
        var allTreatmentDrugs = $rootScope.consultation.treatmentDrugs || [];
        var newlyAddedTreatmentDrugs = allTreatmentDrugs.filter(function (drug) {
            return !drug.savedDrug;
        });

        if (newlyAddedTreatmentDrugs) {
            encounterData.drugOrders = newlyAddedTreatmentDrugs.map(function (drug) {
                return drug.requestFormat(startDate);
            });
        }

        encounterData.disposition = $rootScope.disposition.adtToStore;

        var addObservationsToEncounter = function(){
            if ($scope.consultation.consultationNote.value) {
                encounterData.observations = encounterData.observations || [];
                encounterData.observations.push($scope.consultation.consultationNote);
            }

            encounterData.observations = encounterData.observations || [];
            for (var i in $rootScope.observationList) {
                if ($rootScope.observationList[i]) {
                    encounterData.observations = encounterData.observations.concat($rootScope.observationList[i]);
                }
            }
        };

        addObservationsToEncounter();

        encounterService.create(encounterData).success(function () {
            window.location = Bahmni.Opd.Consultation.Constants.activePatientsListUrl;
        });
    };        
}]).directive('showObs', ['$rootScope', function () {
    return {
        restrict:'E',
        scope:{
            observation:"="
        },
        template:'<ng-include src="\'modules/consultation/views/showObservation.html\'" />'
    }
}])
.directive('expander',function(){
    return {
        restrict: 'EA',
        replace: true,
        transclude: true,
        template : '<div>' +
        '<div class="title" ng-click="toggle()">+</div>' +
        '<div class="body" ng-show="showMe" ng-transclude></div>' +
        '</div>',
        link: function(scope,element,attrs) {
            scope.showMe = false;
            scope.toggle = function toggle(){
                scope.showMe = !scope.showMe;
            }
        }
    }
});

