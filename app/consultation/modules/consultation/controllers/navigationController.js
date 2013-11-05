'use strict';

angular.module('opd.consultation.controllers').controller('ConsultationNavigationController',
    ['$scope', '$rootScope', '$location', '$route', '$window', 'sessionService',
    function ($scope, $rootScope, $location, $route, $window, sessionService) {
    //$scope.mainButtonText = "Consultation";
    $scope.currentBoard = null;
    $scope.availableBoards = [
        { name:'Consultation', url:''},
        { name:'Investigations', url:'investigation'},
        { name:'Diagnosis', url:'diagnosis'},
        { name:'Treatment', url:'treatment'},
        { name:'Disposition', url:'disposition'},
        { name:'Assign Bed', url:'bed-management'},
        { name:'Vitals', url:'concept-set/vitals'}
    ];

    $scope.showBoard = function (name) {
        var board = findBoardByname(name);
        return buttonClickAction(board);
    }

    $scope.logout = function () {
        $rootScope.errorMessage = null;
        sessionService.destroy().then(
            function() {
                $window.location = "/home";
            }
        );
    }

    var stringContains = function(sourceString,pattern){
        return (sourceString.search(pattern) >= 0);
    }

    var initialize = function () {
        var currentPath = $location.path();
        // var pathInfo = currentPath.substr(currentPath.lastIndexOf('/') + 1);
        var board = findBoardByUrl(currentPath);
        $scope.currentBoard = board || $scope.availableBoards[0];
        return;
    }

    var findBoardByname = function (name) {
        var boards = $scope.availableBoards.filter(function (board) {
            return board.name === name;
        });
        return boards.length > 0 ? boards[0] : null;
    }

    var findBoardByUrl = function (url) {
        var urlParts = url.split('/');
        var index = urlParts.indexOf('visit');
        var boards = $scope.availableBoards.filter(function (board) {
       //     return board.url === urlParts[index + 2];
            return stringContains(url,board.url);
        });
        return boards.length > 0 ? boards[1] : null;
    }

    var getUrl = function (board) {
        if (board.url === 'bed-management' && $rootScope.bedDetails) {
            return $location.url("/visit/" + $rootScope.visit.uuid + "/bed-management/wardLayout/" + $rootScope.bedDetails.wardUuid);
        }



        return $location.url("/visit/" + $rootScope.visit.uuid + "/" + board.url);
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
        return getUrl(board);
    }

    initialize();

}]);
