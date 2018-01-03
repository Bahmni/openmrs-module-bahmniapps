'use strict';

describe('ChangePasswordController', function () {
  var $aController, rootScopeMock, window, scopeMock, state, mockSessionService, mockAuthenticator, mockUserService, mockMessagingService;

  beforeEach(module('bahmni.home'));

  beforeEach(inject(function ($controller, $rootScope, $window, $state) {
      $aController = $controller;
      rootScopeMock = $rootScope;
      window = $window;
      scopeMock = rootScopeMock.$new();
      state = jasmine.createSpyObj('$state',['go']);
      mockAuthenticator = jasmine.createSpyObj('authenticator',['authenticateUser']);
      mockUserService = jasmine.createSpyObj('userService',['getPasswordPolicies']);
      mockSessionService = jasmine.createSpyObj('sessionService', ['loadCredentials','checkOldPassword', 'changePassword','login']);
      mockMessagingService = jasmine.createSpyObj('messagingService',['showMessage']);
    })
  );

  beforeEach(function () {
    mockAuthenticator.authenticateUser.and.returnValue(specUtil.simplePromise({}));
    mockSessionService.loadCredentials.and.returnValue(specUtil.simplePromise({}));
    var policies = {"security.passwordMinimumLength":"8",
                    "security.passwordRequiresDigit": "true",
                    "security.passwordRequiresNonDigit": "false",
                    "security.passwordCannotMatchUsername" : "true",
                    "security.passwordRequiresUpperAndLowerCase" : "true",
                    "security.passwordCustomRegex" : "[0-9]"};
    mockUserService.getPasswordPolicies.and.returnValue(specUtil.simplePromise({data: policies}));

    $aController('ChangePasswordController', {
      $scope: scopeMock,
      $state: state,
      sessionService : mockSessionService,
      $rootScope: rootScopeMock,
      authenticator : mockAuthenticator,
      $window: window,
      userService : mockUserService,
      messagingService: mockMessagingService
    });
  });

  it("should test user is authenticated or not", function () {
    expect(mockAuthenticator.authenticateUser).toHaveBeenCalled();
    expect(mockUserService.getPasswordPolicies).toHaveBeenCalled();
    expect(mockSessionService.loadCredentials).toHaveBeenCalled();
  });

  it("should convert the password policies", function () {

    expect(scopeMock.passwordPolicies.length).toBe(5);
    expect(scopeMock.passwordLength).toEqual("8");
    expect(scopeMock.passwordRegex).toEqual("[0-9]");
    expect(scopeMock.passwordPolicies[0]).toEqual('PASSWORD_SHOULD_NOT_MATCH_USER_NAME');
    expect(scopeMock.passwordPolicies[1]).toEqual('PASSWORD_SHOULD_BE_MINIMUM_CHARACTERS');
    expect(scopeMock.passwordPolicies[2]).toEqual('PASSWORD_SHOULD_BE_A_MIX_OF_BOTH_UPPER_CASE_AND_LOWER_CASE');
    expect(scopeMock.passwordPolicies[3]).toEqual('PASSWORD_SHOULD_CONTAIN_DIGITS');
    expect(scopeMock.passwordPolicies[4]).toEqual('PASSWORD_SHOULD_MATCH_THE_REGEX');
  });

  it("should check if new password and confirm password matches or not", function () {
    scopeMock.loginInfo = {oldPassword : "abc", newPassword : "abc", confirmPassword: "xyz"};
    scopeMock.changePassword();

    expect(scopeMock.passwordDoesNotMatch).toBeTruthy();
  });

  it("should not call change password if old password or new password or confirm password are empty", function () {
    scopeMock.loginInfo = {};
    scopeMock.changePassword();

    expect(mockSessionService.changePassword).not.toHaveBeenCalled();
  });

  it("should redirect to dashboard", function(){
    scopeMock.redirectToHomePage();

    expect(state.go).toHaveBeenCalledWith('dashboard');
  });

  describe("change password", function(){

    beforeEach(function () {
      scopeMock.loginInfo = {oldPassword:"123", newPassword : "abc", confirmPassword: "abc"};
      rootScopeMock.currentUser = {uuid: "someUuid"};
      mockSessionService.changePassword.and.returnValue(specUtil.simplePromise({}));
    });

    it("should change the password", function(){
      scopeMock.changePassword();

      expect(scopeMock.passwordDoesNotMatch).toBeFalsy();
      expect(mockSessionService.changePassword).toHaveBeenCalled();
      expect(mockMessagingService.showMessage).toHaveBeenCalledWith("info","CHANGE_PASSWORD_SUCCESSFUL_MESSAGE");

    });

    it("should clear the password fields", function () {
      scopeMock.changePassword();

      expect(scopeMock.loginInfo.oldPassword).toBeUndefined();
      expect(scopeMock.loginInfo.newPassword).toBeUndefined();
      expect(scopeMock.loginInfo.confirmPassword).toBeUndefined();

    })
  });

});