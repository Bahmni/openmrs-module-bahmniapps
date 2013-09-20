'use strict';

angular.module('opd.patient.controllers')
    .controller('ActivePatientsListController', ['$route', '$scope', '$location', '$window','VisitService', 'patientMapper', function ($route, $scope, $location, $window, visitService, patientMapper) {

    $scope.patientTypes = [
        {type:'ALL', display:'All active patients', visible: true, appliedConcept: null},
        {type:'TO_ADMIT', display:'Patients to be admitted', visible: true, appliedConcept: 'Admit Patient'}
    ]; 

    $scope.getactivePatients = function () {
        var queryParameters = $location.search();

        visitService.getActiveVisits(queryParameters).success(function (data) {
            $scope.activeVisits = data.results;
            $scope.activeVisits.forEach(function (visit){
                visit.patient.identifier = visit.patient.identifiers[0].identifier;
                visit.patient.name = visit.patient.names[0].display;
                visit.patient.display = visit.patient.identifier + " - " + visit.patient.name;
                visit.patient.image = patientMapper.constructImageUrl(visit.patient.identifier);
                visit.patient.status = '';

                visit.encounters.forEach(function(en) {
                    //optimize to match to be admitted patients and determining state
                    var matchAdmitType = $scope.patientTypes[1];
                    en.orders.forEach(function(order) {
                        if (order.concept.display === matchAdmitType.appliedConcept) {
                            visit.patient.status = matchAdmitType.type;
                        }
                    });
                });
            });

            $scope.storeWindowDimensions();

            if($scope.activeVisits !== undefined) {
                $scope.searchVisits = $scope.activeVisits;
                $scope.searchableVisits = $scope.searchVisits;
                $scope.visibleVisits= $scope.searchableVisits.slice(0,$scope.tilesToFit);
            }
            $scope.searchCriteria = { searchParameter: '', type: $scope.patientTypes[0].type} ;
        });
    }

    $scope.loadMore = function() {
        if($scope.visibleVisits !== undefined){
            var last = $scope.visibleVisits.length;
            var more = ($scope.searchVisits.length - last);
            var toShow = (more > $scope.tilesToLoad) ? $scope.tilesToLoad : more;
            if (toShow > 0) {
                for(var i = 1; i <= toShow; i++) {
                    $scope.visibleVisits.push($scope.searchVisits[last + i-1]);
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
    }


    var matchesNameOrId = function(patient){
        return patient.display.toLowerCase().search($scope.searchCriteria.searchParameter.toLowerCase()) !== -1;
    };

    $scope.filterPatientList = function () {
        var searchList = [];
        $scope.searchableVisits.forEach(function(visit){
            if(matchesNameOrId(visit.patient))  {
                searchList.push(visit);
            }
        })
        $scope.searchVisits = searchList;
        if($scope.searchVisits !== undefined){
            $scope.visibleVisits = $scope.searchVisits.slice(0, $scope.tilesToFit);
        }
    }

    $scope.consultation = function (visit) {
        $window.location = "../consultation/#/visit/" + visit.uuid;
    }

    var filterPatientListByType = function() {
        var allType = $scope.patientTypes[0].type;
        if ($scope.searchCriteria.type === allType) {
            $scope.searchableVisits = $scope.activeVisits;
        } else {
            var searchList = [];
            $scope.activeVisits.forEach(function(visit){
                if( visit.patient.status === $scope.searchCriteria.type)  {
                    searchList.push(visit);
                }
            });
            $scope.searchableVisits = searchList;
        }
    }


    $scope.showPatientsForType = function(type) {
        $scope.searchCriteria.type = type;
        filterPatientListByType();
        $scope.filterPatientList();
    }

    $scope.getactivePatients();

 }]).directive('resize', function ($window) {
        return function (scope,element) {

            scope.storeWindowDimensions();


            angular.element($window).bind('resize', function () {
                scope.$apply(function () {
                    scope.storeWindowDimensions();
                    if(scope.searchVisits !== undefined){
                        scope.visibleVisits= scope.searchVisits.slice(0,scope.tilesToFit);
                    }
                });
            });
        };
    });;

