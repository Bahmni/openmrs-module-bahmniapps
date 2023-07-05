import PropTypes from "prop-types";
import React, { Suspense, lazy } from "react";

export function IpdDashboard(props) {
  const LazyApp = lazy(() => import("@openmrs-mf/ipd/Dashboard"));

  return (
    <>
      <Suspense fallback={<p>Loading...</p>}>
        <LazyApp
          hostData={props.hostData}
          hostApi={props.hostApi}
        />
      </Suspense>
    </>
  );
}

// Without propTypes, react2angular won't render the component
IpdDashboard.propTypes = {
  hostData: PropTypes.shape({
    patient: PropTypes.shape({
      uuid: PropTypes.string.isRequired,
    }).isRequired,
  }),
  hostApi: PropTypes.shape({
    onConfirm: PropTypes.func,
  }),
};
