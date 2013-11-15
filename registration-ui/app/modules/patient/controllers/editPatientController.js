'use strict';

angular.module('registration.patient.controllers')
    .controller('EditPatientController', ['$scope', '$rootScope', 'patientService', 'visitService','$location', 'Preferences', '$route', 'openmrsPatientMapper', '$window', '$q','spinner', 'printer',
        function ($scope, $rootScope, patientService, visitService,$location, preferences, $route, patientMapper, $window, $q, spinner, printer) {
            var uuid;
            $scope.patient = {};
            (function () {
                uuid = $route.current.params.patientUuid;
                var getPatientPromise = patientService.get(uuid).success(function (openmrsPatient) {
                    $scope.patient = patientMapper.map(openmrsPatient);
                    $scope.patient.isNew = ($location.search()).newpatient;
                });
                var searchActiveVisitsPromise = visitService.search({patient: uuid, includeInactive: false, v: "custom:(uuid)"}).success(function(data){
                    $scope.hasActiveVisit = data.results.length > 0;
                });
                spinner.forPromise($q.all([getPatientPromise, searchActiveVisitsPromise]));
            })();

            $scope.visitControl = new Bahmni.Registration.VisitControl($rootScope.encounterConfiguration.getVistTypesAsArray(), constants.defaultVisitTypeName, visitService);
            $scope.visitControl.onStartVisit = function(visitType) {
                $scope.setSubmitSource('startVisit');
            };

            $scope.patientCommon = function () {
                return $route.routes['/patientcommon'].templateUrl;
            };

            $scope.setSubmitSource = function (source) {
                $scope.submitSource = source;
            };

            var goToVisitPage = function(patientData) {
                $scope.patient.uuid = patientData.uuid;
                $scope.patient.name = patientData.name;
                patientService.rememberPatient($scope.patient);
                $location.path("/patient/" + patientData.uuid + "/visit");
            };

            var createVisit = function(patientData){
                $scope.visitControl.createVisit(patientData.uuid).success(function(){
                    goToVisitPage(patientData);
                }).error(function() { spinner.hide(); });                
            }
            
            $scope.update = function () {
                var patientUpdatePromise = patientService.update($scope.patient, uuid).success(function (patientData) {
                    switch($scope.submitSource) {
                        case 'print':
                            printer.print('registrationCard');
                            spinner.hide();
                            break;
                        case 'startVisit':
                            createVisit(patientData);                        
                            break;
                        case 'enterVisitDetails':
                            goToVisitPage(patientData);                        
                            break;
                        case 'save':
                        default:
                            spinner.hide();
                    }
                    $scope.submitSource = null;
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