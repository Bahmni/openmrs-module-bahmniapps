import PropTypes from "prop-types";
import React, { Suspense, lazy } from "react";

export function IpdDashboard(props) {
  const LazyApp = lazy(() => import("@openmrs-mf/ipd/Dashboard"));

  return (
    <>
      <Suspense fallback={<p>Loading...</p>}>
        <LazyApp
          options={props.dashboardOptions}
          hostInterface={props.hostInterface}
        />
      </Suspense>
    </>
  );
}

// Without propTypes, react2angular won't render the component
IpdDashboard.propTypes = {
  dashboardOptions: PropTypes.shape({
    patient: PropTypes.shape({
      uuid: PropTypes.string.isRequired,
    }).isRequired,
  }),
  hostInterface: PropTypes.shape({
    onConfirm: PropTypes.func,
  }),
};
