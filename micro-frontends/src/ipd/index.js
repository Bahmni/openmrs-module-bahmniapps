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

angular
  .module("bahmni.mfe.ipd")
  .component("mfeIpdDashboardRemote", react2angular(IpdDashboard));

function ipdDashboardController($rootScope, $scope, confirmBox) {
  // manage the controller here
  $scope.dashboardOptions = {
    patient: {
      uuid: "--- DUMMY UUID FOR TESTING FROM HOST ---",
    },
  };

  console.log("Setting up the new host controller");
  $scope.hostInterface = {
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

angular.module("bahmni.mfe.ipd").component("mfeIpdDashboard", {
  controller: ipdDashboardController,
  template:
    '<mfe-ipd-dashboard-remote dashboard-options="dashboardOptions" host-interface="hostInterface"></mfe-ipd-dashboard-remote>',
});
