'use strict';

angular.module('opd.patient.controllers')
    .controller('ActivePatientsListController', ['$route', '$scope', '$location', '$window','patientService', 'patientMapper', function ($route, $scope, $location, $window, patientService, patientMapper) {

    $scope.patientTypes = [
        {name:'ALL', display:'All active patients', visible: true, retriever:'allActivePatients'},
        {name:'TO_ADMIT', display:'Patients to be admitted', visible: true, retriever:'activePatientsForAdmission'},
        {name:'ADMITTED', display:'All admitted patients', visible: true, retriever:'admittedPatients'},
        {name:'TO_DISCHARGE', display:'Patients to be discharged', visible: true, retriever:'patientsToBeDischarged'}
    ];

    var retriever = {};
    var handlePatientList = function(patientList, callback) {
        resetPatientLists();
        if (patientList) {
            $scope.storeWindowDimensions();
            patientList.forEach(function (patient){
                patient.display = patient.identifier + " - " + patient.name;
                patient.image = patientMapper.constructImageUrl(patient.identifier);
            });
            $scope.activePatients = patientList;
            $scope.searchResults = $scope.activePatients;
            $scope.visiblePatients= $scope.searchResults.slice(0,$scope.tilesToFit);
        }
        if (callback) {
            callback();
        }
    };
    retriever.allActivePatients = function (afterRetrieveCallback) {
        patientService.getAllActivePatients().success(function (data) {
            handlePatientList(data, afterRetrieveCallback);
        });
    };
    retriever.activePatientsForAdmission = function (afterRetrieveCallback) {
        patientService.getAllActivePatientsForAdmission().success(function (data) {
            handlePatientList(data, afterRetrieveCallback);
        });
    };
    retriever.admittedPatients = function (afterRetrieveCallback) {
        patientService.getAdmittedPatients().success(function (data) {
            handlePatientList(data, afterRetrieveCallback);
        });
    };
    retriever.patientsToBeDischarged = function (afterRetrieveCallback) {
        patientService.getAllPatientsToBeDischarged().success(function (data) {
            handlePatientList(data, afterRetrieveCallback);
        });
    };

    $scope.loadMore = function() {
        if($scope.visiblePatients !== undefined){
            var last = $scope.visiblePatients.length;
            var more = ($scope.searchResults.length - last);
            var toShow = (more > $scope.tilesToLoad) ? $scope.tilesToLoad : more;
            if (toShow > 0) {
                for(var i = 1; i <= toShow; i++) {
                    $scope.visiblePatients.push($scope.searchResults[last + i-1]);
                }
            }
        }
    };

    $scope.storeWindowDimensions = function(){
        var windowWidth = window.innerWidth;
        var windowHeight = window.innerHeight;

        var tileWidth = Bahmni.Opd.Constants.patientTileWidth;
        var tileHeight = Bahmni.Opd.Constants.patientTileHeight;
        $scope.tilesToFit = Math.ceil(windowWidth * windowHeight / (tileWidth * tileHeight));
        $scope.tilesToLoad =  Math.ceil($scope.tilesToFit*Bahmni.Opd.Constants.tileLoadRatio);
    };


    var matchesNameOrId = function(patient){
        return patient.display.toLowerCase().search($scope.searchCriteria.searchParameter.toLowerCase()) !== -1;
    };

    $scope.searchPatients = function () {
        var searchList = $scope.activePatients.filter(function(patient){
            return matchesNameOrId(patient);
        });
        $scope.searchResults = searchList;
        if($scope.searchResults){
            $scope.visiblePatients = $scope.searchResults.slice(0, $scope.tilesToFit);
        }
    };

    $scope.consultation = function (patient) {
        $window.location = "../consultation/#/visit/" + patient.activeVisitUuid;
    };

    var findPatientListType = function(typeName) {
        var matchingTypes = $scope.patientTypes.filter(function(type) {
            return type.name === typeName;
        });
        return matchingTypes ? matchingTypes[0] : null;
    }
    
    $scope.showPatientsForType = function(typeName) {
        var pType = findPatientListType(typeName);
        $scope.searchCriteria.type = pType;
        retriever[pType.retriever](function() {
            $scope.searchPatients();
        });
    };

    var resetPatientLists = function() {
        $scope.activePatients = [];
        $scope.searchResults = [];
        $scope.visiblePatients = [];
    }

    var initialize = function() {
        resetPatientLists();
        $scope.searchCriteria = { searchParameter: '', type: $scope.patientTypes[0]};
        retriever.allActivePatients();
    };

    initialize();

 }]).directive('resize', function ($window) {
        return function (scope,element) {
            scope.storeWindowDimensions();
            angular.element($window).bind('resize', function () {
                scope.$apply(function () {
                    scope.storeWindowDimensions();
                    if(scope.searchResults !== undefined){
                        scope.visiblePatients= scope.searchResults.slice(0,scope.tilesToFit);
                    }
                });
            });
        };
    });;

