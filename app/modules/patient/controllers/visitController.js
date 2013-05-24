'use strict';

angular.module('registration.visitController', ['resources.patientService', 'resources.visitService', 'resources.concept', 'resources.bmi','resources.date', 'infrastructure.spinner'])
    .controller('VisitController', ['$scope', '$location', 'patientService', 'visitService', 'concept', 'bmi','date', '$window', '$route', 'spinner', '$timeout', function ($scope, $location, patientService, visitService, conceptService, bmiModule, date, $window, $route, spinner, $timeout) {
    var registrationConcepts = [];

    (function () {
        $scope.encounter = {};
        $scope.obs = {};
        $scope.visit = {};
        $scope.patient = patientService.getPatient();
        $scope.obs.registration_fees = defaults.registration_fees($scope.patient.isNew);

        var registrationConceptsPromise = conceptService.getRegistrationConcepts().success(function (data) {
            var concepts = data.results[0].setMembers;
            concepts.forEach(function (concept) {
                registrationConcepts.push({name: concept.name.name, uuid: concept.uuid });
            });
        });
        spinner.forPromise(registrationConceptsPromise);
    })();

    $scope.calculateBMI = function () {
        if($scope.obs.height && $scope.obs.weight){
            var bmi = bmiModule.calculateBmi($scope.obs.height, $scope.obs.weight);
            var valid = bmi.valid();
            $scope.obs.bmi_error = !valid;
            $scope.obs.bmi = bmi.value;
            $scope.obs.bmi_status = valid ? bmi.status() : "Invalid";
        } else {
            $scope.obs.bmi_error = false;
            $scope.obs.bmi = null;
            $scope.obs.bmi_status = null;
        }
    };

    $scope.back = function () {
        $window.history.back();
    };

    $scope.registrationFeeLabel = $scope.patient.isNew ? "Registration Fee" : "Consultation Fee";

    var save = function(successCallback){
        var datetime = date.now().toISOString();
        $scope.visit.patient = $scope.patient.uuid;
        $scope.visit.startDatetime = datetime;
        $scope.visit.visitType = $scope.patient.isNew ? constants.visitType.registration : constants.visitType.returningPatient;

        $scope.encounter.patient = $scope.patient.uuid;
        $scope.encounter.encounterDatetime = datetime;
        $scope.encounter.encounterType = constants.visitType.registration;

        $scope.encounter.obs = [];
        registrationConcepts.forEach(function (concept) {
            var conceptName = concept.name.replace(" ","_").toLowerCase();
            var value = $scope.obs[conceptName];
            if(value != null && value!=""){
                $scope.encounter.obs.push({concept:concept.uuid,value:value});
            }
        });
        $scope.visit.encounters = [$scope.encounter];

        visitService.create($scope.visit).success(function(){
            patientService.clearPatient();
            if(successCallback) successCallback();
            var path = $scope.patient.isNew ? "/patient/new" : "/search";
            $timeout(function(){
                $location.path(path);
            }, 100)
        });
    }

    $scope.submit = function(){
        if($scope.patient.isNew) {
            $scope.saveAndPrint();
        }
        else {
            save();
        }
    }

    $scope.saveAndPrint = function () {
        save(function(){
            $scope.printPatient();
        });
    };

    $scope.today = function(){
        return new Date();
    };

    $scope.printLayout = function() {
        return $route.routes['/printPatient'].templateUrl;
    };

    $scope.printPatient = function () {
        var hiddenFrame = document.getElementById("printPatientFrame");
        var code = "<!doctype html>"+
                    "<html>"+
                        "<head>" +
                            '<style type="text/css">' +
                                '.hindi-text { vertical-align:bottom; }' +
                                'h1, h2, h3 { padding: 0; margin: 0;}' +
                            '</style>'+
                       "</head>"+
                        "<body>" +
                             document.getElementById('registrationCard').innerHTML +
                        "</body>"+
                    "</html>";
        var doc = hiddenFrame.contentWindow.document.open("text/html", "replace");
        doc.write(code);
        doc.close();
        var x  = hiddenFrame.contentWindow.print();
        console.log(x);
    };
 }]);
