'use strict';

angular.module('bahmni.clinical')
    .controller('DispositionController', ['$scope', '$q', 'dispositionService', 'appService', 'retrospectiveEntryService', 'spinner', '$rootScope', '$translate', function ($scope, $q, dispositionService, appService, retrospectiveEntryService, spinner, $rootScope, $translate) {
        var consultation = $scope.consultation;
        var allDispositions = [];
        var getPreviousDispositionNote = function () {
            if (consultation.disposition && (!consultation.disposition.voided)) {
                return _.find(consultation.disposition.additionalObs, function (obs) {
                    return obs.concept.uuid === $scope.dispositionNoteConceptUuid;
                });
            }
        };

        var getDispositionNotes = function () {
            var previousDispositionNotes = getPreviousDispositionNote();
            if (getSelectedConceptName($scope.dispositionCode, $scope.dispositionActions)) {
                return _.cloneDeep(previousDispositionNotes) || {concept: {uuid: $scope.dispositionNoteConceptUuid}};
            }
            else {
                return {concept: {uuid: $scope.dispositionNoteConceptUuid}};
            }
        };

        var getDispositionActionsPromise = function () {
            return dispositionService.getDispositionActions().then(function (response) {
                allDispositions = new Bahmni.Clinical.DispostionActionMapper().map(response.data.results[0].answers);
                $scope.dispositionActions = filterDispositionActions(allDispositions, $scope.$parent.visitSummary);
                $scope.dispositionCode = consultation.disposition && (!consultation.disposition.voided) ? consultation.disposition.code : null;
                $scope.dispositionNote = getDispositionNotes();
            });
        };

        var getDispositionActions = function (finalDispositionActions, dispositions, action) {
            var copyOfFinalDispositionActions = _.cloneDeep(finalDispositionActions);
            var dispositionPresent = _.find(dispositions, action);
            if (dispositionPresent) {
                copyOfFinalDispositionActions.push(dispositionPresent);
            }
            return copyOfFinalDispositionActions;
        };
        $scope.getTranslatedDisposition = function (dispositionName) {
            var translatedName = Bahmni.Common.Util.TranslationUtil.translateAttribute(dispositionName, Bahmni.Common.Constants.disposition, $translate);
            return translatedName;
        };
        var filterDispositionActions = function (dispositions, visitSummary) {
            var defaultDispositions = ["Undo Discharge", "Admit Patient", "Transfer Patient", "Discharge Patient"];
            var finalDispositionActions = _.filter(dispositions, function (disposition) {
                return defaultDispositions.indexOf(disposition.name) < 0;
            });
            var isVisitOpen = visitSummary ? _.isEmpty(visitSummary.stopDateTime) : false;
            if (visitSummary && visitSummary.isDischarged() && isVisitOpen) {
                finalDispositionActions = getDispositionActions(finalDispositionActions, dispositions, { name: defaultDispositions[0]});
            }
            else if (visitSummary && visitSummary.isAdmitted() && isVisitOpen) {
                finalDispositionActions = getDispositionActions(finalDispositionActions, dispositions, { name: defaultDispositions[2]});
                finalDispositionActions = getDispositionActions(finalDispositionActions, dispositions, { name: defaultDispositions[3]});
            }
            else {
                finalDispositionActions = getDispositionActions(finalDispositionActions, dispositions, { name: defaultDispositions[1]});
            }
            return finalDispositionActions;
        };

        $scope.isRetrospectiveMode = function () {
            return !_.isEmpty(retrospectiveEntryService.getRetrospectiveEntry());
        };

        $scope.showWarningForEarlierDispositionNote = function () {
            return !$scope.dispositionCode && consultation.disposition;
        };

        var getDispositionNotePromise = function () {
            return dispositionService.getDispositionNoteConcept().then(function (response) {
                $scope.dispositionNoteConceptUuid = response.data.results[0].uuid;
            });
        };

        var loadDispositionActions = function () {
            return getDispositionNotePromise().then(getDispositionActionsPromise);
        };

        $scope.clearDispositionNote = function () {
            $scope.dispositionNote.value = null;
        };

        var getSelectedConceptName = function (dispositionCode, dispositions) {
            var selectedDispositionConceptName = _.findLast(dispositions, {code: dispositionCode}) || {};
            return selectedDispositionConceptName.name;
        };

        var getSelectedDisposition = function () {
            if ($scope.dispositionCode) {
                $scope.dispositionNote.voided = !$scope.dispositionNote.value;
                var disposition = {
                    additionalObs: [],
                    dispositionDateTime: consultation.disposition && consultation.disposition.dispositionDateTime,
                    code: $scope.dispositionCode,
                    conceptName: getSelectedConceptName($scope.dispositionCode, allDispositions)
                };
                if ($scope.dispositionNote.value || $scope.dispositionNote.uuid) {
                    disposition.additionalObs = [_.clone($scope.dispositionNote)];
                }
                return disposition;
            }
        };

        spinner.forPromise(loadDispositionActions(), '#disposition');

        var saveDispositions = function () {
            var selectedDisposition = getSelectedDisposition();
            if (selectedDisposition) {
                consultation.disposition = selectedDisposition;
            } else {
                if (consultation.disposition) {
                    consultation.disposition.voided = true;
                    consultation.disposition.voidReason = "Cancelled during encounter";
                }
            }
        };

        $scope.consultation.preSaveHandler.register("dispositionSaveHandlerKey", saveDispositions);
        $scope.$on('$destroy', saveDispositions);
    }]);
