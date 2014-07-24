angular.module('bahmni.common.uiHelper')
    .directive('gallery', function(){
        var link = function($scope){
            KeyboardJS.on('right', function() {
                $scope.$apply(function(){
                    $scope.showNext();
                });
            });
            KeyboardJS.on('left', function() {
                $scope.$apply(function(){
                    $scope.showPrev();
                });
            });
            $scope.$on('$destroy', function(){
                KeyboardJS.clear('right');
                KeyboardJS.clear('left');
            });
        };
        return {
            restrict: 'E',
            link: link,
            scope: {
                imageIndex: "=",
                photos: "="
            },
            template:
                '<div class="container slider">' +
                    '<div class="messages" ng-if="!photos.length">' +
                        '<p class="messages null-data-message">No images to display</p>' +
                    '</div>' +
                    '<div ng-repeat="photo in photos">' +
                        '<img class="slide" hm-swipe-right="showPrev()" hm-swipe-left="showNext()" ng-show="isActive($index)" ng-src="{{photo.src}}" />' +
                    '</div>'+
                    '<span ng-if="photos.length > 1" class="arrow prev"  ng-click="showPrev()"></span>' +
                    '<span ng-if="photos.length > 1" class="arrow next"  ng-click="showNext()"></span>' +
               '</div>'+
               '<div ng-repeat="photo in photos">' +                      
                 '<div class="image-bottom-bar" ng-if="isActive($index)">'+
                    '<div class="fl"><span class="image-title">{{photo.title}}</span>, <span class="image-date">{{photo.date | date: "dd MMM yy"}}</span></div>' +
                    '<span class="image-index fr">({{$index+1}} of {{photos.length}})</span>' +
                  '</div>' +
                  '<div class="image-desc" ng-if="isActive($index) && photo.desc"><strong>Comments:</strong> {{photo.desc}}</div>' +
                '</div>',
            controller: ['$scope', '$http', function($scope, $http) {

                $scope._Index = $scope.imageIndex || 0;

                $scope.isActive = function (index) {
                    return $scope._Index === index;
                };

                $scope.showPrev = function () {
                    $scope._Index = ($scope._Index > 0) ? --$scope._Index : $scope.photos.length - 1;
                };

                $scope.showNext = function () {
                    $scope._Index = ($scope._Index < $scope.photos.length - 1) ? ++$scope._Index : 0;
                };

                $scope.showPhoto = function (index) {
                    $scope._Index = index;
                };
            }]
        };
    });