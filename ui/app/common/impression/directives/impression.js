angular.module('bahmni.common.impression', [])
    .directive('impression', ['$rootScope', 'observationsService', 'encounterService', 'spinner', function ($rootScope, observationsService, encounterService, spinner) {

        var link = function ($scope) {
            var constructNewSourceObs = function() {
                $scope.newSourceObs = {
                    value: "",
                    concept: {
                        uuid: $rootScope.radiologyImpressionConcept.uuid
                    },
                    targetObsRelation: {
                        relationshipType: "qualified-by",
                        targetObs: {
                            uuid: $scope.targetObs.uuid
                        }
                    }
                };
            };

            var init = function(){
                return observationsService.getObsRelationship($scope.targetObs.uuid).then(function (response) {
                    $scope.sourceObs = response.data;
                    constructNewSourceObs();
                });
            };

            $scope.saveImpression = function(){
                var bahmniEncounterTransaction = mapBahmniEncounterTransaction();
                spinner.forPromise(encounterService.create(bahmniEncounterTransaction).then(init));
            };

            var mapBahmniEncounterTransaction = function(){
                return {
                    visitUuid: $rootScope.activeVisit.uuid,
                    patientUuid: $rootScope.patient.uuid,
                    encounterTypeUuid: $rootScope.encounterConfig.getOpdConsultationEncounterTypeUuid(),
                    observations: [$scope.newSourceObs]
                };
            };

            spinner.forPromise(init());
        };


        return {
            link: link,
            scope: {
                targetObs: "=",
                sourceConcept: "=",
                consultationObservations: "="
            },
            templateUrl: '../common/impression/views/impression.html'
        }
    }]);
