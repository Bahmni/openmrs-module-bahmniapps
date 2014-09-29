angular.module('bahmni.clinical')
    .directive('diseaseTemplate', function () {
        return {
            restrict:'E',
            scope:{
                templates:"=",
                templateToDisplay:"="
            },
            link:function(scope, element, attrs){
                scope.diseaseTemplate = _.find(scope.templates,function(template){
                    return template.name === scope.templateToDisplay;
                })
            },
            templateUrl:"views/diseaseTemplateView.html"
        };
    });