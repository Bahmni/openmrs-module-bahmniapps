'use strict';

angular.module('opd.documentupload')
    .controller('DocumentController', ['$scope', '$route', 'visitService', 'patientService', 'patientMapper', 'spinner', 'visitDocumentService','$rootScope', '$http','$q',
        function ($scope, $route, visitService, patientService, patientMapper, spinner, visitDocumentService, $rootScope, $http, $q) {

            var testUuid;
            var customVisitParams = 'custom:(uuid,startDatetime,stopDatetime,visitType,patient,encounters:(uuid,encounterType,orders:(uuid,orderType,voided,concept:(uuid,set,name),),obs:(uuid,value,concept,obsDatetime,groupMembers:(uuid,concept:(uuid,name),obsDatetime,value:(uuid,name),groupMembers:(uuid,concept:(uuid,name),value:(uuid,name),groupMembers:(uuid,concept:(uuid,name),value:(uuid,name)))))))';
            var newVisitParseDate = function (dateString) {
                return moment(dateString, Bahmni.Common.Constants.dateFormat.toUpperCase()).toDate();
            }

            var noOpParseDate = function(date) { return date; }

            var clearForm = function(){
                $scope.newVisit = {startDatetime: "", stopDatetime: "", visitType: null, parseDate: newVisitParseDate, images: []};
                $scope.currentVisit = $scope.newVisit;
            }

            var getVisitTypes = function(){
                return visitService.getVisitType().then(function (response) {
                    $scope.visitTypes = response.data.results;
                })
            }

            var getPatient = function () {
                return patientService.getPatient($route.current.params.patientUuid).success(function (openMRSPatient) {
                    $rootScope.patient = patientMapper.map(openMRSPatient);
                });
            };

            var getVisits = function(){
                return visitService.search({patient: $rootScope.patient.uuid, v: customVisitParams, includeInactive: true}).then(function (response){
                    $scope.visits = response.data.results;
                    $scope.visits.forEach(bindExisitingDocuments);
                });
            }

            var getDummyTestUuid = function(){                                     //Placeholder testUuid until future stories are played
                return $http.get(Bahmni.Common.Constants.conceptUrl,
                    {
                        params: {name: "cd4 test"}
                    }).then(function(response){
                        testUuid = response.data.results[0].uuid;
                    });
            }

            var init = function () {
                clearForm();
                var deferrables = $q.defer();
                var promises = [];
                promises.push(getVisitTypes());
                promises.push(getPatient().then(getVisits));
                promises.push(getDummyTestUuid());
                $q.all(promises).then(function () {
                    deferrables.resolve();
                });
                return deferrables.promise;
            };
            spinner.forPromise(init());

            var bindExisitingDocuments = function(visit){
                visit.savedImages = [];
                visit.images = [];
                visit.parseDate = noOpParseDate;
                visit.encounters.forEach(function (encounter){
                    encounter.obs && encounter.obs.forEach(function (observation){
                        observation.groupMembers && observation.groupMembers.forEach(function (member){
                            if (member.concept.name.name == 'Document') {
                                visit.savedImages.push(member.value);
                            }
                        });
                    });
                });
            }

            var isNewVisit = function(visit) {
                return visit.uuid == null;
            }

            $scope.resetCurrentVisit = function (visit) {
                $scope.currentVisit = visit;
            }

            $scope.isCurrentVisit = function (visit){
                return $scope.currentVisit.uuid === visit.uuid;
            }

            var createVisitDocument = function(visit) {
                var visitDocument = {};
                visitDocument.patientUuid = $scope.patient.uuid;
                visitDocument.visitTypeUuid = visit.visitType.uuid;
                visitDocument.visitStartDate = visit.parseDate(visit.startDatetime);
                visitDocument.visitEndDate = visit.stopDatetime ? visit.parseDate(visit.stopDatetime) : visitDocument.visitStartDate;
                visitDocument.encounterTypeUuid = $scope.encounterConfig.getRadiologyEncounterTypeUuid();
                visitDocument.encounterDateTime = visitDocument.visitStartDate;
                visitDocument.providerUuid = $rootScope.currentProvider.uuid;
                visitDocument.visitUuid = visit.uuid;
                visitDocument.documents = [];

                visit.images.forEach(function (image) {
                    visitDocument.documents.push({testUuid: testUuid, image: image.replace(/data:image\/.*;base64/, ""),
                        format: image.split(";base64")[0].split("data:image/")[1]})
                });
                return visitDocument;
            }

            var updateVisit = function(documentSaveData, visit) {
                visitService.getVisit(documentSaveData.visitUuid, customVisitParams).success(function(visitResponse) {
                    if(isNewVisit(visit)) {
                        visit = visitResponse;
                        $scope.visits.push(visit);
                    }
                    bindExisitingDocuments(visit);
                })
            }

            $scope.save = function (visit) {
                $scope.resetCurrentVisit(visit);
                if(visit.images.length == 0) {
                    $rootScope.server_error = "Please select at least one document to upload";
                    return;
                }

                var visitDocument = createVisitDocument(visit);
                spinner.forPromise(function() {
                    return visitDocumentService.save(visitDocument).success(function (data) {
                        clearForm();
                        updateVisit(data, visit);
                    });
                }())
            }
        }])
