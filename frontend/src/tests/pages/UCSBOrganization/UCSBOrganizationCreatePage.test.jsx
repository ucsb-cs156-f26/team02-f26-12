import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import UCSBOrganizationCreatePage from "main/pages/UCSBOrganization/UCSBOrganizationCreatePage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import { ucsbOrganizationFixtures } from "fixtures/ucsbOrganizationFixtures";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";

const mockToast = vi.fn();
vi.mock("react-toastify", async (importOriginal) => {
  const originalModule = await importOriginal();
  return {
    ...originalModule,
    toast: vi.fn((x) => mockToast(x)),
  };
});

const mockNavigate = vi.fn();
vi.mock("react-router", async (importOriginal) => {
  const originalModule = await importOriginal();
  return {
    ...originalModule,
    Navigate: vi.fn((x) => {
      mockNavigate(x);
      return null;
    }),
  };
});

describe("UCSBOrganizationCreatePage tests", () => {
  const axiosMock = new AxiosMockAdapter(axios);
  const organization = ucsbOrganizationFixtures.oneOrganization[0];

  beforeEach(() => {
    vi.clearAllMocks();
    axiosMock.reset();
    axiosMock.resetHistory();
    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.adminUser);
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);
  });

  const renderPage = (props = {}) => {
    render(
      <QueryClientProvider client={new QueryClient()}>
        <MemoryRouter>
          <UCSBOrganizationCreatePage {...props} />
        </MemoryRouter>
      </QueryClientProvider>,
    );
  };

  const fillForm = (values = organization) => {
    fireEvent.change(screen.getByLabelText("Organization Code"), {
      target: { value: values.orgCode },
    });
    fireEvent.change(screen.getByLabelText("Short Name"), {
      target: { value: values.orgTranslationShort },
    });
    fireEvent.change(screen.getByLabelText("Full Name"), {
      target: { value: values.orgTranslation },
    });
    if (values.inactive) {
      fireEvent.click(screen.getByTestId("UCSBOrganizationForm-inactive"));
    }
  };

  test("renders the Create heading and organization form", async () => {
    renderPage();

    expect(
      await screen.findByRole("heading", {
        name: "Create New UCSBOrganization",
      }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Organization Code")).toBeInTheDocument();
    expect(screen.getByLabelText("Short Name")).toBeInTheDocument();
    expect(screen.getByLabelText("Full Name")).toBeInTheDocument();
    expect(
      screen.getByTestId("UCSBOrganizationForm-inactive"),
    ).not.toBeChecked();
    expect(screen.getByRole("button", { name: "Create" })).toBeInTheDocument();
    expect(axiosMock.history.post).toHaveLength(0);
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  test.each([false, true])(
    "submits all fields with inactive=%s and redirects after success",
    async (inactive) => {
      const submitted = { ...organization, inactive };
      axiosMock.onPost("/api/UCSBOrganization/post").reply(200, submitted);
      renderPage();
      fillForm(submitted);

      fireEvent.click(screen.getByRole("button", { name: "Create" }));

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith({ to: "/ucsborganization" });
      });
      expect(axiosMock.history.post).toHaveLength(1);
      expect(axiosMock.history.post[0].params).toEqual(submitted);
      expect(mockToast).toHaveBeenCalledWith(
        "New UCSBOrganization Created - orgCode: CHESS name: Chess Club",
      );
    },
  );

  test("storybook mode shows the success message and keeps the form visible", async () => {
    axiosMock.onPost("/api/UCSBOrganization/post").reply(200, organization);
    renderPage({ storybook: true });
    fillForm();

    fireEvent.click(screen.getByRole("button", { name: "Create" }));

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        "New UCSBOrganization Created - orgCode: CHESS name: Chess Club",
      );
    });
    expect(axiosMock.history.post).toHaveLength(1);
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(screen.getByLabelText("Organization Code")).toBeInTheDocument();
  });

  test("empty required fields display errors without submitting or redirecting", async () => {
    renderPage();

    fireEvent.click(screen.getByRole("button", { name: "Create" }));

    expect(
      await screen.findByText("Organization Code is required."),
    ).toBeInTheDocument();
    expect(screen.getByText("Name is required.")).toBeInTheDocument();
    expect(screen.getByText("Full Name is required.")).toBeInTheDocument();
    expect(axiosMock.history.post).toHaveLength(0);
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(mockToast).not.toHaveBeenCalled();
    expect(screen.getByLabelText("Organization Code")).toBeInTheDocument();
  });

  test("an overlong short name prevents submission", async () => {
    renderPage();
    fillForm({ ...organization, orgTranslationShort: "a".repeat(31) });

    fireEvent.click(screen.getByRole("button", { name: "Create" }));

    expect(
      await screen.findByText("Max length 30 characters"),
    ).toBeInTheDocument();
    expect(axiosMock.history.post).toHaveLength(0);
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  test("a backend error keeps the user on the form", async () => {
    axiosMock.onPost("/api/UCSBOrganization/post").reply(500);
    renderPage();
    fillForm();

    fireEvent.click(screen.getByRole("button", { name: "Create" }));

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.stringContaining("Request failed with status code 500"),
      );
    });
    expect(axiosMock.history.post).toHaveLength(1);
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(screen.getByLabelText("Organization Code")).toHaveValue("CHESS");
  });
});
