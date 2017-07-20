'use strict';

var Bahmni = Bahmni || {};
Bahmni.Admin = Bahmni.Admin || {};

angular.module('bahmni.admin', ['bahmni.common.uiHelper', 'bahmni.common.domain', 'bahmni.common.util', 'bahmni.common.config',
    'bahmni.common.orders', 'bahmni.common.appFramework', 'bahmni.common.logging', 'ui.router', 'angularFileUpload']);
