'use strict';

angular.module('bahmni.clinical')
    .controller('ObservationFormController', ['$scope', 'observationFormService', 'spinner',
        function ($scope, observationFormService, spinner) {

            var init = function () {
                spinner.forPromise(observationFormService.getFormList({ v: "custom:(uuid,name)" })
                    .then(function (response) {
                        var forms = [];
                        _.each(response.data.results, function (result) {
                            forms.push(new Bahmni.ObservationForm(result.uuid, result.name))
                        });
                        $scope.forms = forms;
                    }));
            };
            init();
        }]);
