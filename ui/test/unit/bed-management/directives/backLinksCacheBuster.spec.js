'use strict';

describe('backLinksCacheBuster', function () {

    var scope, rootScope, httpBackend, compile, q, compiledScope, compileDirective;
    var state = jasmine.createSpyObj('$state', ['go']);
    var window = {location: {href: "some url"}};

    var homeBackLink = {type: "link", name: "Home", value: "../home/", accessKey: "h", icon: "fa-home"};
    var admitLink = {type: "state", name: "Admit", value: "admit", accessKey: "a"};
    var bedManagementLink = {type: "state", name: "Bed Management", value: "bedManagement", accessKey: "b"};
    var navigationLinks = [homeBackLink, admitLink, bedManagementLink];
    state.current = {data: {navigationLinks: navigationLinks}};

    var html = '<back-links-cache-buster></back-links-cache-buster>';

    beforeEach(function () {
        module('bahmni.ipd');
    });

    beforeEach(module(function ($provide) {
        $provide.value('$window', window);
        $provide.value('$state', state);
    }));

    beforeEach(inject(function ($filter, $compile, $httpBackend, $rootScope, $q) {
        compile = $compile;
        httpBackend = $httpBackend;
        rootScope = $rootScope;
        q = $q;
        scope = rootScope.$new();
        httpBackend.expectGET("views/backLinks.html").respond("<div>dummy</div>");
        var compiledEle = compile(html)(scope);
        scope.$digest();
        httpBackend.flush();
        compiledScope = compiledEle.isolateScope();
        scope.$digest();
    }));

    it('Should set window.location.href to value of selected backlink, when backlink type is link', function () {
        expect(compiledScope).not.toBeUndefined();
        expect(compiledScope.navigationLinks).not.toBeUndefined();

        var selectedBackLink = homeBackLink;
        compiledScope.linkAction(selectedBackLink.type, selectedBackLink.value, selectedBackLink.params);

        expect(window.location.href).toBe(homeBackLink.value);
    });

    it('Should change state to value of selected backlink with params , when backlink type is state and params are provided', function () {
        expect(compiledScope).not.toBeUndefined();
        expect(compiledScope.navigationLinks).not.toBeUndefined();

        var selectedBackLink = admitLink;
        compiledScope.linkAction(selectedBackLink.type, selectedBackLink.value, selectedBackLink.params);

        expect(state.go).toHaveBeenCalledWith(admitLink.value, jasmine.any(Object));
    });
});