'use strict';

describe("MessageController", function () {

    beforeEach(module('bahmni.common.uiHelper'));

    var scope;
    var controller;
    var rootScope;

    beforeEach(inject(function ($controller, $rootScope) {
        controller = $controller;
        rootScope = $rootScope;
        scope = $rootScope.$new();

    }));

    function createController() {
        return controller("MessageController", {
            $scope: scope
        });
    }

    describe("method isErrorMessagePresent", function () {
        it("should return true if error present", function () {
            createController();
            scope.messages = {error:["abcd"]};
            expect(scope.isErrorMessagePresent()).toBeTruthy();
        });
    });

    describe("method getErrorMessageText", function () {
        it("should return concatenated error message", function () {
            createController();
            scope.messages = {error:[{'value':'this'},{'value':"is"} ,{'value':"server"} ,{'value':"error"}]};
            expect(scope.getErrorMessageText()).toBe("thisisservererror");
        });
    });

    it("should toggle show error", function () {
        createController();
        expect(scope.showError).toBeFalsy();
        scope.toggleShowError();
        expect(scope.showError).toBeTruthy();
    });
});