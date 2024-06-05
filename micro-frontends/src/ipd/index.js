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
