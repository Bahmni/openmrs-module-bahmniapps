import React from "react";
import { WarningAlt16 } from "@carbon/icons-react";
import { Link } from "carbon-components-react";
import "./PatientListTitle.scss";
import { getPatientIPDDashboardUrl } from "../../utils/providerNotifications/ProviderNotificationUtils";
import { formatGender } from "../../utils/utils";
import PropTypes from "prop-types";

const PatientListTitle = ({ noOfDrugs, identifier, name, age, gender, patientUuid, visitUuid }) => (
  <div className="patient-list-tile-content">
    <div className="warning">
      <WarningAlt16 />
      <span className="drug-count">{noOfDrugs}</span>
    </div>
    <div className="patient-info">
      <Link href={getPatientIPDDashboardUrl(patientUuid, visitUuid)} className="patient-id">
        {`(${identifier})`}
      </Link>
      <span>{`${name} - ${formatGender(gender)}, ${age}`}</span>
    </div>
  </div>
);

PatientListTitle.propTypes = {
  noOfDrugs: PropTypes.number.isRequired,
  identifier: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  age: PropTypes.string.isRequired,
  gender: PropTypes.string.isRequired,
  patientUuid: PropTypes.string.isRequired,
  visitUuid: PropTypes.string.isRequired,
};

export default PatientListTitle;
