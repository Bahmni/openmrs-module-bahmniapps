'use strict';

angular.module('bahmni.registration')
    .controller('PatientCommonController', ['$scope', '$rootScope', '$http', 'patientAttributeService', 'appService',
        function ($scope, $rootScope, $http, patientAttributeService, appService) {

            var autoCompleteFields = appService.getAppDescriptor().getConfigValue("autoCompleteFields", []);
            var showCasteSameAsLastNameCheckbox = appService.getAppDescriptor().getConfigValue("showCasteSameAsLastNameCheckbox");
            $scope.showMiddleName = appService.getAppDescriptor().getConfigValue("showMiddleName");
            $scope.genderCodes = Object.keys($rootScope.genderMap);
            $scope.dobMandatory = appService.getAppDescriptor().getConfigValue("dobMandatory") || false;

            $scope.getDeathConcepts = function () {
                var deathConcept;
                $http({
                    url: Bahmni.Common.Constants.globalPropertyUrl,
                    method: 'GET',
                    params: {
                        property: 'concept.reasonForDeath'
                    },
                    withCredentials: true,
                    transformResponse: [function(data){
                        deathConcept = data;
                        $http.get(Bahmni.Common.Constants.conceptSearchByFullNameUrl, {
                            params: {
                                name: deathConcept,
                                v: "custom:(uuid,name,set,setMembers:(uuid,display,name:(uuid,name),retired))"
                            },
                            withCredentials: true
                        }).then(function (results) {
                            $scope.deathConcepts = results.data.results[0]!=null ? results.data.results[0].setMembers:[];
                            $scope.deathConcepts = filterRetireDeathConcepts($scope.deathConcepts);
                        })
                    }]
                });

            };

            var filterRetireDeathConcepts = function(deathConcepts){
                return _.filter(deathConcepts,function(concept){
                    return !concept.retired;
                })
            };

            $scope.isAutoComplete = function (fieldName) {
                return !_.isEmpty(autoCompleteFields) ? autoCompleteFields.indexOf(fieldName) > -1 : false;
            };

            $scope.showCasteSameAsLastName = function() {
                var personAttributeHasCaste = (_.find($rootScope.patientConfiguration.attributeTypes, {name: 'caste'}) != null);
                return showCasteSameAsLastNameCheckbox && personAttributeHasCaste;
            };

            $scope.setCasteAsLastName = function () {
                if ($scope.patient.sameAsLastName) {
                    $scope.patient.caste = $scope.patient.familyName;
                }
            };



            $scope.getAutoCompleteList = function (attributeName, query, type) {
                return patientAttributeService.search(attributeName, query, type);
            };

            $scope.getDataResults = function (data) {
                return  data.results;
            };


            $scope.$watch('patient.familyName', function () {
                if ($scope.patient.sameAsLastName) {
                    $scope.patient.caste = $scope.patient.familyName;
                }
            });

            $scope.$watch('patient.caste', function () {
                if ($scope.patient.sameAsLastName && ($scope.patient.familyName !== $scope.patient.caste)) {
                    $scope.patient.sameAsLastName = false;
                }
            });

            $scope.selectIsDead = function(){
                if($scope.patient.causeOfDeath != null ||$scope.patient.deathDate != null){
                    $scope.patient.dead = true;
                }
            };

            $scope.disableIsDead = function(){
                return ($scope.patient.causeOfDeath != null || $scope.patient.deathDate != null) && $scope.patient.dead;
            }

        }]);

