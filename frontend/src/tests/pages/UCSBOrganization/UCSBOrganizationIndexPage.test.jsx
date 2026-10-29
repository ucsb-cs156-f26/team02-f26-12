import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";
import UCSBOrganizationIndexPage from "main/pages/UCSBOrganization/UCSBOrganizationIndexPage";
import { ucsbOrganizationFixtures } from "fixtures/ucsbOrganizationFixtures";
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";

const mockToast = vi.fn();
vi.mock("react-toastify", async (importOriginal) => ({
  ...(await importOriginal()),
  toast: (message) => mockToast(message),
}));
const mockNavigate = vi.fn();
vi.mock("react-router", async (importOriginal) => ({
  ...(await importOriginal()),
  useNavigate: () => mockNavigate,
}));

describe("UCSBOrganizationIndexPage tests", () => {
  let axiosMock;
  let queryClient;
  const testId = "UCSBOrganizationTable";
  const organizations = ucsbOrganizationFixtures.threeOrganizations.map(
    (organization, index) => ({ ...organization, inactive: index === 1 }),
  );

  beforeEach(() => {
    vi.clearAllMocks();
    axiosMock = new AxiosMockAdapter(axios);
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
  });
  afterEach(() => {
    axiosMock.restore();
    queryClient.clear();
    vi.restoreAllMocks();
  });

  const renderPage = (user = apiCurrentUserFixtures.adminUser) => {
    axiosMock.onGet("/api/currentUser").reply(200, user);
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <UCSBOrganizationIndexPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );
  };

  test("admin sees the heading and Create link on an empty table", async () => {
    axiosMock.onGet("/api/UCSBOrganization/all").reply(200, []);
    renderPage();

    const createButton = await screen.findByText("Create UCSBOrganization");
    expect(createButton).toHaveAttribute("href", "/ucsborganization/create");
    expect(createButton).toHaveAttribute("style", "float: right;");
    expect(
      screen.getByRole("heading", { name: "UCSBOrganizations" }),
    ).toBeInTheDocument();
    expect(
      screen.getAllByRole("columnheader").map((header) => header.textContent),
    ).toEqual([
      "Organization Code",
      "Short Name",
      "Full Name",
      "Inactive",
      "Edit",
      "Delete",
    ]);
    expect(
      screen.queryByRole("button", { name: "Edit", exact: true }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Delete", exact: true }),
    ).not.toBeInTheDocument();
  });

  test("regular users see every field in every row without management controls", async () => {
    axiosMock.onGet("/api/UCSBOrganization/all").reply(200, organizations);
    renderPage(apiCurrentUserFixtures.userOnly);

    await screen.findByText("Welcome, pconrad.cis@gmail.com");
    await screen.findByText("CHESS");
    organizations.forEach((organization, index) => {
      ["orgCode", "orgTranslationShort", "orgTranslation"].forEach((field) => {
        expect(
          screen.getByTestId(`${testId}-cell-row-${index}-col-${field}`),
        ).toHaveTextContent(organization[field]);
      });
      expect(
        screen.getByTestId(`${testId}-cell-row-${index}-col-inactive`),
      ).toHaveTextContent(organization.inactive ? "Yes" : "No");
    });
    expect(
      screen.queryByText("Create UCSBOrganization"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Edit", exact: true }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Delete", exact: true }),
    ).not.toBeInTheDocument();
  });

  test("admin sees row actions and Edit navigates using the organization code", async () => {
    axiosMock.onGet("/api/UCSBOrganization/all").reply(200, organizations);
    renderPage();

    await screen.findByText("Create UCSBOrganization");
    await screen.findByText("CHESS");
    expect(
      screen.getAllByRole("button", { name: "Edit", exact: true }),
    ).toHaveLength(3);
    expect(
      screen.getAllByRole("button", { name: "Delete", exact: true }),
    ).toHaveLength(3);
    fireEvent.click(screen.getByTestId(`${testId}-cell-row-0-col-Edit-button`));
    expect(mockNavigate).toHaveBeenCalledWith("/ucsborganization/edit/CHESS");
  });

  test("backend failure leaves an empty table and reports the GET error", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    axiosMock.onGet("/api/UCSBOrganization/all").timeout();
    renderPage(apiCurrentUserFixtures.userOnly);

    await waitFor(() =>
      expect(errorSpy).toHaveBeenCalledWith(
        "Error communicating with backend via GET on /api/UCSBOrganization/all",
        expect.anything(),
      ),
    );
    expect(screen.queryByText("CHESS")).not.toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "UCSBOrganizations" }),
    ).toBeInTheDocument();
  });

  test("Delete sends orgCode and refetches the table without the deleted row", async () => {
    axiosMock.onGet("/api/UCSBOrganization/all").replyOnce(200, organizations);
    axiosMock
      .onGet("/api/UCSBOrganization/all")
      .reply(200, organizations.slice(1));
    axiosMock.onDelete("/api/UCSBOrganization").reply(200, {
      message: "UCSBOrganization with id CHESS deleted",
    });
    renderPage();

    await screen.findByText("Create UCSBOrganization");
    await screen.findByText("CHESS");
    fireEvent.click(
      screen.getByTestId(`${testId}-cell-row-0-col-Delete-button`),
    );

    await waitFor(() =>
      expect(screen.queryByText("CHESS")).not.toBeInTheDocument(),
    );
    expect(screen.getByText("MATH")).toBeInTheDocument();
    expect(axiosMock.history.delete).toHaveLength(1);
    expect(axiosMock.history.delete[0].params).toEqual({ orgCode: "CHESS" });
    expect(
      axiosMock.history.get.filter(
        (request) => request.url === "/api/UCSBOrganization/all",
      ),
    ).toHaveLength(2);
    expect(mockToast).toHaveBeenCalledWith(
      "UCSBOrganization with id CHESS deleted",
    );
  });
});
