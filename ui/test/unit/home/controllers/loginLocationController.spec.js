'use strict';

describe("LoginLocationController", function () {
	var translate,
		userService,
		localeService,
		$controller,
		rootScopeMock,
		window,
		$q,
		state,
		_spinner,
		initialData,
		scopeMock,
		sessionService,
		$bahmniCookieStore,
		currentUser,
		mockLocation,
		auditLogService;
	var mockLocation = { path: jasmine.createSpy(), url: jasmine.createSpy(), search: jasmine.createSpy().and.returnValue({}) };
	  

	beforeEach(module("bahmni.home"));

	var myUser = {
		provider: {
			attributes: [
				{
					attributeType: {
						display: "some attribute",
					},
				},
			],
		},
	};

	beforeEach(inject(function ($rootScope, _$controller_, $window, $state, _$q_) {
		$controller = _$controller_;
		rootScopeMock = $rootScope;
		window = $window;
		$q = _$q_;
		state = $state;
		scopeMock = rootScopeMock.$new();
	}));

	var loginLocationController = function () {
		return $controller("LoginLocationController", {
			$rootScope: rootScopeMock,
			$scope: scopeMock,
			$window: window,
			$location: mockLocation,
			$translate: translate,
			userService: userService,
			sessionService: sessionService,
			initialData: initialData,
			spinner: _spinner,
			$q: $q,
			$stateParams: {},
			$bahmniCookieStore: $bahmniCookieStore,
			localeService: localeService,
			auditLogService: auditLogService,
		});
	};

	beforeEach(function () {
		translate = jasmine.createSpyObj("$translate", ["use"]);
		userService = jasmine.createSpyObj("userService", ["savePreferences"]);
		localeService = jasmine.createSpyObj("localeService", ["getLoginText", "allowedLocalesList", "serverDateTime", "getLocalesLangs"]);
		sessionService = jasmine.createSpyObj("sessionService", ["loginUser", "loadCredentials", "updateSession", "get"]);
		auditLogService = jasmine.createSpyObj("auditLogService", ["log"]);
		currentUser = jasmine.createSpyObj("currentUser", ["addDefaultLocale", "toContract"]);
		_spinner = jasmine.createSpyObj("spinner", ["forPromise"]);

		sessionService.loginUser.and.returnValue(specUtil.simplePromise());
		sessionService.loadCredentials.and.returnValue(specUtil.simplePromise());
		sessionService.updateSession.and.returnValue(specUtil.simplePromise());
		sessionService.get.and.returnValue(specUtil.simplePromise({ authenticated: true }));
		currentUser.addDefaultLocale.and.returnValue(specUtil.simplePromise({ data: "" }));
		currentUser.toContract.and.returnValue(specUtil.simplePromise({ data: "" }));
		localeService.allowedLocalesList.and.returnValue(specUtil.simplePromise({ data: "" }));
		localeService.serverDateTime.and.returnValue(specUtil.simplePromise({ data: { date: "Wed Aug 16 15:31:55 NZST 2017", offset: "+1200" } }));
		localeService.getLoginText.and.returnValue(
			specUtil.simplePromise({
				data: { homePage: { logo: "bahmni logo" }, loginPage: { showHeaderText: "bahmni emr", logo: "bahmni logo" }, helpLink: { url: "192.168.33.10/homepage" } },
			})
		);
		localeService.getLocalesLangs.and.returnValue(
			specUtil.createFakePromise({
				locales: [
					{ code: "en", nativeName: "English" },
					{ code: "es", nativeName: "Español" },
				],
			})
		);
		$bahmniCookieStore = jasmine.createSpyObj("$bahmniCookieStore", ["get", "remove", "put"]);
		$bahmniCookieStore.get.and.callFake(function () {
			return {};
		});
		initialData = {
			locations: [
				{ display: "Location1", uuid: "uuid1" },
				{ display: "Location2", uuid: "uuid2" },
				{ display: "Location3", uuid: "uuid3" },
			],
		};
		rootScopeMock.currentUser = myUser;
		scopeMock.loginInfo = {};
		_spinner.forPromise.and.returnValue(specUtil.simplePromise({}));
		localStorage.setItem('loginLocations', JSON.stringify([
			{ display: 'Location 1', uuid: 'uuid1' },
			{ display: 'Location 2', uuid: 'uuid2' }
		   ]));
	});

	afterEach(function () {
		rootScopeMock.currentUser = null;
	});

	it("should return all locations if no login locations for the user exist", function () {
		localStorage.clear();
		loginLocationController();

		var allLocations = initialData.locations;

		expect(scopeMock.locations).toEqual(allLocations);
	});

	it("should return login locations of the user if they exist", function () {
		loginLocationController();

		var expectedLocations = [{ display: 'Location 1', uuid: 'uuid1' },{ display: 'Location 2', uuid: 'uuid2' }];

		expect(scopeMock.locations).toEqual(expectedLocations);
	});

	it("should update the session location based on user selected location", function () {
		loginLocationController();

		var selectedLocation = { display: "Location1", uuid: "uuid1" };
		scopeMock.locations = selectedLocation;
		scopeMock.loginInfo.currentLocation = { display: "Location1", uuid: "uuid1" };

		spyOn(scopeMock, "updateSessionLocation").and.returnValue($q.when({}));

		scopeMock.updateSessionLocation(selectedLocation);

		expect(scopeMock.loginInfo.currentLocation).toEqual(selectedLocation);
	});
});
