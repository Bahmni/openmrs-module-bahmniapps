angular.module('bahmni.common.uiHelper')
    .controller('imageGalleryController', ['$scope' ,function ($scope) {
        var photos = [];

        angular.forEach($scope.$parent.records, function(record){
            photos.push({src: Bahmni.Common.Constants.documentsPath + '/' + record.imageObservation.value, title: record.concept.name, desc:record.imageObservation.comment, date: record.imageObservation.observationDateTime});
        });
        $scope.imageIndex = $scope.currentObservation ? _.findIndex($scope.$parent.records, function(record){
            return record.imageObservation.uuid === $scope.currentObservation.uuid;
        }) : 0;


        $scope.photos = photos;
        $scope.patient = $scope.$parent.patient;
        $scope.title = $scope.$parent.title;
    }])
    .factory('galleryDialogControl', function(ngDialog){
        var open = function(scope) {
            ngDialog.open({
                template: 'views/gallery.html',
                controller: 'imageGalleryController',
                className: undefined,
                scope: scope
            });
        }
        return {open: open}
    })
    .directive('galleryDialog', function(galleryDialogControl) {
        var link = function($scope, element, attrs){
            element.click(function(e){
                e.stopPropagation();
                galleryDialogControl.open($scope);
            });
        };

        return{
            link: link,
            scope: {
                imageIndex: "=",
                records: "=galleryDialog",
                currentObservation: "=",
                patient: "=",
                title: "@"
            }
        }
    });