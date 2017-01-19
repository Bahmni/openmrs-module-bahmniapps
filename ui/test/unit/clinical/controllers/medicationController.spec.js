'use strict';

describe("MedicationController", function () {

    beforeEach(module('bahmni.common.uiHelper'));
    beforeEach(module('bahmni.common.services'));
    beforeEach(module('bahmni.clinical'));

    var controller, scope;


    beforeEach(function () {
        inject(function ($controller, $rootScope) {
            scope = $rootScope.$new();
            controller = $controller;
        });
    });
    var createController = function (treatmentConfig) {
        return controller('MedicationController', {
            $scope: scope,
            treatmentConfig: treatmentConfig
        })
    };


    it('should set isDropDown to true from the config', function () {
        var treatmentConfig = {drugConceptSet: "All TB Drugs", isDropDown: true};
        createController(treatmentConfig);
        expect(scope.props.isDropDown).toBeTruthy();
        expect(scope.props.drugConceptSet).toEqual("All TB Drugs");
    });

    it('should set isDropDown to false from the config', function () {
        var treatmentConfig = {drugConceptSet: "All Other Drugs", isDropDown: false};
        createController(treatmentConfig);
        expect(scope.props.isDropDown).toBeFalsy();
        expect(scope.props.drugConceptSet).toEqual("All Other Drugs");
    });


});