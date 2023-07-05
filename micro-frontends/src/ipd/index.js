// Adapt all IPD components to use within angular
"use strict";

import { react2angular } from "react2angular";
import { IpdDashboard } from "./IpdDashboard";
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