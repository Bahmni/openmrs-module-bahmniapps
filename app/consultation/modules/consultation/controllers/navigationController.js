'use strict';

angular.module('opd.consultation.controllers')
    .controller('ConsultationNavigationController', ['$scope', '$rootScope', '$location', '$route', function ($scope, $rootScope, $location, $route) {
    //$scope.mainButtonText = "Consultation";
    $scope.currentBoard = null;
    $scope.availableBoards = [
        { name:'Consultation', url: ''},
        { name:'Investigations', url:'investigation'},
        { name:'Diagnosis', url:'diagnosis'}, 
        { name:'Treatment', url:'treatment'}, 
        { name:'Disposition', url:'disposition'}];

    $scope.showBoard = function(name) {
        var board = findBoardByname(name);
        return buttonClickAction(board);
    }

    var initialize = function() {
        var currentPath = $location.path();
        var pathInfo = currentPath.substr(currentPath.lastIndexOf('/') + 1);
        var board = findBoardByUrl(pathInfo);
        $scope.currentBoard = board || $scope.availableBoards[0];
        return;
    }

    var findBoardByname = function(name) {
        var boards = $scope.availableBoards.filter(function(board){
            return board.name === name;
        });
        return boards.length > 0 ? boards[0] : null;
    }

    var findBoardByUrl = function(url) {
        var boards = $scope.availableBoards.filter(function(board){
            return board.url === url;
        });
        return boards.length > 0 ? boards[0] : null;
    }

    var buttonClickAction = function (board) {
        if ($scope.currentBoard) {
            if ($scope.currentBoard === board) {
                return;
            }
        }

        if ($rootScope.beforeContextChange) {
            var changeCtx = $rootScope.beforeContextChange();
            if (!changeCtx) {
                return;
            }
        }
        $rootScope.beforeContextChange = null;
        $scope.currentBoard = board;
        return $location.url("/visit/" + $rootScope.visit.uuid + "/" + board.url);
    }

    initialize();

}]);
