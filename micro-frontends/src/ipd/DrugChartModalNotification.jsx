import PropTypes from "prop-types";
import React, { Suspense, lazy } from "react";

export function DrugChartModalNotification(props) {
  const LazyApp = lazy(() => import("@openmrs-mf/ipd/DrugChartModalNotification"));

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
DrugChartModalNotification.propTypes = {
  hostData: PropTypes.shape({
    notificationKind: PropTypes.string,
  }).isRequired,
  hostApi: PropTypes.shape({
    onClose: PropTypes.func,
  }).isRequired,
};
