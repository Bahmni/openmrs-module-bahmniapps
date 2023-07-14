// Adapt all IPD components to use within angular
"use strict";

import { react2angular } from "react2angular";
import { IpdDashboard } from "./IpdDashboard";
import { DrugChartModal } from "./DrugChartModal";
import "bahmni-carbon-ui/styles.css";

angular.module("bahmni.mfe.ipd", [
  "ui.router",
  "bahmni.common.config",
  "bahmni.common.uiHelper",
  "bahmni.common.i18n",
  "bahmni.common.domain",
]);


/** MFE component 1: IpdDashboard 
 *================================================= */

/** Step 1: create a react2angular wrapper for the component */
angular
  .module("bahmni.mfe.ipd")
  .component("mfeIpdDashboardRemote", react2angular(IpdDashboard));

/** Step 2: create a controller to pass hostData and hostApi */
function ipdDashboardController($rootScope, $scope, confirmBox) {

  // Use hostData to pass data from bahmni to the micro-frontend component
  $scope.hostData = {
    patient: {
      uuid: "--- DUMMY UUID FOR TESTING FROM HOST ---",
    },
  };

  // Use hostApi to provide callbacks to the micro-frontend component
  $scope.hostApi = {
    onConfirm(event) {
      const dialogScope = {
        message:
          "This is a dialog triggered on the host in response to an event from IPD ",
        okay(close) {
          close();
        },
      };

      confirmBox({
        scope: dialogScope,
        actions: [{ name: "okay", display: "Okay" }],
        className: "ngdialog-theme-default",
      });
    },
  };
}
ipdDashboardController.$inject = ["$rootScope", "$scope", "confirmBox"];

/** Step 3: bind the controller to the component by creating a new wrapper component */
angular.module("bahmni.mfe.ipd").component("mfeIpdDashboard", {
  controller: ipdDashboardController,
  template:
    '<mfe-ipd-dashboard-remote host-data="hostData" host-api="hostApi"></mfe-ipd-dashboard-remote>',
});
/** ================= End of component 1 ==========================  */

/** MFE component 2: DrugChartModal
 *================================================= */

angular
  .module("bahmni.mfe.ipd")
  .component("mfeIpdDrugChartModalRemote", react2angular(DrugChartModal));

function ipdDrugChartModalController($rootScope, $scope, confirmBox) {

  $scope.hostData = {
    drugOrder: this.drug
  };

  $scope.hostApi = {
    onConfirm(event) {
      const dialogScope = {
        message:
          "This is a dialog triggered on the host in response to an event from IPD ",
        okay(close) {
          close();
        },
      };

      confirmBox({
        scope: dialogScope,
        actions: [{ name: "okay", display: "Okay" }],
        className: "ngdialog-theme-default",
      });
    },
  };
}
ipdDrugChartModalController.$inject = ["$rootScope", "$scope", "confirmBox"];

angular.module("bahmni.mfe.ipd").component("mfeIpdDrugChartModal", {
  controller: ipdDrugChartModalController,
  bindings: {
    drug: "="
  },
  template:
    '<mfe-ipd-drug-chart-modal-remote host-data="hostData" host-api="hostApi"></mfe-ipd-drug-chart-modal-remote>',
});
/** ================= End of component 2 ==========================  */