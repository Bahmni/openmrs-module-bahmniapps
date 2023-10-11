import { React2AngularBridgeBuilder } from "../utils/bridge-builder";
import { PatientAlergiesControl } from "./Containers/patientAlergies/PatientAlergiesControl";
import { FormDisplayControl } from "./Containers/formDisplayControl/FormDisplayControl";

const MODULE_NAME = "bahmni.mfe.nextUi";

angular.module(MODULE_NAME, []);

const builder = new React2AngularBridgeBuilder({
  moduleName: MODULE_NAME,
  componentPrefix: "mfeNextUi",
});

builder.createComponentWithTranslationForwarding(
  "PatientAlergiesControl",
  PatientAlergiesControl
);

builder.createComponentWithTranslationForwarding(
  "FormDisplayControl",
  FormDisplayControl
);