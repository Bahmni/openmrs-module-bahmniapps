angular.module('opd.consultation')
.directive('investigationsSelector',function(){
    var getCategories = function(tests, categoryColumn){
        var categories = [];
        angular.forEach(tests, function(test){
            var categoryData = test[categoryColumn] || {name: "Other"};
            var category = categories.filter(function(category) { return category.name === categoryData.name })[0];
            if(category) {
                category.tests.push(test);
            } else {
                categories.push({name: categoryData.name, tests: [test]});
            }
        });
        return categories;
    }

    var controller = function($scope) {
        $scope.$watch('tests', function(){
            $scope.categories = getCategories($scope.tests, $scope.categoryColumn);    
        });
    }

    return {
        restrict: 'EA',
        templateUrl: 'modules/consultation/views/investigationsSelector.html',
        controller: controller,
        scope: {
            tests: "=",
            filters: "=",
            groups: "=",
            groupTitle: "@",
            filterCoumn: "@",
            categoryColumn: "@"
        }
    }
});