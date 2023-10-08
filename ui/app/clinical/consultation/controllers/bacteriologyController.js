'use strict';

angular.module('bahmni.clinical')
    .controller('BacteriologyController', ['$scope', '$state', '$rootScope', 'contextChangeHandler', 'spinner', 'conceptSetService',
        'messagingService', 'bacteriologyConceptSet', 'appService', 'retrospectiveEntryService',
        function ($scope, $state, $rootScope, contextChangeHandler, spinner, conceptSetService, messagingService, bacteriologyConceptSet,
                  appService, retrospectiveEntryService) {
            $scope.consultation.extensions = $scope.consultation.extensions ? $scope.consultation.extensions : {mdrtbSpecimen: []};
            var initializeBacteriologyScope = function () {
                $scope.savedSpecimens = $scope.consultation.savedSpecimens || $scope.consultation.extensions.mdrtbSpecimen;
                $scope.newSpecimens = $scope.consultation.newlyAddedSpecimens || [];
                $scope.deletedSpecimens = $scope.consultation.deletedSpecimens || [];
            };

            initializeBacteriologyScope();

            $scope.today = Bahmni.Common.Util.DateUtil.getDateWithoutTime(Bahmni.Common.Util.DateUtil.now());

            $scope.isRetrospectiveMode = function () {
                return !_.isEmpty(retrospectiveEntryService.getRetrospectiveEntry());
            };

            var init = function () {
                if (appService.getAppDescriptor().getConfigValue("showSaveConfirmDialog")) {
                    $scope.$broadcast("event:pageUnload");
                }
                var additionalAttributes = _.find(bacteriologyConceptSet.setMembers, function (member) {
                    return member.conceptClass.name === "Bacteriology Attributes";
                });
                $scope.additionalAttributesConceptName = additionalAttributes && additionalAttributes.name.name;

                var results = _.find(bacteriologyConceptSet.setMembers, function (member) {
                    return member.conceptClass.name === "Bacteriology Results";
                });
                $scope.resultsConceptName = results && results.name.name;

                var sampleSource = _.find(bacteriologyConceptSet.setMembers, function (member) {
                    return member.name.name === "Specimen Sample Source";
                });
                $scope.allSamples = sampleSource !== undefined && _.map(sampleSource.answers, function (answer) {
                    return new Bahmni.Common.Domain.ConceptMapper().map(answer);
                });
                if ($scope.savedSpecimens) {
                    $scope.savedSpecimens = _.sortBy($scope.savedSpecimens, 'dateCollected').reverse();
                }
                if ($scope.newSpecimens.length === 0) {
                    $scope.createNewSpecimen();
                }
                handleSampleTypeOther();
            };

            $scope.createNewSpecimen = function () {
                var newSpecimen = new Bahmni.Clinical.Specimen(null, $scope.allSamples);
                $scope.newSpecimens.push(newSpecimen);
            };

            $scope.$on('$stateChangeStart', function () {
                if ($scope.bacteriologyForm.$dirty) {
                    $state.dirtyConsultationForm = true;
                }
            });

            $scope.$on("event:changes-saved", function () {
                $scope.bacteriologyForm.$dirty = false;
            });

            var contextChange = function () {
                $scope.consultation.newlyAddedSpecimens = $scope.newSpecimens;
                $scope.consultation.deletedSpecimens = $scope.deletedSpecimens;
                $scope.consultation.savedSpecimens = $scope.savedSpecimens;
                var dirtySpecimens = _.filter($scope.newSpecimens, function (specimen) {
                    return (specimen.isDirty());
                });
                _.each(dirtySpecimens, function (dirtySpecimen) {
                    dirtySpecimen.hasIllegalDateCollected = !dirtySpecimen.dateCollected;
                    dirtySpecimen.hasIllegalType = !dirtySpecimen.type;
                    dirtySpecimen.hasIllegalTypeFreeText = !dirtySpecimen.typeFreeText;
                });
                return {allow: dirtySpecimens[0] === undefined};
            };

            var saveSpecimens = function () {
                var savableSpecimens = _.filter($scope.newSpecimens, function (specimen) {
                    return !specimen.isEmpty() || specimen.voidIfEmpty();
                });

                savableSpecimens = savableSpecimens.concat($scope.deletedSpecimens);
                var specimenMapper = new Bahmni.Clinical.SpecimenMapper();
                var specimens = [];
                _.each(savableSpecimens, function (specimen) {
                    specimens.push(specimenMapper.mapSpecimenToObservation(specimen));
                });

                $scope.consultation.newlyAddedSpecimens = specimens;
                if (!$scope.consultation.extensions.mdrtbSpecimen) {
                    $scope.consultation.extensions.mdrtbSpecimen = [];
                }
            };

            $scope.editSpecimen = function (specimen) {
                $scope.savedSpecimens = _.without($scope.savedSpecimens, specimen);
                $scope.newSpecimens.push(new Bahmni.Clinical.Specimen(specimen, $scope.allSamples));

                handleSampleTypeOther();
            };

            $scope.handleUpdate = function () {
                handleSampleTypeOther();
            };

            $scope.deleteSpecimen = function (specimen) {
                if (specimen.isExistingSpecimen()) {
                    specimen.setMandatoryFieldsBeforeSavingVoidedSpecimen();
                    $scope.deletedSpecimens.push(specimen);
                }
                $scope.savedSpecimens = _.without($scope.savedSpecimens, specimen);
                $scope.newSpecimens = _.without($scope.newSpecimens, specimen);
                if ($scope.newSpecimens.length === 0) {
                    $scope.createNewSpecimen();
                }
            };

            $scope.getDisplayName = function (specimen) {
                var type = specimen.type;
                var displayName = type && (type.shortName ? type.shortName : type.name);
                if (displayName === Bahmni.Clinical.Constants.bacteriologyConstants.otherSampleType) {
                    displayName = specimen.typeFreeText;
                }
                return displayName;
            };

            $scope.consultation.preSaveHandler.register("bacteriologySaveHandlerKey", saveSpecimens);
            $scope.consultation.postSaveHandler.register("bacteriologyPostSaveHandlerKey", initializeBacteriologyScope);

            var handleSampleTypeOther = function () {
                for (var specimen in $scope.newSpecimens) {
                    if ($scope.newSpecimens[specimen].type && $scope.newSpecimens[specimen].type.name === Bahmni.Clinical.Constants.bacteriologyConstants.otherSampleType) {
                        $scope.newSpecimens[specimen].showTypeFreeText = true;
                        if ($scope.freeText) {
                            $scope.newSpecimens[specimen].typeFreeText = $scope.freeText;
                        }
                    } else {
                        $scope.newSpecimens[specimen].showTypeFreeText = false;
                        if ($scope.newSpecimens[specimen].type) {
                            $scope.freeText = $scope.newSpecimens[specimen].typeFreeText;
                            $scope.newSpecimens[specimen].typeFreeText = null;
                        }
                    }
                }
            };

            contextChangeHandler.add(contextChange);

            init();
        }
    ])
;
