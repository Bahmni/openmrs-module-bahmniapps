'use strict';

angular.module('opd.documentupload')
    .controller('DocumentController', ['$scope', '$route', 'visitService', 'patientService', 'patientMapper', 'spinner', 'visitDocumentService','$rootScope', '$http','$q',
        function ($scope, $route, visitService, patientService, patientMapper, spinner, visitDocumentService, $rootScope, $http, $q) {

            var testUuid;
            var clearForm = function(){
                $scope.visitType = null;
                $scope.visits = [];
                $scope.images = [];
                $scope.newImagesForVisit = {};
                $scope.oldDocumentForVisit = {};
                $scope.endDate = "";
                $scope.startDate = "";
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
                return visitService.search({patient: $rootScope.patient.uuid, v: 'custom:(uuid,startDatetime,stopDatetime,visitType,patient,encounters:(uuid,encounterType,orders:(uuid,orderType,voided,concept:(uuid,set,name),),obs:(uuid,value,concept,obsDatetime,groupMembers:(uuid,concept:(uuid,name),obsDatetime,value:(uuid,name),groupMembers:(uuid,concept:(uuid,name),value:(uuid,name),groupMembers:(uuid,concept:(uuid,name),value:(uuid,name)))))))', includeInactive: true}).then(function (response){
                    $scope.visits = response.data.results;
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
                promises.push(getPatient());
                promises.push(getVisits());
                promises.push(getDummyTestUuid());
                $q.all(promises).then(function () {
                    deferrables.resolve();
                    bindExisitingDocuments();
                });
                return deferrables.promise;
            };

            var bindExisitingDocuments = function(){
                if (!$scope.visits) {
                    bindExisitingDocuments();
                };
                $scope.visits.forEach(function (visit){
                    $scope.oldDocumentForVisit[visit.uuid] = [];
                    visit.encounters.forEach(function (encounter){
                        encounter.obs.forEach(function (observation){
                            observation.groupMembers.forEach(function (member){
                                if (member.concept.name.name == 'Document') {
                                    $scope.oldDocumentForVisit[visit.uuid].push(member.value);
                                }
                            });
                        });
                    });
                })
            }

            spinner.forPromise(init());
            

            var parseDate = function (dateString) {
                return moment(dateString, Bahmni.Common.Constants.dateFormat.toUpperCase()).toDate();
            }



            $scope.resetCurrentVisit = function (visit) {
                var documentsOfVisit = [];
                $scope.newImagesForVisit = {};
                $scope.currentVisitUuid = visit.uuid;
                $scope.newImagesForVisit[visit.uuid] = []; 
            }

            $scope.isCurrentUuid = function (visitUuid){
                return $scope.currentVisitUuid === visitUuid;
            }

            $scope.save = function () {
                if($scope.images.length == 0) {
                    $rootScope.server_error = "Please select at least one document to upload";
                    return;
                }
                var visitDocument = {};
                visitDocument.patientUuid = $scope.patient.uuid;
                visitDocument.visitTypeUuid = $scope.visitType.uuid;
                visitDocument.visitStartDate = parseDate($scope.startDate);
                visitDocument.visitEndDate = $scope.endDate ? parseDate($scope.endDate) : visitDocument.visitStartDate;
                visitDocument.encounterTypeUuid = $scope.encounterConfig.getRadiologyEncounterTypeUuid();
                visitDocument.encounterDateTime = visitDocument.visitStartDate;
                visitDocument.providerUuid = $rootScope.currentProvider.uuid;
                visitDocument.documents = [];

                if(!$rootScope.visitDocuments){
                   $rootScope.visitDocuments = new Array();
                }
                $rootScope.visitDocuments.push(visitDocument); 


                $scope.images.forEach(function (image) {
                    visitDocument.documents.push({testUuid: testUuid, image: image.replace(/data:image\/.*;base64/, ""),
                        format: image.split(";base64")[0].split("data:image/")[1]})
                })
                visitDocumentService.save(visitDocument).success(function () {
                    $scope.success = true;
                    clearForm()
                });

            }
        }])
    .directive('fileUpload', function () {
        return{
            restrict: 'A',
            link: function (scope, element) {
                element.bind("change", function () {
                    var file = element[0].files[0],
                        reader = new FileReader();
                    reader.onload = function (event) {
                        var image = event.target.result;
                        var alreadyPresent = scope.images.filter(function (img) {
                            return img === image;
                        })
                        if (alreadyPresent.length == 0) {
                            scope.images.push(image);
                            scope.newImagesForVisit[scope.currentVisitUuid].push(image);
                            scope.$apply();
                        }
                    };
                    reader.readAsDataURL(file);
                });
            }
        }
    });