'use strict';

angular.module('bahmni.common.conceptSet')
    .directive('concept', [function() {
        var controller = function($scope, $q, $filter) {
            var conceptMapper = new Bahmni.ConceptSet.ConceptMapper();
            $scope.getPossibleAnswers = function() {
                return $scope.node.getPossibleAnswers().map(conceptMapper.map);
            };

            $scope.selectOptions = {
                query: function(options) {
                    return options.callback({results: $filter('filter')($scope.getPossibleAnswers(), {name: options.term})});
                },
                width: '20em',
                allowClear: true,
                placeholder: 'Select',
                formatResult: _.property('name'),
                formatSelection: _.property('name'),
                id: _.property('uuid')
            };

            $scope.multiSelectOptions = {
                query: function(options) {
                    return options.callback({results: $filter('filter')($scope.getPossibleAnswers(), {name: options.term})});
                },
                width: '20em',
                multiple: true,
                formatResult: _.property('name'),
                formatSelection: _.property('name'),
                id: _.property('uuid')
            };

            $scope.getValues = function(request) {
                return $q.when({data: $filter('filter')($scope.getPossibleAnswers(), {name: request.term}) });
            };
        }

        return {
            restrict: 'E',
            scope: {
                node: "=",
                atLeastOneValueIsSet : "="
            },
            controller: controller,
            template: '<ng-include src="\'../common/concept-set/views/observation.html\'" />'
        }
   	}]);
