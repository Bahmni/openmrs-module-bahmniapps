import PropTypes from "prop-types";
import React, { Suspense, lazy } from "react";

export function DrugChartModal(props) {
  const LazyApp = lazy(() => import("@openmrs-mf/ipd/DrugChartModal"));

  return (
    <>
      <Suspense fallback={""}>
        <LazyApp
          hostData={props.hostData}
          hostApi={props.hostApi}
        />
      </Suspense>
    </>
  );
}

// Without propTypes, react2angular won't render the component
DrugChartModal.propTypes = {
  hostData: PropTypes.shape({
    drugOrder: PropTypes.object,
    scheduleFrequencies: PropTypes.array,
    startTimeFrequencies: PropTypes.array,
  }).isRequired,
  hostApi: PropTypes.shape({
    closeDrugChart: PropTypes.func,
  }),
};
