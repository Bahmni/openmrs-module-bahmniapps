'use strict';

angular.module('bahmni.common.domain')
  .factory('reduxService', ['$ngRedux', function($ngRedux) {
    var register = function(mapStateToProps, target) {
      return $ngRedux.connect(mapStateToProps)(target);
    };

    var deRegister = function(unsubscriber) {
      unsubscriber();
    };

    return {
      register: register,
      deRegister: deRegister,
    };
  }]);