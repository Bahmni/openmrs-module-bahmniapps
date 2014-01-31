'use strict';

angular.module('opd.documentupload')
    .controller('DocumentController', ['$scope', '$route', 'visitService', 'patientService', 'patientMapper', 'spinner', 'visitDocumentService', '$rootScope', '$http', '$q',
        function ($scope, $route, visitService, patientService, patientMapper, spinner, visitDocumentService, $rootScope, $http, $q) {

            var testUuid;
            var customVisitParams = 'custom:(uuid,startDatetime,stopDatetime,visitType,patient,encounters:(uuid,encounterType,orders:(uuid,orderType,voided,concept:(uuid,set,name),),obs:(uuid,value,concept,obsDatetime,groupMembers:(uuid,concept:(uuid,name),obsDatetime,value:(uuid,name),groupMembers:(uuid,concept:(uuid,name),value:(uuid,name),groupMembers:(uuid,concept:(uuid,name),value:(uuid,name)))))))';

            $scope.visits = [];

            var initNewVisit = function () {
                $scope.newVisit = new Bahmni.Opd.DocumentUpload.Visit();
                $scope.currentVisit = $scope.newVisit;
            };

            var createVisit = function (visit) {
                var newVisit = angular.extend(new Bahmni.Opd.DocumentUpload.Visit(), visit);
                newVisit.initSavedImages();
                return newVisit;
            };

            var getVisitTypes = function () {
                return visitService.getVisitType().then(function (response) {
                    $scope.visitTypes = response.data.results;
                })
            };

            var getPatient = function () {
                return patientService.getPatient($route.current.params.patientUuid).success(function (openMRSPatient) {
                    $rootScope.patient = patientMapper.map(openMRSPatient);
                });
            };

            var getVisits = function () {
                return visitService.search({patient: $rootScope.patient.uuid, v: customVisitParams, includeInactive: true}).then(function (response) {
                    response.data.results.forEach(function (visit) {
                        $scope.visits.push(createVisit(visit));
                    });
                });
            };

            var getDummyTestUuid = function () {                                     //Placeholder testUuid until future stories are played
                return $http.get(Bahmni.Common.Constants.conceptUrl,
                    {
                        params: {name: "cd4 test"}
                    }).then(function (response) {
                        testUuid = response.data.results[0].uuid;
                    });
            };

            var sortVisits = function() {
                $scope.visits.sort(function(a, b) {
                        var date1 = new Date(a.startDatetime);
                        var date2 = new Date(b.startDatetime);
                        return date2.getTime() - date1.getTime();
                    });
            }

            var init = function () {
                initNewVisit();
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

            $scope.resetCurrentVisit = function (visit) {
                $scope.currentVisit = visit;
            };

            $scope.isCurrentVisit = function (visit) {
                return $scope.currentVisit.uuid === visit.uuid;
            };

            var createVisitDocument = function (visit) {
                var visitDocument = {};
                visitDocument.patientUuid = $scope.patient.uuid;
                visitDocument.visitTypeUuid = visit.visitType.uuid;
                visitDocument.visitStartDate = visit.startDate();
                visitDocument.visitEndDate = visit.endDate();
                visitDocument.encounterTypeUuid = $scope.encounterConfig.getRadiologyEncounterTypeUuid();
                visitDocument.encounterDateTime = visitDocument.visitStartDate;
                visitDocument.providerUuid = $rootScope.currentProvider.uuid;
                visitDocument.visitUuid = visit.uuid;
                visitDocument.documents = [];

                visit.savedImages.forEach(function (image) {
                    if (image.voided == true) {
                        visitDocument.documents.push({testUuid: testUuid, image: image.encodedValue, voided: true, obsUuid: image.obsUuid});
                    }
                });

                visit.images.forEach(function (image) {
                    visitDocument.documents.push({testUuid: testUuid, image: image.encodedValue.replace(/data:image\/.*;base64/, ""),
                        format: image.encodedValue.split(";base64")[0].split("data:image/")[1]})
                });
                return visitDocument;
            };

            $scope.save = function (existingVisit) {
                $scope.resetCurrentVisit(existingVisit);

                var visitDocument = createVisitDocument(existingVisit);
                spinner.forPromise(function () {
                    return visitDocumentService.save(visitDocument).success(function (response) {
                        visitService.getVisit(response.visitUuid, customVisitParams).success(function (savedVisit) {
                            if (existingVisit.isNew()) {
                                existingVisit = $scope.visits.push(createVisit(savedVisit));
                                initNewVisit();
                            } else {
                                $scope.visits[$scope.visits.indexOf(existingVisit)] = createVisit(savedVisit);
                            }
                        }).success(function(){
                            sortVisits();
                        });
                    });
                }())
            };

        }]);
