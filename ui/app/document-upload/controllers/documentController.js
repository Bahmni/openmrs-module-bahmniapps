'use strict';

angular.module('opd.documentupload')
    .controller('DocumentController', ['$scope', '$stateParams', 'visitService', 'patientService', 'encounterService', 'spinner', 'visitDocumentService', '$rootScope', '$http', '$q', '$timeout',
        function ($scope, $stateParams, visitService, patientService, encounterService, spinner, visitDocumentService, $rootScope, $http, $q, $timeout) {
            var encounterTypeUuid;
            var topLevelConceptUuid;
            var customVisitParams = Bahmni.DocumentUpload.Constants.visitRepresentation;
            var DateUtil = Bahmni.Common.Util.DateUtil;
            var patientMapper = new Bahmni.PatientMapper($rootScope.patientConfig);
            var activeEncounter = {};

            $scope.visits = [];

            var setOrientationWarning = function() {
                $scope.orientation_warning = (window.orientation && (window.orientation < 0 || window.orientation > 90));
            }
            setOrientationWarning();
            var onOrientationChange = function() {
                $scope.$apply(setOrientationWarning);
            }
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
                        visit.encounters = encounters.results.filter(function(a) {return(a.visit.uuid==visit.uuid)});
                        visit.initSavedImages();
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
                return $http.get(Bahmni.Common.Constants.conceptUrl,
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
                    includeAll :  Bahmni.Common.Constants.includeAllObservations
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

            $scope.escapeRegExp = function(str) {
              return (str || "").replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
            };

            $scope.getConcepts = function(request){
                return $http.get(Bahmni.Common.Constants.conceptUrl, { params: {q: request.term, memberOf: topLevelConceptUuid, v: "custom:(uuid,name)"}});
            };

            $scope.getDataResults = function(data){
                return data.results.map(function (concept) {
                    return {'concept': {uuid: concept.uuid, name: concept.name.name, editableName: concept.name.name}, 'value': concept.name.name}
                });
            };

            $scope.setConceptOnImage = function (image, selectedItem) {
                if (selectedItem) {
                    image.concept = Object.create(selectedItem.concept);
                    image.changed = true;
                }
            };

            $scope.onConceptSelected = function(image){
                return function(selectedItem){
                    $scope.setConceptOnImage(image, selectedItem);
                }
            };

            $scope.resetCurrentVisit = function (visit) {
                $scope.currentVisit = ($scope.isCurrentVisit(visit)) ? $scope.newVisit : visit;
            };

            $scope.isCurrentVisit = function (visit) {
                return $scope.currentVisit && $scope.currentVisit.uuid === visit.uuid;
            };

            var getEncounterStartDateTime = function (visit) {
                var currentDate = new Date();
                if(visit.endDate()){
                    return currentDate <= visit.endDate() ? currentDate : visit.startDate();
                }
                return currentDate;
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
                visitDocument.documents = [];

                visit.savedImages.forEach(function (image) {
                    if (image.changed == true) {
                        var imageUrl = image.encodedValue.replace(Bahmni.Common.Constants.documentsPath + "/", "");
                        visitDocument.documents.push({testUuid: image.concept.uuid, image: imageUrl, voided: image.voided, obsUuid: image.obsUuid});
                    }
                });

                visit.images.forEach(function (image) {
                    var imageUrl = image.encodedValue.replace(Bahmni.Common.Constants.documentsPath + "/", "");
                    visitDocument.documents.unshift({testUuid: image.concept.uuid, image: imageUrl, obsDateTime: getEncounterStartDateTime(visit)})
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
                    $scope.newVisit.stopDatetime = moment(date).format("YYYY-MM-DD");
                }
            };

            var isObsByCurrentProvider = function (obs) {
                return $rootScope.currentUser.person.uuid === obs.providerUuid;
            };

            $scope.canDeleteImage = function(obs){
                return isObsByCurrentProvider(obs) || obs.new;
            };

            var updateVisit = function(visit, encounters){
                visit.encounters = encounters.filter(function(encounter){
                    return visit.uuid === encounter.visit.uuid;
                });
                visit.initSavedImages();
                $scope.currentVisit = visit;
                sortVisits();
                flashSuccessMessage();
            };

            $scope.save = function (existingVisit) {
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
                            });
                        }else{
                            updateVisit(savedVisit, encounterResponse.data.results)
                        }
                        getActiveEncounter();
                    });
                }));
            };
        }]);