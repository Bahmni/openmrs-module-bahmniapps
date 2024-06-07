import { React2AngularBridgeBuilder } from "../utils/bridge-builder";
import { PatientAlergiesControl } from "./Containers/patientAlergies/PatientAlergiesControl";
import { FormDisplayControl } from "./Containers/formDisplayControl/FormDisplayControl";
import { ProviderNotifications } from "./Containers/providerNotifications/ProviderNotifications";
import { OtNotesSavePopup, OtNotesDeletePopup } from "./Containers/otNotes/OtNotes";

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

builder.createComponentWithTranslationForwarding(
  "ProviderNotifications",
  ProviderNotifications
);

builder.createComponentWithTranslationForwarding(
    "OtNotesSavePopup",
    OtNotesSavePopup
);

builder.createComponentWithTranslationForwarding(
    "OtNotesDeletePopup",
    OtNotesDeletePopup
);