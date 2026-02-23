/*
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at https://www.bahmni.org/license/mplv2hd.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */


// Adapt all IPD components to use within angular
"use strict";

import { react2angular } from "react2angular";
import { IpdDashboard } from "./IpdDashboard";
import { CareViewDashboard } from "./CareViewDashboard";

angular.module("bahmni.mfe.ipd", [
  "ui.router",
  "bahmni.common.config",
  "bahmni.common.uiHelper",
  "bahmni.common.i18n",
  "bahmni.common.domain",
]);

/** MFE component 1: IpdDashboard
 *================================================= */

angular
  .module("bahmni.mfe.ipd")
  .component("mfeIpdDashboard", react2angular(IpdDashboard), {
    template:
      '<mfe-ipd-dashboard host-data="hostData" host-api="hostApi"></mfe-ipd-dashboard>'
  });

/** MFE component 2: CareViewDashboard
 *================================================= */

angular
.module("bahmni.mfe.ipd")
.component("mfeIpdCareViewDashboard", react2angular(CareViewDashboard), {
    template:
        '<mfe-ipd-care-view-dashboard host-data="hostData" host-api="hostApi"></mfe-ipd-care-view-dashboard>'
});
