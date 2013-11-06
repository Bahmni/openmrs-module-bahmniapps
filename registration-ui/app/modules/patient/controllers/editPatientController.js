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
                var searchVisitPromise = visitService.search({patient: uuid, v: "custom:(uuid)"}).success(function(data){
                    $scope.hasActiveVisit = data.results.length > 0;
                });
                spinner.forPromise($q.all([getPatientPromise, searchVisitPromise]));
            })();

            $scope.visitTypes = $rootScope.encounterConfiguration.getVistTypesAsArray();
            
            $scope.startVisit = function(visitType) {
                $scope.setSubmitSource('startVisit');
                $scope.selectedVisitType = visitType;
            };

            $scope.startVisitButtonText = function(visitType) {
                return "Start " + visitType.name + " visit";
            };

            $scope.patientCommon = function () {
                return $route.routes['/patientcommon'].templateUrl;
            };

            $scope.setSubmitSource = function (source) {
                $scope.submitSource = source;
            };

            var goToVisitPage = function(data) {
                $scope.patient.uuid = data.uuid;
                $scope.patient.name = data.name;
                patientService.rememberPatient($scope.patient);
                $location.path("/visit");
            };
            
            $scope.update = function () {
                var patientUpdatePromise = patientService.update($scope.patient, uuid).success(function (data) {
                    if ($scope.submitSource == 'print') {
                        printer.print('registrationCard');
                        spinner.hide();
                    } else if ($scope.submitSource == 'startVisit') {                        
                        var visit = {patient: {uuid: data.uuid}, visitType: $scope.selectedVisitType, startDatetime: new Date(), encounters: []}
                        visitService.create(visit).success(function(){
                            goToVisitPage(data);
                        });
                    } else if($scope.submitSource == 'enterVisitDetails') {
                        goToVisitPage(data);
                    } else {
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