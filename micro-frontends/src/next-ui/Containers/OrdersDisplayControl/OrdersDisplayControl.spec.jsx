import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { OrdersDisplayControl } from "./OrdersDisplayControl";
import axios from "axios";

jest.mock("axios");

jest.mock("../../Components/i18n/I18nProvider", () => ({
  I18nProvider: ({ children }) => <div>{children}</div>,
}));

jest.mock("react-intl", () => ({
  FormattedMessage: ({ defaultMessage, id, values }) => (
    <span>{defaultMessage}</span>
  ),
}));

jest.mock("../../Components/ViewOrders/ViewOrders", () => ({
  ViewOrders: ({ orders }) => (
    <div data-testid="view-orders">
      {orders.map((order, idx) => (
        <div key={idx} data-testid={`order-${idx}`}>
          {order.name}
        </div>
      ))}
    </div>
  ),
}));

describe("OrdersDisplayControl", () => {
  const mockHostData = {
    translationKey: "TEST_ORDERS",
    orderType: {
      uuid: "order-type-uuid-123",
    },
    patient: {
      uuid: "patient-uuid-456",
    },
    name: "Test Patient",
  };

  const mockHostApi = {};

  const mockServiceRequestResponse = {
    data: {
      entry: [
        {
          resource: {
            code: { text: "Lab Order 1" },
            requester: { display: "Dr. Smith" },
            authoredOn: "2024-01-15T10:00:00.000Z",
            status: "active",
            extension: [
              {
                url: "http://example.com/fhir/StructureDefinition/task-created-on",
                valueDateTime: "2024-01-20T11:00:00.000Z",
              },
              {
                url: "http://example.com/fhir/StructureDefinition/task-status",
                valueString: "REQUESTED",
              },
              {
                url: "http://example.com/fhir/StructureDefinition/task-owner",
                valueReference: { display: "Dr. David" },
              },
              {
                url: "http://example.com/fhir/StructureDefinition/task-note",
                valueAnnotation: { text: "Test notes" },
              },
              {
                url: "http://example.com/fhir/StructureDefinition/created-by",
                valueReference: { display: "Admin User" },
              },
            ],
          },
        },
        {
          resource: {
            code: { text: "Lab Order 2" },
            requester: { display: "Dr. Johnson" },
            authoredOn: "2024-01-10T10:00:00.000Z",
            status: "active",
            extension: [
              {
                url: "http://example.com/fhir/StructureDefinition/task-created-on",
                valueDateTime: "2024-01-18T11:00:00.000Z",
              },
              {
                url: "http://example.com/fhir/StructureDefinition/task-status",
                valueString: "ACCEPTED",
              },
              {
                url: "http://example.com/fhir/StructureDefinition/task-owner",
                valueReference: { display: "Dr. John" },
              },
              {
                url: "http://example.com/fhir/StructureDefinition/created-by",
                valueReference: { display: "Nurse User" },
              },
            ],
          },
        },
        {
          resource: {
            code: { text: "Lab Order 3" },
            requester: { display: "Dr. Brown" },
            authoredOn: "2024-01-05T10:00:00.000Z",
            status: "active",
            extension: [
              {
                url: "http://example.com/fhir/StructureDefinition/task-created-on",
                valueDateTime: "2024-01-22T11:00:00.000Z",
              },
            ],
          },
        },
      ],
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render the component", async () => {
    axios.get.mockResolvedValueOnce(mockServiceRequestResponse);

    const { container } = render(
      <OrdersDisplayControl hostData={mockHostData} hostApi={mockHostApi} />
    );
    await waitFor(() => {
      expect(screen.getByText("TEST_ORDERS")).toBeTruthy();
      expect(screen.getByText("Lab Order 1")).toBeTruthy();
      expect(screen.getByText("Lab Order 2")).toBeTruthy();
      expect(screen.getByText("Lab Order 3")).toBeTruthy();
      expect(container).toMatchSnapshot();
    });
  });

  it("should make API call with correct parameters", async () => {
    axios.get.mockResolvedValueOnce(mockServiceRequestResponse);

    render(<OrdersDisplayControl hostData={mockHostData} hostApi={mockHostApi} />);

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(
        "/openmrs/ws/fhir2/R4/ServiceRequest",
        {
          params: {
            category: "order-type-uuid-123",
            patient: "patient-uuid-456",
          },
        }
      );
    });
  });

  it("should render section title with translation key", async () => {
    axios.get.mockResolvedValueOnce(mockServiceRequestResponse);

    render(<OrdersDisplayControl hostData={mockHostData} hostApi={mockHostApi}/>);

    await waitFor(() => {
      expect(screen.getByText("TEST_ORDERS")).toBeTruthy();
      expect(screen.getByTestId("view-orders")).toBeTruthy();
      expect(screen.getByTestId("order-0")).toBeTruthy();
      expect(screen.getByTestId("order-1")).toBeTruthy();
      expect(screen.getByTestId("order-2")).toBeTruthy();
      expect(screen.getByText("Lab Order 1")).toBeTruthy();
      expect(screen.getByText("Lab Order 2")).toBeTruthy();
      expect(screen.getByText("Lab Order 3")).toBeTruthy();
    });
  });

  it("should render no orders message when no orders found", async () => {
    axios.get.mockResolvedValueOnce({ data: { entry: [] } });

    render(<OrdersDisplayControl hostData={mockHostData} hostApi={{}} />);

    await waitFor(() => {
      expect(screen.getByText(/No Orders found/)).toBeTruthy();
    });
  });

  it("should render no orders message when API returns undefined entry", async () => {
    axios.get.mockResolvedValueOnce({ data: {} });

    render(<OrdersDisplayControl hostData={mockHostData} />);

    await waitFor(() => {
      expect(screen.getByText(/No Orders found/)).toBeTruthy();
    });
  });

  it("should handle API error gracefully", async () => {
    const mockError = new Error("API Error");
    axios.get.mockRejectedValueOnce(mockError);

    render(<OrdersDisplayControl hostData={mockHostData} />);

    await waitFor(() => {
      expect(screen.getByText(/No Orders found/)).toBeTruthy();
    });
  });

  it("should set empty orders array when API returns null data", async () => {
    axios.get.mockResolvedValueOnce({ data: null });

    render(<OrdersDisplayControl hostData={mockHostData} />);

    await waitFor(() => {
      expect(screen.getByText(/No Orders found/)).toBeTruthy();
    });
  });

  it("should handle extensions with missing optional fields", async () => {
    const responseWithMissingFields = {
      data: {
        entry: [
          {
            resource: {
              code: { text: "Simple Order" },
              requester: { display: "Dr. Test" },
              authoredOn: "2024-01-15T10:00:00.000Z",
              status: "active",
              extension: [
                {
                  url: "http://example.com/fhir/StructureDefinition/task-status",
                  valueString: "REQUESTED",
                },
              ],
            },
          },
        ],
      },
    };

    axios.get.mockResolvedValueOnce(responseWithMissingFields);

    render(<OrdersDisplayControl hostData={mockHostData} hostApi={mockHostApi} />);

    await waitFor(() => {
      expect(screen.getByText("Simple Order")).toBeTruthy();
    });
  });

  it("should handle resource without extension array", async () => {
    const responseWithoutExtensions = {
      data: {
        entry: [
          {
            resource: {
              code: { text: "Order Without Extensions" },
              requester: { display: "Dr. Test" },
              status: "active",
              authoredOn: "2024-01-15T10:00:00.000Z",
            },
          },
        ],
      },
    };

    axios.get.mockResolvedValueOnce(responseWithoutExtensions);

    render(<OrdersDisplayControl hostData={mockHostData} hostApi={mockHostApi} />);

    await waitFor(() => {
      expect(screen.getByText("Order Without Extensions")).toBeTruthy();
    });
  });

  it("should handle extensions with invalid URLs", async () => {
    const responseWithInvalidUrls = {
      data: {
        entry: [
          {
            resource: {
              code: { text: "Order With Invalid URLs" },
              requester: { display: "Dr. Test" },
              authoredOn: "2024-01-15T10:00:00.000Z",
              status: "active",
              extension: [
                {
                  url: "http://example.com/unknown-extension",
                  valueString: "Some Value",
                },
              ],
            },
          },
        ],
      },
    };

    axios.get.mockResolvedValueOnce(responseWithInvalidUrls);

    render(<OrdersDisplayControl hostData={mockHostData} hostApi={mockHostApi} />);

    await waitFor(() => {
      expect(screen.getByText("Order With Invalid URLs")).toBeTruthy();
    });
  });

  it("should handle resource without code.text", async () => {
    const responseWithoutCodeText = {
      data: {
        entry: [
          {
            resource: {
              code: {},
              requester: { display: "Dr. Test" },
              authoredOn: "2024-01-15T10:00:00.000Z",
              status: "active",
              extension: [],
            },
          },
        ],
      },
    };

    axios.get.mockResolvedValueOnce(responseWithoutCodeText);

    render(<OrdersDisplayControl hostData={mockHostData} />);

    await waitFor(() => {
      expect(screen.getByTestId("view-orders")).toBeTruthy();
    });
  });

  it("should handle resource without requester.display", async () => {
    const responseWithoutRequester = {
      data: {
        entry: [
          {
            resource: {
              code: { text: "Order Without Requester" },
              status: "active",
              authoredOn: "2024-01-15T10:00:00.000Z",
              extension: [],
            },
          },
        ],
      },
    };

    axios.get.mockResolvedValueOnce(responseWithoutRequester);

    render(<OrdersDisplayControl hostData={mockHostData} />);

    await waitFor(() => {
      expect(screen.getByText("Order Without Requester")).toBeTruthy();
    });
  });

  it("should handle multiple orders and maintain sorting", async () => {
    const multipleOrders = {
      data: {
        entry: [
          {
            resource: {
              code: { text: "Order A" },
              requester: { display: "Dr. A" },
              authoredOn: "2024-01-20T10:00:00.000Z",
              status: "active",
              extension: [],
            },
          },
          {
            resource: {
              code: { text: "Order B" },
              requester: { display: "Dr. B" },
              status: "active",
              authoredOn: "2024-01-10T10:00:00.000Z",
              extension: [],
            },
          },
          {
            resource: {
              code: { text: "Order C" },
              requester: { display: "Dr. C" },
              status: "active",
              authoredOn: "2024-01-30T10:00:00.000Z",
              extension: [],
            },
          },
        ],
      },
    };

    axios.get.mockResolvedValueOnce(multipleOrders);

    const { container } = render(
      <OrdersDisplayControl hostData={mockHostData} hostApi={mockHostApi} />
    );

    await waitFor(() => {
      const orders = container.querySelectorAll("[data-testid^='order-']");
      expect(orders[0].textContent).toBe("Order C");
      expect(orders[1].textContent).toBe("Order A");
      expect(orders[2].textContent).toBe("Order B");
    });
  });

  it("should render with padding div when no orders", async () => {
    axios.get.mockResolvedValueOnce({ data: { entry: [] } });

    const { container } = render(
      <OrdersDisplayControl hostData={mockHostData} hostApi={mockHostApi} />
    );

    await waitFor(() => {
      const paddingDiv = container.querySelector("div[style]");
      expect(paddingDiv).toBeTruthy();
      expect(paddingDiv.style.padding).toBe("5px");
    });
  });

  it("should call ViewOrders with transformed orders", async () => {
    axios.get.mockResolvedValueOnce(mockServiceRequestResponse);

    render(<OrdersDisplayControl hostData={mockHostData} hostApi={mockHostApi} />);

    await waitFor(() => {
      const viewOrdersComponent = screen.getByTestId("view-orders");
      expect(viewOrdersComponent).toBeTruthy();
      expect(screen.getByTestId("order-0")).toBeTruthy();
    });
  });
});
