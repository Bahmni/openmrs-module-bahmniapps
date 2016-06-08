'use strict';

angular.module('bahmni.registration')
    .controller('VisitController', ['$window', '$scope', '$rootScope', '$state', '$bahmniCookieStore', 'patientService', 'encounterService', '$stateParams', 'spinner', '$timeout', '$q', 'appService', 'openmrsPatientMapper', 'contextChangeHandler', 'messagingService', 'sessionService', 'visitService', '$location', '$translate',
        function ($window, $scope, $rootScope, $state, $bahmniCookieStore, patientService, encounterService, $stateParams, spinner, $timeout, $q, appService, patientMapper, contextChangeHandler, messagingService, sessionService, visitService, $location, $translate) {
            var self = this;
            var patientUuid = $stateParams.patientUuid;
            var extensions = appService.getAppDescriptor().getExtensions("org.bahmni.registration.conceptSetGroup.observations", "config");
            var locationUuid = sessionService.getLoginLocationUuid();
            var selectedProvider = $rootScope.currentProvider;
            $scope.conceptSets = extensions.map(function (extension) {
                return new Bahmni.ConceptSet.ConceptSetSection(extension, $rootScope.currentUser, {}, [], {});
            });
            $scope.availableConceptSets = $scope.conceptSets.filter(function (conceptSet) {
                return conceptSet.isAvailable($scope.context);
            });
            var regEncounterTypeUuid = $rootScope.regEncounterConfiguration.encounterTypes[Bahmni.Registration.Constants.registrationEncounterType];

            var getPatient = function () {
                return patientService.get(patientUuid).then(function (openMRSPatient) {
                    $scope.patient = patientMapper.map(openMRSPatient);
                    $scope.patient.name = openMRSPatient.patient.person.names[0].display;
                    $scope.patient.uuid = openMRSPatient.patient.uuid;
                })
            };

            var getActiveEncounter = function () {
                return encounterService.find({
                    "patientUuid": patientUuid,
                    "providerUuids": !_.isEmpty($scope.currentProvider.uuid) ? [$scope.currentProvider.uuid] : null,
                    "includeAll": false,
                    locationUuid: locationUuid,
                    encounterTypeUuids: [regEncounterTypeUuid]
                })
                    .success(function (data) {
                        $scope.observations = data.observations;
                    });
            };

            $scope.hideFields = appService.getAppDescriptor().getConfigValue("hideFields");

            $scope.back = function () {
                $state.go('patient.edit');
            };

            $scope.updatePatientImage = function (image) {
                var updateImagePromise = patientService.updateImage($scope.patient.uuid, image.replace("data:image/jpeg;base64,", ""));
                spinner.forPromise(updateImagePromise);
                return updateImagePromise;
            };

            var save = function () {
                $scope.encounter = {
                    patientUuid: $scope.patient.uuid,
                    locationUuid: locationUuid,
                    encounterTypeUuid: regEncounterTypeUuid
                };

                $bahmniCookieStore.put(Bahmni.Common.Constants.grantProviderAccessDataCookieName, selectedProvider, {path: '/', expires: 1});

                $scope.encounter.observations = $scope.observations;
                $scope.encounter.observations = new Bahmni.Common.Domain.ObservationFilter().filter($scope.encounter.observations);

                var createPromise = encounterService.create($scope.encounter);
                spinner.forPromise(createPromise);
                return createPromise;
            };

            var isUserPrivilegedToCloseVisit = function() {
                var applicablePrivs = [Bahmni.Common.Constants.closeVisitPrivilege, Bahmni.Common.Constants.deleteVisitsPrivilege];
                var userPrivs = _.map($rootScope.currentUser.privileges, function(privilege) {
                    return privilege.name;
                });
                var result = _.some(userPrivs, function(privName){
                    return _.includes(applicablePrivs, privName);
                });
                return result;
            };

            var searchActiveVisitsPromise = function () {
                return visitService.search({
                    patient: patientUuid, includeInactive: false, v: "custom:(uuid)"
                }).then(function (data) {
                    var hasActiveVisit = data.data.results.length > 0;
                    self.visitUuid = hasActiveVisit ? data.data.results[0].uuid : "";
                    $scope.canCloseVisit = isUserPrivilegedToCloseVisit() && hasActiveVisit;
                });
            };


            $scope.closeVisitIfDischarged = function () {
                visitService.getVisitSummary(self.visitUuid).then(function (response) {
                    var visitSummary = response.data;
                    if (visitSummary.admissionDetails != null && visitSummary.dischargeDetails === null) {
                        messagingService.showMessage("error", 'REGISTRATION_VISIT_CANNOT_BE_CLOSED');
                    } else {
                        closeVisit();
                    }
                });
            };

            var closeVisit = function () {
                var confirmed = $window.confirm($translate.instant("REGISTRATION_CONFIRM_CLOSE_VISIT"));
                if (confirmed) {
                    visitService.endVisit(self.visitUuid).then(function () {
                        $location.url(Bahmni.Registration.Constants.patientSearchURL);
                    });
                }
            };

            $scope.getMessage = function () {
                return $scope.message;
            };
            var validate = function () {
                mandatoryValidate();
                var deferred = $q.defer();
                var contxChange = contextChangeHandler.execute();
                var allowContextChange = contxChange["allow"];
                if (!allowContextChange) {
                    var errorMessage = contxChange["errorMessage"] ? contxChange["errorMessage"] : 'REGISTRATION_LABEL_CORRECT_ERRORS';
                    messagingService.showMessage('error', errorMessage);
                    deferred.reject("Some fields are not valid");
                    return deferred.promise;
                }else if(!mandatoryValidate()){ // This ELSE IF condition is to be deleted later.
                    var errorMessage =  "REGISTRATION_LABEL_ENTER_MANDATORY_FIELDS";
                    messagingService.showMessage('error', errorMessage);
                    deferred.reject("Some fields are not valid");
                    return deferred.promise;
                } else {
                    deferred.resolve();
                    return deferred.promise;
                }
            };

            //Start :: Registration Page validation
            //To be deleted later - Hacky fix only for Registration Page
            var mandatoryConceptGroup = [];
            var mandatoryValidate = function () {
                conceptGroupValidation($scope.observations);
                return isValid(mandatoryConceptGroup);
            };

            var conceptGroupValidation = function(observations){
                var concepts = _.filter(observations, function(observationNode){
                    return isMandatoryConcept(observationNode);
                });
                if(!_.isEmpty(concepts)){
                    mandatoryConceptGroup = _.union(mandatoryConceptGroup, concepts);
                }
            };
            var isMandatoryConcept = function (observation) {
                if (!_.isEmpty(observation.groupMembers)) {
                    conceptGroupValidation(observation.groupMembers);
                } else {
                    return observation.conceptUIConfig && observation.conceptUIConfig.required;
                }
            };
            var isValid = function (mandatoryConcepts){
                var concept = mandatoryConcepts.filter(function(mandatoryConcept){
                    return mandatoryConcept.value == undefined;
                });
                return _.isEmpty(concept);
            };
            //End :: Registration Page validation

            var afterSave = function () {

                var nextState = appService.getAppDescriptor().getConfigValue('afterVisitSaveTransitionToState');

                $state.transitionTo(nextState ? nextState : $state.current, $state.params, {
                    reload: true,
                    inherit: false,
                    notify: true
                });

                messagingService.showMessage('info', 'REGISTRATION_LABEL_SAVED');
            };

            $scope.submit = function () {
                return validate().then(save).then(afterSave);
            };

            $scope.today = function () {
                return new Date();
            };

            $scope.disableFormSubmitOnEnter = function () {
                $('.visit-patient').find('input').keypress(function (e) {
                    if (e.which === 13) // Enter key = keycode 13
                    {
                        return false;
                    }
                });
            };

            var getConceptSet = function () {
                var visitType = $scope.encounterConfig.getVisitTypeByUuid($scope.visitTypeUuid);
                $scope.context = {visitType: visitType, patient: $scope.patient};
            };

            spinner.forPromise($q.all([getPatient(), getActiveEncounter(), searchActiveVisitsPromise()]).then(getConceptSet));
        }]);
