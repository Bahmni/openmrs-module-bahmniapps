'use strict';

angular.module('opd.documentupload')
    .controller('DocumentController', ['$scope', '$stateParams', 'visitService', 'patientService', 'encounterService', 'spinner', 'visitDocumentService', '$rootScope', '$http', '$q', '$timeout', 'sessionService', '$anchorScroll',
        function ($scope, $stateParams, visitService, patientService, encounterService, spinner, visitDocumentService, $rootScope, $http, $q, $timeout, sessionService, $anchorScroll) {
            var encounterTypeUuid;
            var topLevelConceptUuid;
            var customVisitParams = Bahmni.DocumentUpload.Constants.visitRepresentation;
            var DateUtil = Bahmni.Common.Util.DateUtil;
            var patientMapper = new Bahmni.PatientMapper($rootScope.patientConfig, $rootScope);
            var activeEncounter = {};
            var locationUuid = sessionService.getLoginLocationUuid();

            $scope.visits = [];
            $scope.toggleGallery = true;
            $scope.conceptNameInvalid = false;

            var setOrientationWarning = function() {
                $scope.orientation_warning = (window.orientation && (window.orientation < 0 || window.orientation > 90));
            };
            setOrientationWarning();
            var onOrientationChange = function() {
                $scope.$apply(setOrientationWarning);
            };
            window.addEventListener('orientationchange', onOrientationChange);
            $scope.$on('$destroy', function(){
                window.removeEventListener('orientationchange', onOrientationChange);
            });

            var initNewVisit = function () {
                $scope.newVisit = new Bahmni.DocumentUpload.Visit();
                $scope.currentVisit = $scope.newVisit;
            };

            var createVisit = function (visit) {
                var newVisit = angular.extend(new Bahmni.DocumentUpload.Visit(), visit);
                return newVisit;
            };

            var getVisitTypes = function () {
                return visitService.getVisitType().then(function (response) {
                    $scope.visitTypes = response.data.results;
                })
            };

            var getPatient = function () {
                return patientService.getPatient($stateParams.patientUuid).success(function (openMRSPatient) {
                    $rootScope.patient = patientMapper.map(openMRSPatient);
                });
            };

            var getVisitStartStopDateTime = function (visit) {
                return { "startDatetime": DateUtil.getDate(visit.startDatetime), "stopDatetime": DateUtil.getDate(visit.stopDatetime)}
            };

            var compareVisitStartWithExistingStop = function (newVisitStart, existingVisit) {
                if(newVisitStart >= existingVisit.startDatetime && DateUtil.isInvalid(existingVisit.stopDatetime)) return true;
                return (newVisitStart <= existingVisit.stopDatetime || DateUtil.isSameDate(newVisitStart, existingVisit.stopDatetime));
            };

            var compareVisitStopWithExistingStart = function (newVisitStop, existingVisitStart) {
                return (newVisitStop >= existingVisitStart || DateUtil.isSameDate(newVisitStop, existingVisitStart));
            };

            var isVisitInSameRange = function (newVisitWithoutTime, existingVisit) {
                if (DateUtil.isInvalid(existingVisit.stopDatetime)) {
                    return (compareVisitStartWithExistingStop(newVisitWithoutTime.startDatetime, existingVisit) ||
                        compareVisitStopWithExistingStart(newVisitWithoutTime.stopDatetime, existingVisit.startDatetime));
                }
                else {
                    return (compareVisitStartWithExistingStop(newVisitWithoutTime.startDatetime, existingVisit) &&
                        compareVisitStopWithExistingStart(newVisitWithoutTime.stopDatetime, existingVisit.startDatetime));
                }


            };

            $scope.isNewVisitDateValid = function(){
                var filterExistingVisitsInSameDateRange = function (existingVisit) {
                    return isVisitInSameRange(newVisitWithoutTime, existingVisit);
                };
                var newVisitWithoutTime = Object();
                newVisitWithoutTime.startDatetime = DateUtil.getDate($scope.newVisit.startDatetime);
                newVisitWithoutTime.stopDatetime = $scope.newVisit.stopDatetime ? DateUtil.getDate($scope.newVisit.stopDatetime) : newVisitWithoutTime.startDatetime;
                var visitStartStopDateTime = $scope.visits.map(getVisitStartStopDateTime);
                var existingVisitsInSameRange = visitStartStopDateTime.filter(filterExistingVisitsInSameDateRange);
                $scope.isDateValid = existingVisitsInSameRange.length == 0;
                return existingVisitsInSameRange.length == 0;
            };

            var getVisits = function () {
                return visitService.search({patient: $rootScope.patient.uuid, v: customVisitParams, includeInactive: true}).then(function (response) {
                    var visits = response.data.results;
                    if (visits.length > 0) {
                        if (!visits[0].stopDatetime){
                            $scope.currentVisit = visits[0];
                        } else {
                            $scope.currentVisit = null;
                        }
                    }
                    visits.forEach(function (visit) {
                        $scope.visits.push(createVisit(visit));
                    });
                });
            };

            var getEncountersForVisits = function () {
                return encounterService.getEncountersForEncounterType($rootScope.patient.uuid, encounterTypeUuid).success(function (encounters) {
                    $scope.visits.forEach(function (visit) {
                        var visitEncounters = encounters.results.filter(function(a) {return(a.visit.uuid==visit.uuid)});
                        visit.initSavedFiles(visitEncounters);
                    });
                });
            };

            var setDefaultConcept = function(topLevelConcept) {
                if (topLevelConcept.setMembers.length == 1) {
                    var concept = topLevelConcept.setMembers[0];
                    $scope.defaultConcept = {'concept':{uuid:concept.uuid, name:concept.name.name, editableName:concept.name.name}, 'value':concept.name.name};
                }else if($rootScope.appConfig.defaultOption){
                    var concept = topLevelConcept.setMembers.filter(function(member){
                        return member.name.name == $rootScope.appConfig.defaultOption;
                    })[0];
                    $scope.defaultConcept = {'concept':{uuid:concept.uuid, name:concept.name.name, editableName:concept.name.name}, 'value':concept.name.name};
                }
            };

            var getTopLevelConcept = function () {
                if($rootScope.appConfig.topLevelConcept == null ) {
                    topLevelConceptUuid = null;
                    return $q.when({});
                }
                return $http.get(Bahmni.Common.Constants.conceptSearchByFullNameUrl,
                    {
                        params:{
                            name:$rootScope.appConfig.topLevelConcept,
                            v:"custom:(uuid,setMembers:(uuid,name:(name)))"
                        }
                }).then(function (response) {
                        var topLevelConcept = response.data.results[0];
                        topLevelConceptUuid = topLevelConcept ? topLevelConcept.uuid : null;
                        setDefaultConcept(topLevelConcept);
                    });
            };

            var sortVisits = function() {
                $scope.visits.sort(function(a, b) {
                        var date1 = DateUtil.parse(a.startDatetime);
                        var date2 = DateUtil.parse(b.startDatetime);
                        return date2.getTime() - date1.getTime();
                    });
            };

            var getActiveEncounter = function() {
                var currentProviderUuid = $rootScope.currentProvider ? $rootScope.currentProvider.uuid : null;
                return encounterService.activeEncounter({
                    patientUuid : $stateParams.patientUuid,
                    encounterTypeUuid : encounterTypeUuid,
                    providerUuid: currentProviderUuid,
                    includeAll :  Bahmni.Common.Constants.includeAllObservations,
                    locationUuid : locationUuid
                }).then(function (encounterTransactionResponse) {
                    activeEncounter = encounterTransactionResponse.data;
                });
            };

            var init = function () {
                encounterTypeUuid = $scope.encounterConfig.getEncounterTypeUuid($rootScope.appConfig.encounterType);
                initNewVisit();
                var deferrables = $q.defer();
                var promises = [];
                promises.push(getVisitTypes());
                promises.push(getActiveEncounter());
                promises.push(getPatient().then(getVisits).then(getEncountersForVisits));
                promises.push(getTopLevelConcept());
                $q.all(promises).then(function () {
                    deferrables.resolve();
                });
                return deferrables.promise;
            };
            spinner.forPromise(init());

            $scope.getConcepts = function(request){
                return $http.get(Bahmni.Common.Constants.conceptUrl, { params: {q: request.term, memberOf: topLevelConceptUuid, v: "custom:(uuid,name)"}}).then(function(result) {
                    return result.data.results;
                });
            };

            $scope.getDataResults = function(results){
                return results.map(function (concept) {
                    return {'concept': {uuid: concept.uuid, name: concept.name.name, editableName: concept.name.name}, 'value': concept.name.name}
                });
            };

            $scope.onSelect = function(file, visit){
                $scope.toggleGallery=false;
                spinner.forPromise(visitDocumentService.saveFile(file, $rootScope.patient.uuid, $rootScope.appConfig.encounterType).then(function(response) {
                    var fileUrl = Bahmni.Common.Constants.documentsPath + '/' + response.data;
                    var savedFile = visit.addFile(fileUrl);
                    $scope.setConceptOnFile(savedFile, $scope.defaultConcept);
                    $scope.toggleGallery=true;
                }));
            };

            $scope.setConceptOnFile = function (file, selectedItem) {
                if (selectedItem) {
                    file.concept = Object.create(selectedItem.concept);
                    file.changed = true;
                    if (!$scope.$$phase) {
                        $scope.$apply();
                    }
                }
            };

            $scope.onEditConcept = function(file){
                file.concept.name = undefined;
                file.concept.uuid = undefined;
            };

            $scope.onConceptSelected = function(file){
                return function(selectedItem){
                    $scope.setConceptOnFile(file, selectedItem);
                }
            };

            $scope.resetCurrentVisit = function (visit) {
                $scope.currentVisit = ($scope.isCurrentVisit(visit)) ? $scope.newVisit : visit;
            };

            $scope.isCurrentVisit = function (visit) {
                return $scope.currentVisit && $scope.currentVisit.uuid === visit.uuid;
            };

            var getEncounterStartDateTime = function (visit) {
                return visit.endDate() ? visit.startDate() : null;
            };

            var createVisitDocument = function (visit) {
                var visitDocument = {};
                visitDocument.patientUuid = $scope.patient.uuid;
                visitDocument.visitTypeUuid = visit.visitType.uuid;
                visitDocument.visitStartDate = visit.startDate();
                visitDocument.visitEndDate = visit.endDate();
                visitDocument.encounterTypeUuid = encounterTypeUuid;
                visitDocument.encounterDateTime = getEncounterStartDateTime(visit);
                visitDocument.providerUuid = $rootScope.currentProvider.uuid;
                visitDocument.visitUuid = visit.uuid;
                visitDocument.locationUuid = locationUuid;
                visitDocument.documents = [];

                visit.files.forEach(function (file) {
                    var fileUrl = file.encodedValue.replace(Bahmni.Common.Constants.documentsPath + "/", "");
                    if(!visit.isSaved(file)) {
                        visitDocument.documents.push({testUuid: file.concept.uuid, image: fileUrl, obsDateTime: getEncounterStartDateTime(visit)})
                    } else if (file.changed == true || file.voided == true) {
                        visitDocument.documents.push({testUuid: file.concept.uuid, image: fileUrl, voided: file.voided, obsUuid: file.obsUuid});
                    }
                });

                return visitDocument;
            };

            function flashSuccessMessage() {
                $scope.success = true;
                $timeout(function () {
                    $scope.success = false;
                }, 2000);
            }

            $scope.setDefaultEndDate = function(newVisit) {
                if(!newVisit.stopDatetime){
                    var date = newVisit.endDate() ? DateUtil.parse(newVisit.endDate()) : new Date();
                    $scope.newVisit.stopDatetime = date;
                }
            };

            var isObsByCurrentProvider = function (obs) {
                return obs.provider && $rootScope.currentUser.person.uuid === obs.provider.uuid;
            };

            $scope.canDeleteFile = function(obs){
                return isObsByCurrentProvider(obs) || obs.new;
            };

            var updateVisit = function(visit, encounters){
                var visitEncounters = encounters.filter(function(encounter){ return visit.uuid === encounter.visit.uuid; });
                visit.initSavedFiles(visitEncounters);
                visit.changed = false;
                $scope.currentVisit = visit;
                sortVisits();
                flashSuccessMessage();
            };

            $scope.save = function (existingVisit) {
                $scope.toggleGallery=false;
                var visitDocument;
                if ($scope.isNewVisitDateValid()) {
                    visitDocument = createVisitDocument(existingVisit);
                }

                spinner.forPromise(visitDocumentService.save(visitDocument).then(function (response) {
                    return encounterService.getEncountersForEncounterType($scope.patient.uuid, encounterTypeUuid).then(function(encounterResponse){
                        var savedVisit = $scope.visits[$scope.visits.indexOf(existingVisit)];
                        if(!savedVisit){
                            visitService.getVisit(response.data.visitUuid, customVisitParams).then(function(visitResponse){
                                var newVisit = createVisit(visitResponse.data);
                                existingVisit = $scope.visits.push(newVisit);
                                initNewVisit();
                                updateVisit(newVisit, encounterResponse.data.results);
                                $scope.toggleGallery = true;
                            });
                        }else{
                            updateVisit(savedVisit, encounterResponse.data.results)
                            $scope.toggleGallery = true;
                        }
                        getActiveEncounter();
                    });
                }));
            };

            $scope.isPdf = function(file){
                return (file.encodedValue.indexOf(".pdf") > 0);
            };

            $anchorScroll();
        }
    ]);