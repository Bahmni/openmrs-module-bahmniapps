import React from "react";
import propTypes from "prop-types";
import { Tile } from "carbon-components-react";
import { BuildFileViewer } from "./BuildFileViewer/BuildFileViewer";
import "./FileViewer.scss";

export const FileViewer = (props) => {
  const { members, isHeader = false } = props;
  const groupByConceptUuid = members.reduce((acc, member) => {
    acc[member.concept.uuid] = acc[member.concept.uuid] || [];
    acc[member.concept.uuid].push(member);
    return acc;
  }, {});

  return (
    <>
      {Object.values(groupByConceptUuid).map((elementList, index) => {
        return isHeader ? (
          <Tile key={index}>
            <div key={index} className="file-section">
              <span
                className="section-header row-label"
                data-testid={`section-label-${index}`}
              >
                {elementList[0].concept.shortName}
              </span>
              <span
                className="row-value viewer-value-block"
                key={`row-value-${index}`}
              >
                {elementList.map((subItem, index) => (
                  <BuildFileViewer item={subItem} index={index} />
                ))}
              </span>
            </div>
          </Tile>
        ) : (
          <>
            <div
              key={index}
              className="row-element"
              data-testid={`subItem-${index}`}
            >
              <div className="row-content">
                <div className="row-label">
                  {elementList[0].concept.shortName}
                </div>
                <div className="row-value viewer-value-block">
                  {elementList.map((subItem, index) => (
                    <BuildFileViewer item={subItem} index={index} />
                  ))}
                </div>
              </div>
            </div>
          </>
        );
      })}
    </>
  );
};

FileViewer.propTypes = {
  members: propTypes.array,
  isHeader: propTypes.bool,
};
export default FileViewer;
