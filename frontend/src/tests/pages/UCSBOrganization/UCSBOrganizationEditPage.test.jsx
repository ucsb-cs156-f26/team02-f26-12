import { fireEvent, render, waitFor, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, Routes, Route } from "react-router";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";
import UCSBOrganizationEditPage from "main/pages/UCSBOrganization/UCSBOrganizationEditPage";
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import { ucsbOrganizationFixtures } from "fixtures/ucsbOrganizationFixtures";

const mockToast = vi.fn();
vi.mock("react-toastify", async (importOriginal) => ({
  ...(await importOriginal()),
  toast: (message) => mockToast(message),
}));
const mockNavigate = vi.fn();
vi.mock("react-router", async (importOriginal) => ({
  ...(await importOriginal()),
  Navigate: (props) => {
    mockNavigate(props);
    return null;
  },
}));

describe("UCSBOrganizationEditPage tests", () => {
  let axiosMock;
  let queryClient;
  const original = ucsbOrganizationFixtures.oneOrganization[0];
  const updated = {
    ...original,
    orgTranslationShort: "Chess Society",
    orgTranslation: "UCSB Chess Society",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    axiosMock = new AxiosMockAdapter(axios);
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.adminUser);
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);
    axiosMock
      .onGet("/api/UCSBOrganization", { params: { orgCode: "CHESS" } })
      .reply(200, original);
  });
  afterEach(() => {
    axiosMock.restore();
    queryClient.clear();
    vi.restoreAllMocks();
  });

  const renderPage = (props = {}) => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter
          initialEntries={["/ucsborganization", "/ucsborganization/edit/CHESS"]}
          initialIndex={1}
        >
          <Routes>
            <Route
              path="/ucsborganization"
              element={<p>Organization index</p>}
            />
            <Route
              path="/ucsborganization/edit/:id"
              element={<UCSBOrganizationEditPage {...props} />}
            />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>,
    );
  };

  const editFields = async (inactive = false) => {
    await screen.findByDisplayValue("CHESS");
    fireEvent.change(screen.getByLabelText("Short Name"), {
      target: { value: updated.orgTranslationShort },
    });
    fireEvent.change(screen.getByLabelText("Full Name"), {
      target: { value: updated.orgTranslation },
    });
    if (inactive) {
      fireEvent.click(screen.getByTestId("UCSBOrganizationForm-inactive"));
    }
  };

  test("loads the route's organization and populates the Update form", async () => {
    renderPage();
    const orgCode = await screen.findByDisplayValue("CHESS");
    expect(
      screen.getByRole("heading", { name: "Edit UCSBOrganization" }),
    ).toBeInTheDocument();
    expect(orgCode).toHaveAttribute("readonly");
    expect(screen.getByLabelText("Short Name")).toHaveValue("Chess Club");
    expect(screen.getByLabelText("Full Name")).toHaveValue("UCSB Chess Club");
    expect(
      screen.getByTestId("UCSBOrganizationForm-inactive"),
    ).not.toBeChecked();
    expect(screen.getByRole("button", { name: "Update" })).toBeInTheDocument();
    expect(
      axiosMock.history.get.find(
        (request) => request.url === "/api/UCSBOrganization",
      ).params,
    ).toEqual({ orgCode: "CHESS" });
  });

  test.each([false, true])(
    "updates all fields with inactive=%s and redirects after saving",
    async (inactive) => {
      const submitted = { ...updated, inactive };
      axiosMock.onPut("/api/UCSBOrganization").reply(200, submitted);
      renderPage();
      await editFields(inactive);
      fireEvent.click(screen.getByRole("button", { name: "Update" }));

      await waitFor(() =>
        expect(mockNavigate).toHaveBeenCalledWith({ to: "/ucsborganization" }),
      );
      expect(axiosMock.history.put).toHaveLength(1);
      expect(axiosMock.history.put[0].params).toEqual({ orgCode: "CHESS" });
      expect(JSON.parse(axiosMock.history.put[0].data)).toEqual(submitted);
      expect(mockToast).toHaveBeenCalledWith(
        "UCSBOrganization Updated - orgCode: CHESS name: Chess Society",
      );
    },
  );

  test("invalid data displays validation errors without saving", async () => {
    renderPage();
    await screen.findByDisplayValue("CHESS");
    fireEvent.change(screen.getByLabelText("Full Name"), {
      target: { value: "" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Update" }));

    expect(
      await screen.findByText("Full Name is required."),
    ).toBeInTheDocument();
    expect(axiosMock.history.put).toHaveLength(0);
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(
      screen.getByRole("heading", { name: "Edit UCSBOrganization" }),
    ).toBeInTheDocument();
  });

  test("Cancel returns to the previous page without saving changes", async () => {
    renderPage();
    await editFields(true);
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

    expect(await screen.findByText("Organization index")).toBeInTheDocument();
    expect(axiosMock.history.put).toHaveLength(0);
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(mockToast).not.toHaveBeenCalled();
  });

  test("failed loading leaves the header and no edit form", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    axiosMock
      .onGet("/api/UCSBOrganization", { params: { orgCode: "CHESS" } })
      .timeout();
    renderPage();

    await waitFor(() =>
      expect(errorSpy).toHaveBeenCalledWith(
        "Error communicating with backend via GET on /api/UCSBOrganization",
        expect.anything(),
      ),
    );
    expect(
      screen.getByRole("heading", { name: "Edit UCSBOrganization" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByLabelText("Organization Code"),
    ).not.toBeInTheDocument();
  });

  test("failed update keeps the edited form visible", async () => {
    axiosMock.onPut("/api/UCSBOrganization").reply(500);
    renderPage();
    await editFields();
    fireEvent.click(screen.getByRole("button", { name: "Update" }));

    await waitFor(() =>
      expect(mockToast).toHaveBeenCalledWith(
        expect.stringContaining("Request failed with status code 500"),
      ),
    );
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(screen.getByLabelText("Short Name")).toHaveValue("Chess Society");
    expect(axiosMock.history.put).toHaveLength(1);
  });

  test("storybook mode shows success without navigating away", async () => {
    axiosMock.onPut("/api/UCSBOrganization").reply(200, updated);
    renderPage({ storybook: true });
    await editFields();
    fireEvent.click(screen.getByRole("button", { name: "Update" }));

    await waitFor(() =>
      expect(mockToast).toHaveBeenCalledWith(
        "UCSBOrganization Updated - orgCode: CHESS name: Chess Society",
      ),
    );
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(screen.getByLabelText("Short Name")).toHaveValue("Chess Society");
  });
});
