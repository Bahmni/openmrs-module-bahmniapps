'use strict';

angular.module('bahmni.clinical')
    .value('container', window.componentStore.componentList['container'])
    .controller('ComponentRendererController', ['$scope', '$stateParams', 'componentContext',
        function ($scope, $stateParams, componentContext) {
            $scope.name = componentContext.getName();
            $scope.props = componentContext.getProps();
        }]);
