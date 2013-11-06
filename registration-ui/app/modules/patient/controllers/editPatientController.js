'use strict';

angular.module('registration.patient.controllers')
    .controller('EditPatientController', ['$scope', '$rootScope', 'patientService', 'visitService','$location', 'Preferences', '$route', 'openmrsPatientMapper', '$window', 'spinner', 'printer',
        function ($scope, $rootScope, patientService, visitService,$location, preferences, $route, patientMapper, $window, spinner, printer) {
            var uuid;
            $scope.patient = {};
            (function () {
                uuid = $route.current.params.patientUuid;
                var getPatientPromise = patientService.get($route.current.params.patientUuid).success(function (openmrsPatient) {
                    $scope.patient = patientMapper.map(openmrsPatient);
                    $scope.patient.isNew = ($location.search()).newpatient;
                });
                spinner.forPromise(getPatientPromise);
            })();

            $scope.visitTypes = (function(){
                var visitTypes = [];
                for(var name in $rootScope.encounterConfiguration.visitTypes) {
                    visitTypes.push({name: name, uuid: $rootScope.encounterConfiguration.visitTypes[name]});
                }
                return visitTypes;
            })();
            
            $scope.startVisit = function(visitType) {
                $scope.setUpdateSource('startVisit');
                $scope.selectedVisitType = visitType;
            };

            $scope.startVisitButtonText = function(visitType) {
                return "Start " + visitType.name + " visit";
            };

            $scope.patientCommon = function () {
                return $route.routes['/patientcommon'].templateUrl;
            };

            $scope.setUpdateSource = function (source) {
                $scope.updateSource = source;
            };

            $scope.update = function () {
                var patientUpdatePromise = patientService.update($scope.patient, uuid).success(function (data) {
                    if ($scope.updateSource == 'print') {
                        printer.print('registrationCard');
                        spinner.hide();
                    } else if ($scope.updateSource == 'startVisit') {                        
                        var visit = {patient: {uuid: data.uuid}, visitType: $scope.selectedVisitType, startDatetime: new Date(), encounters: []}
                        visitService.create(visit).success(function(){
                            $scope.patient.uuid = data.uuid;
                            $scope.patient.name = data.name;
                            patientService.rememberPatient($scope.patient);
                            $location.path("/visit");
                        });
                    } else {
                        spinner.hide();
                    } 
                    $scope.updateSource = null;
                    $rootScope.server_error = null;
                });
                spinner.forPromise(patientUpdatePromise, {doNotHideOnSuccess: true});
            };

            $scope.showBackButton = function () {
                return !$location.search().newpatient;
            };

            $scope.back = function () {
                $window.history.back();
            };

            $scope.printLayout = function () {
                return $route.routes['/printPatient'].templateUrl;
            };
        }]);