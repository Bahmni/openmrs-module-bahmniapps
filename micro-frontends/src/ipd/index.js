// Adapt all IPD components to use within angular
"use strict";

import { react2angular } from "react2angular";
import { IpdDashboard } from "./IpdDashboard";
import { DrugChartModal } from "./DrugChartModal";
import "bahmni-carbon-ui/styles.css";
import { DrugChartModalNotification } from "./DrugChartModalNotification";

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

/** MFE component 2: DrugChartModal
 *================================================= */

angular
  .module("bahmni.mfe.ipd")
  .component("mfeIpdDrugChartModal", react2angular(DrugChartModal), {
    template:
      '<mfe-ipd-drug-chart-modal host-data="hostData" host-api="hostApi"></mfe-ipd-drug-chart-modal>',
  });

/** MFE component 3: DrugChartModalNotification
 * ================================================= */

angular
  .module("bahmni.mfe.ipd")
  .component("mfeIpdDrugChartModalNotification", react2angular(DrugChartModalNotification), {
    template:
      '<mfe-ipd-drug-chart-modal-notification host-data="hostData" host-api="hostApi"></mfe-ipd-drug-chart-modal-notification>',
  });
