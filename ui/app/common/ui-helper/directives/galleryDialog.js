angular.module('bahmni.common.uiHelper')
    .controller('imageGalleryController', ['$scope' ,function ($scope) {
        var photos = [];

        angular.forEach($scope.$parent.records, function(data){
            photos.push({src: data.src, desc: data.concept.name, date: data.obsDatetime || data.dateTime });
        });

        $scope.photos = photos;
        $scope.patient = $scope.$parent.patient;
    }])
    .directive('galleryDialog', function(ngDialog) {
        var link = function($scope, element, attrs){
            element.click(function(){
                ngDialog.open({
                    template: 'views/gallery.html',
                    controller: 'imageGalleryController',
                    className: undefined,
                    scope: $scope
                });
            });
        };

        return{
            link: link,
            scope: {
                imageIndex: "=",
                records: "=galleryDialog",
                patient: "="
            }
        }
    });