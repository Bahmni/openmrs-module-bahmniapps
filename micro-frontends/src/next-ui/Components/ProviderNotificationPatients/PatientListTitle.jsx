import React from 'react';
import { WarningAlt16 } from '@carbon/icons-react';
import { Link } from 'carbon-components-react';
import "./PatientListTitle.scss";

const PatientListTitle = () => {
  return (
    <div className='patient-list-tile-content'>
        <WarningAlt16 style={{color:"red"}}/>
        <div className='patient-info'>
            <Link href="#" className="patient-id">ET123</Link>
            <span>|</span>
            <span>John Doe</span>
            <span>, </span>
            <span>16 years</span>

        </div>
    </div>
  )
}

export default PatientListTitle