var Bahmni = Bahmni || {};
Bahmni.Registration = Bahmni.Registration || {};

angular.module('bahmni.registration', ['ui.router', 'bahmni.common.config', 'bahmni.common.domain', 'bahmni.common.util',
    'bahmni.common.uiHelper', 'bahmni.common.conceptSet','infinite-scroll', 'bahmni.common.patient', 
    'bahmni.common.logging', 'pascalprecht.translate', 'ngTagsInput']);