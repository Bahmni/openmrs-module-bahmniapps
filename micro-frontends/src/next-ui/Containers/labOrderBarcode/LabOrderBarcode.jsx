import React, { useEffect, useMemo, useRef, useState } from "react";
import PropTypes from "prop-types";
import { FormattedMessage } from "react-intl";
import { Button } from "carbon-components-react";
import { Printer } from "@carbon/icons-react/next";
import "../../../styles/carbon-conflict-fixes.scss";
import "../../../styles/carbon-theme.scss";
import "../../../styles/common.scss";
import "./labOrderBarcode.scss";
import { I18nProvider } from "../../Components/i18n/I18nProvider";
import {
  buildConfig,
  fetchLabOrderRows,
  formatLabelDate,
  formatLabelName,
} from "../../utils/LabOrderBarcode/LabOrderBarcodeUtils";
import { printLabel, renderBarcode } from "../../utils/LabOrderBarcode/labelPrinter";

function Barcode({ value }) {
  const svgRef = useRef(null);

  useEffect(() => {
    if (svgRef.current) {
      renderBarcode(svgRef.current, value, { height: 32, width: 1.5 });
    }
  }, [value]);

  return <svg ref={svgRef} className="lab-order-barcode-svg" data-testid="lab-order-barcode-svg" />;
}

Barcode.propTypes = {
  value: PropTypes.string.isRequired,
};

/** NOTE: for reasons known only to react2angular,
 * any functions passed in as props will be undefined at the start, even ones inside other objects
 * so you need to use the conditional operator like props.hostApi?.callback even though it is a mandatory prop
 */
export function LabOrderBarcode(props) {
  const { hostData } = props;
  const { patient = {}, facilityName, title, config: sectionConfig } = hostData || {};
  const config = useMemo(() => buildConfig(sectionConfig || {}), [sectionConfig]);
  const [rows, setRows] = useState([]);

  useEffect(() => {
    let cancelled = false;
    if (!patient.uuid) {
      return undefined;
    }

    fetchLabOrderRows({ patientUuid: patient.uuid, config })
      .then((labOrderRows) => {
        if (!cancelled) {
          setRows(labOrderRows);
        }
      })
      .catch((e) => {
        console.error(e);
      });

    return () => {
      cancelled = true;
    };
  }, [patient.uuid]);

  if (rows.length === 0) {
    return null;
  }

  const handlePrint = (row) => {
    printLabel({
      facilityName,
      patientName: formatLabelName(patient),
      patientIdentifier: patient.identifier,
      labOrderNumber: row.labOrderNumber,
      testName: row.testName,
      orderDate: formatLabelDate(row.orderDate),
      width: config.label.width,
      height: config.label.height,
      showFacility: config.label.showFacility,
    });
  };

  return (
    <I18nProvider>
      <div className="lab-order-barcode">
        <h2 className="section-title-next-ui">
          {title || (
            <FormattedMessage id={"LAB_ORDER_BARCODE_HEADING"} defaultMessage={"Lab Order Barcodes"} />
          )}
        </h2>
        <ul className="lab-order-barcode-list">
          {rows.map((row) => (
            <li className="lab-order-barcode-row" key={row.orderUuid || row.labOrderNumber}>
              <div className="lab-order-barcode-details">
                <span className="lab-order-barcode-test">{row.testName}</span>
                <span className="lab-order-barcode-date">{formatLabelDate(row.orderDate)}</span>
              </div>
              <div className="lab-order-barcode-code">
                <Barcode value={row.labOrderNumber} />
                <span className="lab-order-barcode-number">{row.labOrderNumber}</span>
              </div>
              <Button
                kind="ghost"
                size="small"
                className="lab-order-barcode-print"
                renderIcon={Printer}
                onClick={() => handlePrint(row)}
              >
                <FormattedMessage id={"LAB_ORDER_BARCODE_PRINT_LABEL"} defaultMessage={"Print label"} />
              </Button>
            </li>
          ))}
        </ul>
      </div>
    </I18nProvider>
  );
}

LabOrderBarcode.propTypes = {
  hostData: PropTypes.shape({
    patient: PropTypes.object,
    facilityName: PropTypes.string,
    title: PropTypes.string,
    config: PropTypes.object,
  }).isRequired,
  tx: PropTypes.func,
  appService: PropTypes.object,
};
