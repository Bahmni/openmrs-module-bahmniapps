angular.module('bahmni.common.impression', [])
    .directive('impression', ['$rootScope', 'observationsService', 'encounterService', function ($rootScope, observationsService, encounterService) {

        var link = function ($scope, element) {
            $scope.newSourceObs = {
                value:"",
                concept:{
                    uuid:$rootScope.radiologyImpressionConcept.uuid
                },
                targetObsRelation:{
                    relationshipType:"qualified-by",
                    targetObs:{
                        uuid:$scope.targetObs.uuid
                    }
                }
            };

            $scope.saveImpression = function(){
                var bahmniEncounterTransaction = mapBahmniEncounterTransaction();
                encounterService.create(bahmniEncounterTransaction);
            };

            var mapBahmniEncounterTransaction = function(){
                return {
                    visitUuid: $rootScope.visit.uuid,
                    patientUuid: $rootScope.patient.uuid,
                    encounterTypeUuid: $rootScope.encounterConfig.getOpdConsultationEncounterTypeUuid(),
                    observations: [$scope.newSourceObs]
                };
            };


            observationsService.getObsRelationship($scope.targetObs.uuid).then(function (response) {
                $scope.sourceObs = response.data;
            });
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
