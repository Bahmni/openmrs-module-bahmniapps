import React from "react";
import { render, screen, within } from "@testing-library/react";
import { BuildFileViewer } from "./BuildFileViewer.jsx";
import { mockIndex, mockItem, mockPdfItem, mockVideoItem } from "../FileViewerMockData";
import { formatDate } from "../../../../utils/utils";

describe("BuildFileViewer", function () {

  it("should render BuildFileViewer with all the data with image", function () {
    const { container } = render(
      <BuildFileViewer item={mockItem} index={mockIndex} />
    );
    expect(container.querySelector(".form-obs-image")).not.toBeNull();
    expect(screen.getByAltText(/image/i)).toBeTruthy();
    expect(screen.getByText(mockItem.comment)).toBeTruthy();
    const provider_info = container.querySelector(".provider-info");
    expect(within(provider_info).getByText(/test provider/i)).toBeTruthy();
    expect(within(provider_info).getByText(new RegExp(formatDate(mockItem.encounterDateTime)))).toBeTruthy();
  });

  it("should render BuildFileViewer with all the data with video and download option", function () {
    const { container } = render(
      <BuildFileViewer item={mockVideoItem} index={mockIndex} />
    );
    expect(container.querySelector(".form-obs-video-image")).not.toBeNull();
    expect(container.querySelector(".video-play-button-icon")).not.toBeNull();
    expect(container.querySelector(".download-link")).not.toBeNull();
    expect(screen.getByAltText(/image/i)).toBeTruthy();
    expect(screen.getByText(mockVideoItem.comment)).toBeTruthy();
    const provider_info = container.querySelector(".provider-info");
    expect(within(provider_info).getByText(/test provider/i)).toBeTruthy();
    expect(within(provider_info).getByText(new RegExp(formatDate(mockItem.encounterDateTime)))).toBeTruthy();
  });


  it("should render BuildFileViewer with all the data with pdf link", function () {
    const { container } = render(
      <BuildFileViewer item={mockPdfItem} index={mockIndex} />
    );
    expect(container.querySelector(".pdf-link")).not.toBeNull();
    expect(screen.getByText(mockPdfItem.comment)).toBeTruthy();
    const provider_info = container.querySelector(".provider-info");
    expect(within(provider_info).getByText(/test provider/i)).toBeTruthy();
    expect(within(provider_info).getByText(new RegExp(formatDate(mockItem.encounterDateTime)))).toBeTruthy();
  });
});
