import React from 'react';
import { WarningAlt16 } from '@carbon/icons-react';
import { Link } from 'carbon-components-react';
import "./PatientListTitle.scss";

const PatientListTitle = (props) => {
    const { noOfDrugs, identifier, name , date_of_birth } = props;


  return (
    <div className='patient-list-tile-content'>
        <div className='warning'>
        <WarningAlt16/>
            <span style={{ paddingLeft : 5}}>{noOfDrugs}</span>
            </div>
        <div className='patient-info'>
            <Link href="#" className="patient-id">{identifier}</Link>
            <span>|</span>
            <span>{name}</span>
            <span>, </span>
            <span>{Bahmni.Common.Util.AgeUtil.monthsToAgeString(value)}</span>
        </div>
    </div>
  )
}

export default PatientListTitle