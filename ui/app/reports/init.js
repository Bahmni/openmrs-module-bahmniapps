'use strict';

var Bahmni = Bahmni || {};
Bahmni.Reports = Bahmni.Reports || {};

angular.module('bahmni.reports', ['ui.router', 'bahmni.common.config', 'bahmni.common.uiHelper',  'bahmni.common.i18n',
    'bahmni.common.domain', 'authentication', 'bahmni.common.appFramework', 'bahmni.common.routeErrorHandler',
    'httpErrorInterceptor', 'pasvaz.bindonce', 'infinite-scroll', 'bahmni.common.util', 'ngSanitize', 'pascalprecht.translate', 'ngCookies', 'angularFileUpload']);