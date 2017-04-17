'use strict';

angular.module('bahmni.common.conceptSet').controller('multiSelectObservationSearchController', ['$scope', 'conceptSetService', function ($scope, conceptSetService) {
    var possibleAnswers = [];
    var unselectedValues = [];
    $scope.values = [];

    var init = function () {
        var selectedValues = _.map(_.values($scope.observation.selectedObs), 'value');
        _.remove(selectedValues, _.isUndefined);
        selectedValues.forEach(function (observation) {
            $scope.values.push({"label": observation.name, "name": observation.name});
        });

        var configuredConceptSetName = $scope.observation.getConceptUIConfig().answersConceptName;
        if (!_.isUndefined(configuredConceptSetName)) {
            conceptSetService.getConcept({
                name: configuredConceptSetName,
                v: "bahmni"
            }).then(function (response) {
                possibleAnswers = _.isEmpty(response.data.results) ? [] : response.data.results[0].answers;
                unselectedValues = _.xorBy(possibleAnswers, $scope.values, 'uuid');
            });
        } else {
            possibleAnswers = $scope.observation.getPossibleAnswers();
            unselectedValues = _.xorBy(possibleAnswers, selectedValues, 'uuid');
        }
    };

    $scope.search = function (query) {
        var matchingAnswers = [];
        _.forEach(unselectedValues, function (answer) {
            if (typeof answer.name != "object" && answer.name.toLowerCase().indexOf(query.toLowerCase()) !== -1) {
                answer.label = answer.name;
                matchingAnswers.push(answer);
            } else if (typeof answer.name == "object" && answer.name.name.toLowerCase().indexOf(query.toLowerCase()) !== -1) {
                answer.name = answer.name.name;
                answer.label = answer.name;
                matchingAnswers.push(answer);
            } else {
                var synonyms = _.map(answer.names, 'name');
                _.find(synonyms, function (name) {
                    if (name.toLowerCase().indexOf(query.toLowerCase()) !== -1) {
                        answer.label = name + " => " + answer.name;
                        matchingAnswers.push(answer);
                    }
                });
            }
        });
        return _.uniqBy(matchingAnswers, 'uuid');
    };

    $scope.addItem = function (item) {
        unselectedValues = _.remove(unselectedValues, function (value) {
            return value.uuid !== item.uuid;
        });
        $scope.observation.toggleSelection(item);
    };

    $scope.removeItem = function (item) {
        unselectedValues.push(item);
        $scope.observation.toggleSelection(item);
    };

    $scope.setLabel = function (answer) {
        answer.label = answer.name;
        return true;
    };

    $scope.removeFreeTextItem = function () {
        var value = $("input.input").val();
        if (_.isEmpty($scope.search(value))) {
            $("input.input").val("");
        }
    };

    init();
}]).config(['tagsInputConfigProvider', function (tagsInputConfigProvider) {
    tagsInputConfigProvider.setDefaults('tagsInput', {
        placeholder: ''
    });
}]);

