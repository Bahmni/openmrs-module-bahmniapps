'use strict';

var Bahmni = Bahmni || {};
Bahmni.Appointments = Bahmni.Appointments || {};

angular.module('bahmni.appointments', ['ui.router', 'bahmni.common.config', 'bahmni.common.uiHelper', 'bahmni.common.i18n',
    'bahmni.common.domain', 'bahmni.common.displaycontrol.patientprofile', 'authentication', 'bahmni.common.appFramework', 'bahmni.common.routeErrorHandler',
    'httpErrorInterceptor', 'pasvaz.bindonce', 'infinite-scroll', 'bahmni.common.util', 'ngSanitize', 'pascalprecht.translate',
    'ngCookies', 'bahmni.common.patient', 'bahmni.common.logging', 'ui.calendar', 'monospaced.elastic', 'ivh.treeview', 'ngTagsInput', 'ngDialog']);
