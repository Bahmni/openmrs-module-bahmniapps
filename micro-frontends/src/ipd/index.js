// Adapt all IPD components to use within angular
"use strict";

import { react2angular } from "react2angular";
import { IpdDashboard } from "./IpdDashboard";
import { DrugChartDashboard } from "./DrugChartDasboard";
import { DrugChartSlider } from "./DrugChartSlider";
import { DrugChartSliderNotification } from "./DrugChartSliderNotification";


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
  .component("mfeIpdDrugChartSlider", react2angular(DrugChartSlider), {
    template:
      '<mfe-ipd-drug-chart-slider host-data="hostData" host-api="hostApi"></mfe-ipd-drug-chart-slider>',
  });

/** MFE component 3: DrugChartModalNotification
 * ================================================= */

angular
  .module("bahmni.mfe.ipd")
  .component("mfeIpdDrugChartSliderNotification", react2angular(DrugChartSliderNotification), {
    template:
      '<mfe-ipd-drug-chart-slider-notification host-data="hostData" host-api="hostApi"></mfe-ipd-drug-chart-slider-notification>',
  });

/** MFE component 4: DrugChartDashboard
 *================================================= */

angular
    .module("bahmni.mfe.ipd")
    .component("mfeDrugChartDashboard", react2angular(DrugChartDashboard), {
        template:
            '<mfe-drug-chart-dashboard host-data="hostData" host-api="hostApi"></mfe-drug-chart-dashboard>'
    });
