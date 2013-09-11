'use strict';

angular.module('opd.patient.controllers')
    .controller('ActivePatientsListController', ['$route', '$scope', '$location', '$window','VisitService', 'patientMapper', function ($route, $scope, $location, $window, visitService, patientMapper) {
        $scope.getactivePatients = function () {
        var queryParameters = $location.search();

        visitService.getActiveVisits(queryParameters).success(function (data) {
            $scope.activeVisits = data.results;
            $scope.activeVisits.forEach(function (visit){
                var display = visit.patient.display.split(' - ');
                var identifier = display[0];
                var name = display[1];

                visit.patient.identifier = identifier;
                visit.patient.name = name;
                visit.patient.image = patientMapper.constructImageUrl(identifier);
            });

            $scope.storeWindowDimensions();

            if($scope.activeVisits !== undefined){
                $scope.searchVisits = $scope.activeVisits;
                $scope.visibleVisits= $scope.searchVisits.slice(0,$scope.tilesToFit);
            }
        });
    }

    $scope.loadMore = function() {
        if($scope.visibleVisits !== undefined){
            var last = $scope.visibleVisits.length - 1;
            if(last <= $scope.searchVisits.length ){
                for(var i = 1; i <=$scope.tilesToLoad ; i++) {
                    $scope.visibleVisits.push($scope.searchVisits[i+last]);
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
        return patient.display.toLowerCase().search($scope.searchParameter.toLowerCase()) !== -1;
    };

    $scope.filterPatientList = function () {
        var searchList = [];
        $scope.activeVisits.forEach(function(visit){
            if(matchesNameOrId(visit.patient))  {
                searchList.push(visit);
            }
        })
        $scope.searchVisits = searchList;
        if($scope.searchVisits !== undefined){
            $scope.visibleVisits= $scope.searchVisits.slice(0, $scope.tilesToFit);
        }
    }

    $scope.consultation = function (visit) {
        $window.location = "../consultation/#/visit/" + visit.uuid;
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

