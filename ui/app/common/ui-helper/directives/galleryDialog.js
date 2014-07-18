angular.module('bahmni.common.uiHelper')
    .controller('imageGalleryController', ['$scope' ,function ($scope) {
        var photos = [];

        //WIP: TODO: Move to use observations everywhere
        var observations = $scope.$parent.observations;
        if($scope.$parent.records) {
            angular.forEach($scope.$parent.records, function(data){
                photos.push({src: data.src, desc: data.concept.name, date: data.obsDatetime || data.dateTime });
            });
        } else if(observations) {
            angular.forEach(observations, function(observation){
                photos.push({src: Bahmni.Common.Constants.documentsPath + '/' + observation.value, desc: observation.concept.name, date: observation.observationDateTime});
            });
            $scope.imageIndex = _.findIndex(observations,function(observation){
                return observation.uuid === $scope.currentObservation.uuid;
            });
        }


        $scope.photos = photos;
        $scope.patient = $scope.$parent.patient;
        $scope.title = $scope.$parent.title;
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
                observations: "=",
                currentObservation: "=",
                patient: "=",
                title: "@"
            }
        }
    });