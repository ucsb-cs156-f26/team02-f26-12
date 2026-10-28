import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";
import { toast } from "react-toastify";
import { currentUserFixtures } from "fixtures/currentUserFixtures";
import { ucsbOrganizationFixtures } from "fixtures/ucsbOrganizationFixtures";
import UCSBOrganizationTable from "main/components/UCSBOrganization/UCSBOrganizationTable";

const mockedNavigate = vi.fn();
vi.mock("react-router", async () => {
  const originalModule = await vi.importActual("react-router");
  return {
    ...originalModule,
    useNavigate: () => mockedNavigate,
  };
});
vi.mock("react-toastify", () => ({ toast: vi.fn() }));

describe("UCSBOrganizationTable tests", () => {
  const testId = "UCSBOrganizationTable";
  const expectedHeaders = [
    "Organization Code",
    "Short Name",
    "Full Name",
    "Inactive",
  ];
  const expectedFields = [
    "orgCode",
    "orgTranslationShort",
    "orgTranslation",
    "inactive",
  ];
  let queryClient;
  let axiosMock;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient();
    axiosMock = new AxiosMockAdapter(axios);
  });

  afterEach(() => {
    axiosMock.restore();
    queryClient.clear();
    vi.restoreAllMocks();
  });

  function renderTable(props) {
    return render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <UCSBOrganizationTable {...props} />
        </MemoryRouter>
      </QueryClientProvider>,
    );
  }

  test("renders an empty table with all four headers and no data cells", () => {
    renderTable({
      organizations: [],
      currentUser: currentUserFixtures.userOnly,
    });

    expectedHeaders.forEach((header) => {
      expect(screen.getByText(header)).toBeInTheDocument();
    });
    expectedFields.forEach((field) => {
      expect(
        screen.queryByTestId(`${testId}-cell-row-0-col-${field}`),
      ).not.toBeInTheDocument();
    });
  });

  test("renders every organization field and action buttons for an admin", () => {
    renderTable({
      organizations: ucsbOrganizationFixtures.threeOrganizations,
      currentUser: currentUserFixtures.adminUser,
    });

    expectedHeaders.forEach((header) => {
      expect(screen.getByText(header)).toBeInTheDocument();
    });
    ucsbOrganizationFixtures.threeOrganizations.forEach((organization, row) => {
      expectedFields.forEach((field) => {
        const expected = field === "inactive" ? "No" : organization[field];
        expect(
          screen.getByTestId(`${testId}-cell-row-${row}-col-${field}`),
        ).toHaveTextContent(expected);
      });
      expect(
        screen.getByTestId(`${testId}-cell-row-${row}-col-Edit-button`),
      ).toHaveClass("btn-primary");
      expect(
        screen.getByTestId(`${testId}-cell-row-${row}-col-Delete-button`),
      ).toHaveClass("btn-danger");
    });
  });

  test("shows organization data without action buttons for an ordinary user", () => {
    renderTable({
      organizations: ucsbOrganizationFixtures.threeOrganizations,
      currentUser: currentUserFixtures.userOnly,
    });

    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-orgCode`),
    ).toHaveTextContent("CHESS");
    expect(screen.queryByText("Edit")).not.toBeInTheDocument();
    expect(screen.queryByText("Delete")).not.toBeInTheDocument();
  });

  test("renders an inactive organization as Yes", () => {
    renderTable({
      organizations: [
        { ...ucsbOrganizationFixtures.oneOrganization[0], inactive: true },
      ],
      currentUser: currentUserFixtures.userOnly,
    });

    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-inactive`),
    ).toHaveTextContent("Yes");
  });

  test("Edit navigates using the selected organization's code", () => {
    renderTable({
      organizations: ucsbOrganizationFixtures.threeOrganizations,
      currentUser: currentUserFixtures.adminUser,
    });

    fireEvent.click(screen.getByTestId(`${testId}-cell-row-1-col-Edit-button`));

    expect(mockedNavigate).toHaveBeenCalledTimes(1);
    expect(mockedNavigate).toHaveBeenCalledWith("/ucsborganization/edit/MATH");
  });

  test("Delete sends the selected code and displays the success message", async () => {
    const message = { message: "UCSBOrganization with id MATH deleted" };
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    axiosMock.onDelete("/api/UCSBOrganization").reply(200, message);
    renderTable({
      organizations: ucsbOrganizationFixtures.threeOrganizations,
      currentUser: currentUserFixtures.adminUser,
    });

    fireEvent.click(
      screen.getByTestId(`${testId}-cell-row-1-col-Delete-button`),
    );

    await waitFor(() => expect(toast).toHaveBeenCalledWith(message.message));
    expect(axiosMock.history.delete).toHaveLength(1);
    expect(axiosMock.history.delete[0].params).toEqual({ orgCode: "MATH" });
    expect(consoleSpy).toHaveBeenCalledWith(message);
  });

  test("uses a custom test ID prefix for the table and action buttons", () => {
    renderTable({
      organizations: ucsbOrganizationFixtures.oneOrganization,
      currentUser: currentUserFixtures.adminUser,
      testIdPrefix: "CustomOrganizationTable",
    });

    expect(screen.getByTestId("CustomOrganizationTable")).toBeInTheDocument();
    expect(
      screen.getByTestId("CustomOrganizationTable-cell-row-0-col-Edit-button"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId(
        "CustomOrganizationTable-cell-row-0-col-Delete-button",
      ),
    ).toBeInTheDocument();
  });
});
