'use strict';

describe("show if privilege directive", function () {
    var element, scope, rootScope, $compile;

    beforeEach(module('bahmni.common.config'));

    beforeEach(inject(function (_$compile_, $rootScope) {
        rootScope = $rootScope;
        scope = $rootScope.$new();
        $compile = _$compile_;
        rootScope.currentUser = {
            "username": "superman",
            "privileges": [
                {"name": "app:clinical:retrospective"},
                {"name":"app:billing"}
            ]
        };
    }));

    it("should show the element if the user has privilege", function () {
        element = angular.element('<input show-if-privilege="app:clinical:retrospective"/>');
        $compile(element)(scope);
        scope.$digest();
        expect(element.find(":hidden").length).toBe(0);
    });
});