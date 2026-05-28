/*
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at https://www.bahmni.org/license/mplv2hd.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */

'use strict';

var Bahmni = Bahmni || {};
Bahmni.Orders = Bahmni.Orders || {};

angular.module('bahmni.orders', ['bahmni.common.uiHelper', 'bahmni.common.util', 'bahmni.common.appFramework', 'bahmni.common.conceptSet', 'ui.router', 'infinite-scroll', 'ngDialog']);

