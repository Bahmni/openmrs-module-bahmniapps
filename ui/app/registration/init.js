/*
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at https://www.bahmni.org/license/mplv2hd.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */


var Bahmni = Bahmni || {};
Bahmni.Registration = Bahmni.Registration || {};
Bahmni.Registration.AttributesConditions = Bahmni.Registration.AttributesConditions || {};

angular.module('bahmni.registration', ['ui.router', 'bahmni.common.config', 'bahmni.common.domain', 'bahmni.common.util',
    'bahmni.common.uiHelper', 'bahmni.common.conceptSet', 'infinite-scroll', 'bahmni.common.patient',
    'bahmni.common.logging', 'pascalprecht.translate']);
