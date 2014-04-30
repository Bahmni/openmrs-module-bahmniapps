'use strict';

angular.module('opd.documentupload')
    .controller('DocumentController', ['$scope', '$stateParams', 'visitService', 'patientService', 'encounterService', 'patientMapper', 'spinner', 'visitDocumentService', '$rootScope', '$http', '$q', '$timeout',
        function ($scope, $stateParams, visitService, patientService, encounterService, patientMapper, spinner, visitDocumentService, $rootScope, $http, $q, $timeout) {
            var encounterTypeUuid;
            var topLevelConceptUuid;
            var customVisitParams = Bahmni.DocumentUpload.Constants.visitRepresentation;
            var encounterVisitParams = Bahmni.DocumentUpload.Constants.visitWithEncounterRepresentation;
            var DateUtil = Bahmni.Common.Util.DateUtil;

            $scope.visits = [];

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

            $scope.isNewVisitDateValid = function(){
                var newVisitWithoutTime = Object();
                newVisitWithoutTime.startDatetime = DateUtil.getDate($scope.newVisit.startDatetime);
                newVisitWithoutTime.stopDatetime = $scope.newVisit.stopDatetime ? DateUtil.getDate($scope.newVisit.stopDatetime) : newVisitWithoutTime.startDatetime;

                var existingVisitsInSameRange = $scope.visits.map(function (record) {
                    return { "startDatetime": DateUtil.getDate(record.startDatetime), "stopDatetime": DateUtil.getDate(record.stopDatetime)}
                }).filter(function (existingVisit) {
                    return ((newVisitWithoutTime.startDatetime < existingVisit.stopDatetime || DateUtil.isSameDate(newVisitWithoutTime.startDatetime, existingVisit.stopDatetime)) &&
                        (newVisitWithoutTime.stopDatetime > existingVisit.startDatetime || DateUtil.isSameDate(newVisitWithoutTime.stopDatetime, existingVisit.startDatetime)))
                });

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
                encounterService.getEncountersForEncounterType($rootScope.patient.uuid, encounterTypeUuid).success(function (encounters) {
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
                        var date1 = new Date(a.startDatetime);
                        var date2 = new Date(b.startDatetime);
                        return date2.getTime() - date1.getTime();
                    });
            };

            var init = function () {
                encounterTypeUuid = $scope.encounterConfig.getEncounterTypeUuid($rootScope.appConfig.encounterType);
                initNewVisit();
                var deferrables = $q.defer();
                var promises = [];
                promises.push(getVisitTypes());
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
                    $scope.$apply(image);
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

            var createVisitDocument = function (visit) {
                var visitDocument = {};
                visitDocument.patientUuid = $scope.patient.uuid;
                visitDocument.visitTypeUuid = visit.visitType.uuid;
                visitDocument.visitStartDate = visit.startDate();
                visitDocument.visitEndDate = visit.endDate();
                visitDocument.encounterTypeUuid = encounterTypeUuid;
                visitDocument.encounterDateTime = visitDocument.visitStartDate;
                visitDocument.providerUuid = $rootScope.currentProvider.uuid;
                visitDocument.visitUuid = visit.uuid;
                visitDocument.documents = [];

                visit.savedImages.forEach(function (image) {
                    if (image.changed == true) {
                        visitDocument.documents.push({testUuid: image.concept.uuid, image: image.encodedValue, voided: image.voided, obsUuid: image.obsUuid});
                    }
                });

                visit.images.forEach(function (image) {
                    visitDocument.documents.push({testUuid: image.concept.uuid, image: image.encodedValue.replace(/data:image\/.*;base64/, ""),
                        obsDateTime: new Date(), format: image.encodedValue.split(";base64")[0].split("data:image/")[1]})
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
                    var date = new Date(newVisit.endDate());
                    $scope.newVisit.stopDatetime = moment(date).format("YYYY-MM-DD");
                }
            }

            $scope.save = function (existingVisit) {
                var visitDocument
                if ($scope.isNewVisitDateValid()) {
                    visitDocument = createVisitDocument(existingVisit);
                }

                spinner.forPromise(visitDocumentService.save(visitDocument).then(function (response) {
                    return visitService.getVisit(response.data.visitUuid, encounterVisitParams).then(function (visitResponse) {
                        var visit = createVisit(visitResponse.data);
                        visit.encounters = visit.encounters.filter(function (encounter) {return(encounter.encounterType.uuid == encounterTypeUuid) });
                        visit.initSavedImages();
                        if (existingVisit.isNew()) {
                            existingVisit = $scope.visits.push(visit);
                            initNewVisit();
                            $scope.currentVisit = visit;
                        } else {
                            $scope.visits[$scope.visits.indexOf(existingVisit)] = visit;
                            $scope.currentVisit = visit;
                        }
                        sortVisits();
                        flashSuccessMessage();
                    });
                }));
            };
        }]);