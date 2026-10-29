import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router";

import { ucsbOrganizationFixtures } from "fixtures/ucsbOrganizationFixtures";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import UCSBOrganizationForm from "main/components/UCSBOrganization/UCSBOrganizationForm";
import { test } from "vitest";

const mockedNavigate = vi.fn();
vi.mock("react-router", async () => {
  const originalModule = await vi.importActual("react-router");
  return {
    ...originalModule,
    useNavigate: () => mockedNavigate,
  };
});

describe("UCSBOrganizationForm tests", () => {
  const queryClient = new QueryClient();

  const expectedHeaders = [
    "Organization Code",
    "Short Name",
    "Full Name",
    "Inactive?",
  ];
  const testId = "UCSBOrganizationForm";

  test("renders correctly with no initialContents", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <UCSBOrganizationForm />
        </Router>
      </QueryClientProvider>,
    );

    expect(await screen.findByText(/Create/)).toBeInTheDocument();

    expectedHeaders.forEach((headerText) => {
      const header = screen.getByText(headerText);
      expect(header).toBeInTheDocument();
    });
  });

  test("renders correctly when passing in initialContents", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <UCSBOrganizationForm
            initialContents={ucsbOrganizationFixtures.oneOrganization[0]}
          />
        </Router>
      </QueryClientProvider>,
    );

    expect(await screen.findByText(/Create/)).toBeInTheDocument();

    expectedHeaders.forEach((headerText) => {
      const header = screen.getByText(headerText);
      expect(header).toBeInTheDocument();
    });

    expect(screen.getByTestId(`${testId}-orgCode`)).toHaveValue("CHESS");
    expect(screen.getByTestId(`${testId}-orgCode`)).toHaveAttribute("readonly");
  });

  test("that navigate(-1) is called when Cancel is clicked", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <UCSBOrganizationForm />
        </Router>
      </QueryClientProvider>,
    );
    expect(await screen.findByTestId(`${testId}-cancel`)).toBeInTheDocument();
    const cancelButton = screen.getByTestId(`${testId}-cancel`);

    fireEvent.click(cancelButton);

    await waitFor(() => expect(mockedNavigate).toHaveBeenCalledWith(-1));
  });

  test("that the correct validations are performed", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <UCSBOrganizationForm />
        </Router>
      </QueryClientProvider>,
    );

    expect(await screen.findByText(/Create/)).toBeInTheDocument();
    const submitButton = screen.getByText(/Create/);
    fireEvent.click(submitButton);

    await screen.findByText("Name is required.");
    expect(screen.getByText("Full Name is required.")).toBeInTheDocument();

    const nameInput = screen.getByTestId(`${testId}-orgTranslationShort`);
    fireEvent.change(nameInput, { target: { value: "a".repeat(31) } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Max length 30 characters/)).toBeInTheDocument();
    });
  });

  test("an empty organization code displays a required-field error", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <UCSBOrganizationForm />
        </Router>
      </QueryClientProvider>,
    );

    const input = screen.getByTestId(
      "UCSBOrganizationForm-orgTranslationShort",
    );
    fireEvent.change(input, {
      target: { value: "Chess Club" },
    });

    const input2 = screen.getByTestId("UCSBOrganizationForm-orgTranslation");
    fireEvent.change(input2, {
      target: { value: "UCSB Chess Club" },
    });

    fireEvent.click(screen.getByTestId("UCSBOrganizationForm-submit"));

    expect(
      await screen.findByText("Organization Code is required."),
    ).toBeInTheDocument();
  });

  test("a valid form submits the correct organization data", async () => {
    const submitAction = vi.fn();
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <UCSBOrganizationForm submitAction={submitAction} />
        </Router>
      </QueryClientProvider>,
    );

    fireEvent.change(screen.getByTestId("UCSBOrganizationForm-orgCode"), {
      target: { value: "CHESS" },
    });

    fireEvent.change(
      screen.getByTestId("UCSBOrganizationForm-orgTranslationShort"),
      {
        target: { value: "Chess Club" },
      },
    );

    fireEvent.change(
      screen.getByTestId("UCSBOrganizationForm-orgTranslation"),
      {
        target: { value: "UCSB Chess Club" },
      },
    );

    fireEvent.click(screen.getByTestId(`${testId}-submit`));

    await waitFor(() => {
      expect(submitAction).toHaveBeenCalledTimes(1);
    });

    expect(submitAction.mock.calls[0][0]).toEqual({
      orgCode: "CHESS",
      orgTranslationShort: "Chess Club",
      orgTranslation: "UCSB Chess Club",
      inactive: false,
    });
  });

  test("submits inactive as true when checked", async () => {
    const submitAction = vi.fn();
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <UCSBOrganizationForm submitAction={submitAction} />
        </Router>
      </QueryClientProvider>,
    );

    fireEvent.change(screen.getByTestId("UCSBOrganizationForm-orgCode"), {
      target: { value: "CHESS" },
    });

    fireEvent.change(
      screen.getByTestId("UCSBOrganizationForm-orgTranslationShort"),
      {
        target: { value: "Chess Club" },
      },
    );

    fireEvent.change(
      screen.getByTestId("UCSBOrganizationForm-orgTranslation"),
      {
        target: { value: "UCSB Chess Club" },
      },
    );

    fireEvent.click(screen.getByTestId(`${testId}-inactive`));

    expect(screen.getByTestId(`${testId}-inactive`)).toBeChecked();

    fireEvent.click(screen.getByTestId(`${testId}-submit`));

    await waitFor(() => {
      expect(submitAction).toHaveBeenCalledTimes(1);
    });

    expect(submitAction.mock.calls[0][0]).toEqual({
      orgCode: "CHESS",
      orgTranslationShort: "Chess Club",
      orgTranslation: "UCSB Chess Club",
      inactive: true,
    });
  });
});
