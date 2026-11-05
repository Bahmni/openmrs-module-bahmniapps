import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { OrdersDisplayControl } from "./OrdersDisplayControl";
import axios from "axios";
import { FHIR_URL, FHIR_SERVICE_REQUEST_URL } from "../../constants";

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

  const mockOrderResource = (id, text, requester, date, extras = {}) => ({
    resource: {
      id,
      code: { text },
      requester: { display: requester },
      authoredOn: date,
      status: "active",
      ...extras,
    },
  });

  const mockServiceRequestResponse = {
    data: {
      entry: [
        mockOrderResource("order-1", "Lab Order 1", "Dr. Smith", "2024-01-15T10:00:00.000Z"),
        mockOrderResource("order-2", "Lab Order 2", "Dr. Johnson", "2024-01-10T10:00:00.000Z"),
        mockOrderResource("order-3", "Lab Order 3", "Dr. Brown", "2024-01-05T10:00:00.000Z"),
      ],
    },
  };

  const mockTaskResponse = {
    data: {
      entry: [
        {
          resource: {
            id: "task-1",
            basedOn: [{ reference: "ServiceRequest/order-1" }],
            status: "accepted",
            owner: { display: "Dr. David" },
            note: [{ text: "Test notes" }],
            meta: { lastUpdated: "2024-01-20T11:00:00.000Z" },
          },
        },
        {
          resource: {
            id: "task-2",
            basedOn: [{ reference: "ServiceRequest/order-2" }],
            status: "requested",
            owner: { display: "Dr. John" },
            meta: { lastUpdated: "2024-01-18T11:00:00.000Z" },
          },
        },
      ],
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const createServiceRequestResponse = (orders) => ({ data: { entry: orders } });

  const mockAxios = (sr, task) => {
    axios.get.mockResolvedValueOnce(sr);
    if (task !== undefined) {
      axios.get.mockResolvedValueOnce(task);
    }
  };

  const mockOrdersAndRender = (orders) => {
    mockAxios(createServiceRequestResponse(orders), createServiceRequestResponse([]));
    renderComponent();
  };

  const renderComponent = () =>
    render(<OrdersDisplayControl hostData={mockHostData} />);

  const assertNoOrdersFound = () => expect(screen.getByText(/No Orders found/)).toBeTruthy();

  it("should render the component", async () => {
    axios.get.mockResolvedValueOnce(mockServiceRequestResponse);
    axios.get.mockResolvedValueOnce(mockTaskResponse);

    const { container } = renderComponent();
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
    axios.get.mockResolvedValueOnce(mockTaskResponse);

    renderComponent();

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(
        FHIR_SERVICE_REQUEST_URL,
        {
          params: {
            category: "order-type-uuid-123",
            patient: "patient-uuid-456",
            _count: 100,
          },
        }
      );
      expect(axios.get).toHaveBeenCalledWith(
        FHIR_URL,
        {
          params: {
            "based-on": "ServiceRequest/order-1,ServiceRequest/order-2,ServiceRequest/order-3",
            _count: 100,
          },
        }
      );
    });
  });

  it("should render section title with translation key", async () => {
    axios.get.mockResolvedValueOnce(mockServiceRequestResponse);
    axios.get.mockResolvedValueOnce(mockTaskResponse);

    renderComponent();

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
    mockAxios(createServiceRequestResponse([]));

    renderComponent();

    await waitFor(() => {
      assertNoOrdersFound();
    });
  });

  it("should render no orders message when API returns undefined entry", async () => {
    axios.get.mockResolvedValueOnce({ data: {} });

    renderComponent();

    await waitFor(() => {
      assertNoOrdersFound();
    });
  });

  it("should handle API error gracefully", async () => {
    const mockError = new Error("API Error");
    axios.get.mockRejectedValueOnce(mockError);

    renderComponent();

    await waitFor(() => {
      assertNoOrdersFound();
    });
  });

  it("should set empty orders array when API returns null data", async () => {
    axios.get.mockResolvedValueOnce({ data: null });

    renderComponent();

    await waitFor(() => {
      assertNoOrdersFound();
    });
  });

  it("should handle extensions with missing optional fields", async () => {
    mockAxios(createServiceRequestResponse([
      mockOrderResource("order-1", "Simple Order", "Dr. Test", "2024-01-15T10:00:00.000Z", {
        extension: [
          {
            url: "http://example.com/fhir/StructureDefinition/task-status",
            valueString: "REQUESTED",
          },
        ],
      }),
    ]));

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText("Simple Order")).toBeTruthy();
    });
  });

  it("should handle resource without extension array", async () => {
    mockAxios(createServiceRequestResponse([
      mockOrderResource("order-1", "Order Without Extensions", "Dr. Test", "2024-01-15T10:00:00.000Z"),
    ]));

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText("Order Without Extensions")).toBeTruthy();
    });
  });

  it("should handle extensions with invalid URLs", async () => {
    mockAxios(createServiceRequestResponse([
      mockOrderResource("order-1", "Order With Invalid URLs", "Dr. Test", "2024-01-15T10:00:00.000Z", {
        extension: [
          {
            url: "http://example.com/unknown-extension",
            valueString: "Some Value",
          },
        ],
      }),
    ]));

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText("Order With Invalid URLs")).toBeTruthy();
    });
  });

  it("should handle resource without code.text", async () => {
    mockAxios(createServiceRequestResponse([
      {
        resource: {
          code: {},
          requester: { display: "Dr. Test" },
          authoredOn: "2024-01-15T10:00:00.000Z",
          status: "active",
        },
      },
    ]));

    renderComponent();

    await waitFor(() => {
      expect(screen.getByTestId("view-orders")).toBeTruthy();
    });
  });

  it("should handle resource without requester.display", async () => {
    mockAxios(createServiceRequestResponse([
      {
        resource: {
          code: { text: "Order Without Requester" },
          status: "active",
          authoredOn: "2024-01-15T10:00:00.000Z",
        },
      },
    ]));

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText("Order Without Requester")).toBeTruthy();
    });
  });

  it("should handle multiple orders and maintain sorting", async () => {
    mockAxios(createServiceRequestResponse([
      mockOrderResource("order-1", "Order A", "Dr. A", "2024-01-20T10:00:00.000Z"),
      mockOrderResource("order-2", "Order B", "Dr. B", "2024-01-10T10:00:00.000Z"),
      mockOrderResource("order-3", "Order C", "Dr. C", "2024-01-30T10:00:00.000Z"),
    ]));

    const { container } = renderComponent();

    await waitFor(() => {
      const orders = container.querySelectorAll("[data-testid^='order-']");
      expect(orders[0].textContent).toBe("Order C");
      expect(orders[1].textContent).toBe("Order A");
      expect(orders[2].textContent).toBe("Order B");
    });
  });

  it("should render with padding div when no orders", async () => {
    mockAxios(createServiceRequestResponse([]));

    const { container } = renderComponent();

    await waitFor(() => {
      const paddingDiv = container.querySelector("div[style]");
      expect(paddingDiv).toBeTruthy();
      expect(paddingDiv.style.padding).toBe("5px");
    });
  });

  it("should call ViewOrders with transformed orders", async () => {
    mockAxios(mockServiceRequestResponse, mockTaskResponse);

    renderComponent();

    await waitFor(() => {
      const viewOrdersComponent = screen.getByTestId("view-orders");
      expect(viewOrdersComponent).toBeTruthy();
      expect(screen.getByTestId("order-0")).toBeTruthy();
    });
  });

  it("should filter out replacement orders (orders with replaces field)", async () => {
    mockAxios(createServiceRequestResponse([
      mockOrderResource("order-1", "Active Order", "Dr. Smith", "2024-01-15T10:00:00.000Z"),
      mockOrderResource("order-2", "Replacement Order", "Dr. Smith", "2024-01-16T10:00:00.000Z", {
        replaces: [{ reference: "ServiceRequest/order-1" }],
      }),
    ]), createServiceRequestResponse([]));

    renderComponent();

    await waitFor(() => {
      expect(screen.queryByText("Replacement Order")).toBeNull();
      expect(screen.queryByText("Active Order")).toBeNull();
    });
  });

  it("should filter out cancelled orders (orders referenced in replaces field)", async () => {
    mockOrdersAndRender([
      mockOrderResource("cancelled-order-123", "Cancelled Order", "Dr. Johnson", "2024-01-10T10:00:00.000Z"),
      mockOrderResource("replacement-order-456", "Replacement Order", "Dr. Johnson", "2024-01-12T10:00:00.000Z", {
        replaces: [{ reference: "ServiceRequest/cancelled-order-123" }],
      }),
      mockOrderResource("normal-order-789", "Normal Order", "Dr. Brown", "2024-01-13T10:00:00.000Z"),
    ]);

    await waitFor(() => {
      expect(screen.queryByText("Cancelled Order")).toBeNull();
      expect(screen.queryByText("Replacement Order")).toBeNull();
      expect(screen.getByText("Normal Order")).toBeTruthy();
    });
  });

  it("should show orders with empty replaces array", async () => {
    mockOrdersAndRender([
      mockOrderResource("order-with-empty-replaces", "Order With Empty Replaces", "Dr. Test", "2024-01-15T10:00:00.000Z", {
        replaces: [],
      }),
    ]);

    await waitFor(() => {
      expect(screen.getByText("Order With Empty Replaces")).toBeTruthy();
    });
  });

  it("should handle malformed reference strings without crashing", async () => {
    mockOrdersAndRender([
      mockOrderResource("order-1", "Active Order", "Dr. Smith", "2024-01-15T10:00:00.000Z"),
      mockOrderResource("order-2", "Order With Malformed Reference", "Dr. Smith", "2024-01-16T10:00:00.000Z", {
        replaces: [{ reference: "InvalidFormat" }],
      }),
      mockOrderResource("order-3", "Order With Null Reference", "Dr. Jones", "2024-01-17T10:00:00.000Z", {
        replaces: [{ reference: null }],
      }),
    ]);

    await waitFor(() => {
      expect(screen.getByText("Active Order")).toBeTruthy();
      expect(screen.queryByText("Order With Malformed Reference")).toBeNull();
      expect(screen.queryByText("Order With Null Reference")).toBeNull();
    });
  });

  it("should handle complex replacement chains correctly", async () => {
    mockOrdersAndRender([
      mockOrderResource("original-order", "Original Order", "Dr. A", "2024-01-10T10:00:00.000Z"),
      mockOrderResource("first-replacement", "First Replacement", "Dr. B", "2024-01-11T10:00:00.000Z", {
        replaces: [{ reference: "ServiceRequest/original-order" }],
      }),
      mockOrderResource("second-replacement", "Second Replacement", "Dr. C", "2024-01-12T10:00:00.000Z", {
        replaces: [{ reference: "ServiceRequest/first-replacement" }],
      }),
      mockOrderResource("independent-order", "Independent Order", "Dr. D", "2024-01-13T10:00:00.000Z"),
    ]);

    await waitFor(() => {
      expect(screen.queryByText("Original Order")).toBeNull();
      expect(screen.queryByText("First Replacement")).toBeNull();
      expect(screen.queryByText("Second Replacement")).toBeNull();
      expect(screen.getByText("Independent Order")).toBeTruthy();
    });
  });

  it("should handle multiple orders replacing the same order", async () => {
    mockOrdersAndRender([
      mockOrderResource("original-order", "Original Order", "Dr. A", "2024-01-10T10:00:00.000Z"),
      mockOrderResource("replacement-1", "Replacement 1", "Dr. B", "2024-01-11T10:00:00.000Z", {
        replaces: [{ reference: "ServiceRequest/original-order" }],
      }),
      mockOrderResource("replacement-2", "Replacement 2", "Dr. C", "2024-01-11T11:00:00.000Z", {
        replaces: [{ reference: "ServiceRequest/original-order" }],
      }),
    ]);

    await waitFor(() => {
      expect(screen.queryByText("Original Order")).toBeNull();
      expect(screen.queryByText("Replacement 1")).toBeNull();
      expect(screen.queryByText("Replacement 2")).toBeNull();
      expect(screen.getByText(/No Orders found/)).toBeTruthy();
    });
  });

  it("should use shortName from FHIR_EXT_ORDER_SHORT_NAME extension instead of code.text when present", async () => {
    mockOrdersAndRender([
      mockOrderResource("order-with-short-name", "Full Long Order Name", "Dr. Test", "2024-01-15T10:00:00.000Z", {
        extension: [
          {
            url: "http://example.com/fhir/StructureDefinition/order-short-name",
            valueString: "Short Name",
          },
        ],
      }),
    ]);

    await waitFor(() => {
      expect(screen.getByText("Short Name")).toBeTruthy();
      expect(screen.queryByText("Full Long Order Name")).toBeNull();
    });
  });

  it("should handle missing resource.id gracefully", async () => {
    mockOrdersAndRender([
      {
        resource: {
          code: { text: "Order Without ID" },
          requester: { display: "Dr. Test" },
          authoredOn: "2024-01-15T10:00:00.000Z",
          status: "active",
        },
      },
      mockOrderResource("order-with-id", "Order With ID", "Dr. Test", "2024-01-16T10:00:00.000Z"),
    ]);

    await waitFor(() => {
      expect(screen.getByText("Order Without ID")).toBeTruthy();
      expect(screen.getByText("Order With ID")).toBeTruthy();
    });
  });
});
