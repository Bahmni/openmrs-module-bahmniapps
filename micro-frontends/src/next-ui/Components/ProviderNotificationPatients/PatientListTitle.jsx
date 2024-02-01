import React from "react";
import { WarningAlt16 } from "@carbon/icons-react";
import { Link } from "carbon-components-react";
import "./PatientListTitle.scss";
import { getPatientDashboardUrl } from "../../utils/providerNotifications/ProviderNotificationUtils";

const PatientListTitle = (props) => {

  const { noOfDrugs, identifier, name, age, gender, patientUuid } = props;

  return (
    <div className="patient-list-tile-content">
      <div className="warning">
        <WarningAlt16 />
        <span style={{ paddingLeft: 5 }}>{noOfDrugs}</span>
      </div>
      <div className="patient-info">
        <Link href="#" className="patient-id" onClick={(e) => {
            e.stopPropagation();
            window.open(
                getPatientDashboardUrl(patientUuid),
                "_blank"
            )
        }}>
          {identifier}
        </Link>
        <span>&nbsp;&nbsp;|&nbsp;&nbsp;</span>
        <span>{`${name} (${gender}) . ${age}yrs`}</span>
      </div>
    </div>
  );
};

export default PatientListTitle;
