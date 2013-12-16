angular.module('opd.consultation')
.directive('investigationsSelector',function(){
    var Selectable = function(data, selectableChildren) {
        angular.extend(this, data);
        var selectionSources = [];
        var children = selectableChildren || [];

        this.isSelected = function() {
            return selectionSources.length > 0;
        }

        this.addChild = function(selectable) {
            children.push(selectable);
        }

        this.select = function() {
            this.selectVia(this);
            selectChildren();
        }

        var selectChildren = function() {
            angular.forEach(children, function(child){
                child.selectVia(this);
            });
        }

        var unselectChildren = function() {
            angular.forEach(children, function(child){
                child.unselectVia(this);
            });
        }

        this.unselect = function() {
            selectionSources.length = 0;
            unselectChildren();
        }

        this.toggle = function() {
            this.isSelected() ? this.unselect() : this.select();
        }

        this.toggleVia = function(selectionSource) {
            this.isSelected() ? this.unselectVia(selectionSource) : this.selectVia(selectionSource);
        }

        this.selectVia = function(selectionSource) {
            if(selectionSources.indexOf(selectionSource) === -1)
                selectionSources.push(selectionSource);
        }        

        this.unselectVia = function(selectionSource) {
            var index = selectionSources.indexOf(selectionSource)
            if(index !== -1) {
                selectionSources.splice(index, 1);
            }
            unselectChildren();
        }        
    }



    var controller = function($scope) {
        var setSelectables = function(tests, categoryColumn) {
            var categories = [];
            var selectablePanels = [];
            var filters = [];
            angular.forEach(tests, function(test){
                var selectableTest = new Selectable(test);            
                var categoryData = test[categoryColumn] || {name: "Other"};
                var category = categories.filter(function(category) { return category.name === categoryData.name })[0];
                category ? category.tests.push(selectableTest) : categories.push({name: categoryData.name, tests: [selectableTest]});
                angular.forEach(test.panels, function(testPanel){
                    var selectablePanel = selectablePanels.filter(function(panel){ return panel.name === testPanel.name })[0];
                    if(selectablePanel) {
                        selectablePanel.addChild(selectableTest)
                    } else {
                        selectablePanel = new Selectable(testPanel, [selectableTest]);
                        selectablePanels.push(selectablePanel)                    
                    }
                });
                var filter = test[$scope.filterColumn];
                if(filters.indexOf(filter) === -1) filters.push(filter);
            });
            $scope.categories = categories;
            $scope.selectablePanels = selectablePanels;
            $scope.filters = filters;
        }

        $scope.$watch('tests', function(){
            setSelectables($scope.tests, $scope.categoryColumn);
        });

        $scope.toggleTest = function(test) {
            test.toggleVia(test);
        }

        $scope.togglePanel = function(panel) {
            panel.toggle();
        }
    }

    return {
        restrict: 'EA',
        templateUrl: 'modules/consultation/views/investigationsSelector.html',
        controller: controller,
        scope: {
            tests: "=",
            filterColumn: "@",
            categoryColumn: "@"
        }
    }
});