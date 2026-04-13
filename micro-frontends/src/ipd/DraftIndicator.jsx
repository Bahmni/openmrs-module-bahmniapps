import PropTypes from "prop-types";
import React, { lazy, Suspense } from "react";
import "./DraftIndicator.scss";

const LazyDraftIndicator = lazy(() => import("@openmrs-mf/ipd/DraftIndicator"));

export function DraftIndicator() {
    return (
        <Suspense fallback={<div />}>
            <LazyDraftIndicator />
        </Suspense>
    );
}

DraftIndicator.propTypes = {
    hostData: PropTypes.object,
    hostApi: PropTypes.object,
};
