import React, { useState } from "react";
import propTypes from "prop-types";
import { Link } from "carbon-components-react";
import { DocumentPdf, Download, PlayFilledAlt } from "@carbon/icons-react/next";
import { formatDate } from "../../../../utils/utils";
import { FileViewerModal } from "../FileViewerModal/FileViewerModal";
import { getThumbnail } from "../../../../utils/FormDisplayControl/FormView";
import { document_images_path } from "../../../../constants";
import "../FileViewer.scss";

export const BuildFileViewer = (props) => {
  const { item, index } = props;

  const [isFileViewerModalOpen, setFileViewerModal] = useState(false);

  const itemInfoMap = {
    providerName: item?.providers[0]?.name || "",
    encounterDateTime: formatDate(item?.encounterDateTime),
    comment: item?.comment || "",
    fileName: item?.complexData?.title,
    fileType: item?.complexData?.mimeType,
    fileRelativePath: item?.value,
    fileSource: document_images_path + item?.value,
  };

  const closeModel = () => {
    setFileViewerModal(false);
  };

  if (itemInfoMap?.fileType == "video/mp4") {
    return (
      <>
        <div className={`video-viewer video-${index}`}>
          <div
            className="video-play-button"
            onClick={() => setFileViewerModal(!isFileViewerModalOpen)}
          >
            <img
              className="form-obs-video-image"
              src={
                document_images_path +
                getThumbnail(itemInfoMap.fileRelativePath, "jpg")
              }
              alt="image"
            />
            <div className="video-play-button-icon">
              <PlayFilledAlt size={22} />
            </div>
          </div>
          <span className="file-notes-section">
            {itemInfoMap?.comment}
            <br />
            <span className="provider-info">
              {itemInfoMap?.providerName}
              &nbsp;
              {itemInfoMap?.encounterDateTime}
            </span>
            <span className="download-link">
              <Link
                href={itemInfoMap?.fileSource}
                download={itemInfoMap.fileName}
              >
                <Download size={20} />
              </Link>
            </span>
          </span>
        </div>
        {isFileViewerModalOpen && (
          <FileViewerModal closeModel={closeModel} infoMap={itemInfoMap} />
        )}
      </>
    );
  } else {
    return (
      <>
        <div className={`image-viewer img-${index}`}>
          {itemInfoMap?.fileType === "application/pdf" ? (
            <Link
              className="pdf-link"
              href={itemInfoMap.fileSource}
              target="_blank"
            >
              <DocumentPdf size={93} />
            </Link>
          ) : (
            <div onClick={() => setFileViewerModal(!isFileViewerModalOpen)}>
              <img
                className="form-obs-image"
                src={
                  document_images_path +
                  getThumbnail(itemInfoMap.fileRelativePath)
                }
                alt="image"
              />
            </div>
          )}
          {
            <span className="file-notes-section">
              {itemInfoMap?.comment}
              <br />
              <span className="provider-info">
                {itemInfoMap.providerName}
                &nbsp;
                {itemInfoMap.encounterDateTime}
              </span>
            </span>
          }
        </div>
        {isFileViewerModalOpen && (
          <FileViewerModal closeModel={closeModel} infoMap={itemInfoMap} />
        )}
      </>
    );
  }
};

BuildFileViewer.propTypes = {
  item: propTypes.object,
  index: propTypes.number,
};

export default BuildFileViewer;
