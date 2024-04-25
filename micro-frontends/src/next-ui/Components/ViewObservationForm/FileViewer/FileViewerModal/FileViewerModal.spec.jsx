import React from "react";
import { render, screen } from "@testing-library/react";
import { FileViewerModal } from "./FileViewerModal.jsx";
import { mockInfoMap, mockVideoInfoMap } from "../FileViewerMockData.js";

describe("FileViewerModal", function () {
  const closeModel = jest.fn();
  
  it("should render FileViewerModal", function () {
    const { container } = render(
      <FileViewerModal closeModel={closeModel} infoMap={mockInfoMap} />
    );
    expect(container).toMatchSnapshot();
  });

  it("should render FileViewerModal with all the data with image", function () {
    const { container } = render(
      <FileViewerModal closeModel={closeModel} infoMap={mockInfoMap} />
    );
    expect(container.querySelector(".file-modal")).not.toBeNull();
    expect(screen.getByAltText(/image/i)).toBeTruthy();
    expect(screen.getByText(mockInfoMap.comment)).toBeTruthy();
    expect(screen.getByText(mockInfoMap.providerName)).toBeTruthy();
    expect(screen.getByText(mockInfoMap.encounterDateTime)).toBeTruthy();
  });

  it("should render FileViewerModal with all the data with video", function () {
    const { container } = render(
      <FileViewerModal closeModel={closeModel} infoMap={mockVideoInfoMap} />
    );
    expect(container.querySelector(".file-modal")).not.toBeNull();
    expect(screen.queryByLabelText("video-tag", { hidden: false } )).toBe(null);
    expect(screen.getByText(mockVideoInfoMap.comment)).toBeTruthy();
    expect(screen.getByText(mockVideoInfoMap.providerName)).toBeTruthy();
    expect(screen.getByText(mockVideoInfoMap.encounterDateTime)).toBeTruthy();
  });
});