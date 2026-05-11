/*
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at https://www.bahmni.org/license/mplv2hd.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */

import { React2AngularBridgeBuilder } from "../utils/bridge-builder";
import { PatientAlergiesControl } from "./Containers/patientAlergies/PatientAlergiesControl";
import { FormDisplayControl } from "./Containers/formDisplayControl/FormDisplayControl";
import { ProviderNotifications } from "./Containers/providerNotifications/ProviderNotifications";
import { OtNotesSavePopup, OtNotesDeletePopup } from "./Containers/otNotes/OtNotes";
import { VariableDoseProtocol } from "./Containers/variableDoseProtocol/VariableDoseProtocol";
import { VariableDoseProtocolTable } from "./Components/VariableDoseProtocol/VariableDoseProtocolTable";

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

builder.createComponentWithTranslationForwarding(
    "VariableDoseProtocol",
    VariableDoseProtocol
);

builder.createComponentWithTranslationForwarding(
    "VariableDoseProtocolTable",
    VariableDoseProtocolTable
);

