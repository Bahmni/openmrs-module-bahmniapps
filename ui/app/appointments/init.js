'use strict';

var Bahmni = Bahmni || {};
Bahmni.appointments = Bahmni.appointments || {};

angular.module('bahmni.appointments', ['ui.router', 'bahmni.common.config', 'bahmni.common.uiHelper', 'bahmni.common.i18n',
    'bahmni.common.domain', 'authentication', 'bahmni.common.appFramework', 'bahmni.common.routeErrorHandler',
    'httpErrorInterceptor', 'pasvaz.bindonce', 'infinite-scroll', 'bahmni.common.util', 'ngSanitize', 'pascalprecht.translate', 'ngCookies', 'angularFileUpload', 'bahmni.common.offline', 'bahmni.common.logging']);
