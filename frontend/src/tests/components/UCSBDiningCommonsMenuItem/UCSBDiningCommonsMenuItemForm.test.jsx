import { render, waitFor, fireEvent, screen } from "@testing-library/react";
import UCSBDiningCommonsMenuItemForm from "main/components/UCSBDiningCommonsMenuItem/UCSBDiningCommonsMenuItemForm";
import { ucsbDiningCommonsMenuItemFixtures } from "fixtures/ucsbDiningCommonsMenuItemFixtures";
import { BrowserRouter as Router } from "react-router";
import { expect } from "vitest";

const mockedNavigate = vi.fn();
vi.mock("react-router", async () => {
  const originalModule = await vi.importActual("react-router");
  return {
    ...originalModule,
    useNavigate: () => mockedNavigate,
  };
});

const sampleMenuItem = ucsbDiningCommonsMenuItemFixtures.oneMenuItem;

describe("UCSBDiningCommonsMenuItemForm tests", () => {
  test("renders correctly with no props", async () => {
    render(
      <Router>
        <UCSBDiningCommonsMenuItemForm />
      </Router>,
    );
    await screen.findByText(/Dining Commons Code/);
    expect(screen.getByText(/Name/)).toBeInTheDocument();
    expect(screen.getByText(/Station/)).toBeInTheDocument();
    expect(screen.getByText(/Create/)).toBeInTheDocument();
  });

  test("does not show the id field and starts empty when initialContents is undefined", async () => {
    render(
      <Router>
        <UCSBDiningCommonsMenuItemForm />
      </Router>,
    );
    await screen.findByTestId(
      "UCSBDiningCommonsMenuItemForm-diningCommonsCode",
    );

    expect(
      screen.queryByTestId("UCSBDiningCommonsMenuItemForm-id"),
    ).not.toBeInTheDocument();
    expect(
      screen.getByTestId("UCSBDiningCommonsMenuItemForm-diningCommonsCode"),
    ).toHaveValue("");
    expect(
      screen.getByTestId("UCSBDiningCommonsMenuItemForm-name"),
    ).toHaveValue("");
    expect(
      screen.getByTestId("UCSBDiningCommonsMenuItemForm-station"),
    ).toHaveValue("");
  });

  test("uses a custom buttonLabel when provided", async () => {
    render(
      <Router>
        <UCSBDiningCommonsMenuItemForm buttonLabel="Update" />
      </Router>,
    );
    await screen.findByText(/Update/);
    expect(
      screen.getByTestId("UCSBDiningCommonsMenuItemForm-submit"),
    ).toHaveTextContent("Update");
    expect(screen.queryByText(/Create/)).not.toBeInTheDocument();
  });

  test("renders correctly when passing in initialContents", async () => {
    render(
      <Router>
        <UCSBDiningCommonsMenuItemForm initialContents={sampleMenuItem} />
      </Router>,
    );
    await screen.findByTestId("UCSBDiningCommonsMenuItemForm-id");

    expect(screen.getByText("Id")).toBeInTheDocument();
    const idField = screen.getByTestId("UCSBDiningCommonsMenuItemForm-id");
    expect(idField).toHaveValue(String(sampleMenuItem.id));
    expect(idField).toBeDisabled();

    expect(
      screen.getByTestId("UCSBDiningCommonsMenuItemForm-diningCommonsCode"),
    ).toHaveValue(sampleMenuItem.diningCommonsCode);
    expect(
      screen.getByTestId("UCSBDiningCommonsMenuItemForm-name"),
    ).toHaveValue(sampleMenuItem.name);
    expect(
      screen.getByTestId("UCSBDiningCommonsMenuItemForm-station"),
    ).toHaveValue(sampleMenuItem.station);
  });

  test("Correct error messages on missing input", async () => {
    render(
      <Router>
        <UCSBDiningCommonsMenuItemForm />
      </Router>,
    );
    await screen.findByTestId("UCSBDiningCommonsMenuItemForm-submit");

    fireEvent.click(screen.getByTestId("UCSBDiningCommonsMenuItemForm-submit"));

    await screen.findByText(/Dining Commons Code is required./);
    expect(screen.getByText(/Name is required./)).toBeInTheDocument();
    expect(screen.getByText(/Station is required./)).toBeInTheDocument();
  });

  test("Correct error messages on whitespace-only input", async () => {
    render(
      <Router>
        <UCSBDiningCommonsMenuItemForm />
      </Router>,
    );
    await screen.findByTestId(
      "UCSBDiningCommonsMenuItemForm-diningCommonsCode",
    );

    fireEvent.change(
      screen.getByTestId("UCSBDiningCommonsMenuItemForm-diningCommonsCode"),
      { target: { value: "   " } },
    );
    fireEvent.change(screen.getByTestId("UCSBDiningCommonsMenuItemForm-name"), {
      target: { value: "   " },
    });
    fireEvent.change(
      screen.getByTestId("UCSBDiningCommonsMenuItemForm-station"),
      { target: { value: "   " } },
    );
    fireEvent.click(screen.getByTestId("UCSBDiningCommonsMenuItemForm-submit"));

    await screen.findByText(/Dining Commons Code cannot be blank./);
    expect(screen.getByText(/Name cannot be blank./)).toBeInTheDocument();
    expect(screen.getByText(/Station cannot be blank./)).toBeInTheDocument();
  });

  test("Correct error messages on input that is too long", async () => {
    render(
      <Router>
        <UCSBDiningCommonsMenuItemForm />
      </Router>,
    );
    await screen.findByTestId(
      "UCSBDiningCommonsMenuItemForm-diningCommonsCode",
    );

    fireEvent.change(
      screen.getByTestId("UCSBDiningCommonsMenuItemForm-diningCommonsCode"),
      { target: { value: "a".repeat(31) } },
    );
    fireEvent.change(screen.getByTestId("UCSBDiningCommonsMenuItemForm-name"), {
      target: { value: "a".repeat(256) },
    });
    fireEvent.change(
      screen.getByTestId("UCSBDiningCommonsMenuItemForm-station"),
      { target: { value: "a".repeat(101) } },
    );
    fireEvent.click(screen.getByTestId("UCSBDiningCommonsMenuItemForm-submit"));

    await screen.findByText(
      /Dining Commons Code must be at most 30 characters./,
    );
    expect(
      screen.getByText(/Name must be at most 255 characters./),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Station must be at most 100 characters./),
    ).toBeInTheDocument();
  });

  test("No error messages on good input", async () => {
    const mockSubmitAction = vi.fn();

    render(
      <Router>
        <UCSBDiningCommonsMenuItemForm submitAction={mockSubmitAction} />
      </Router>,
    );
    await screen.findByTestId(
      "UCSBDiningCommonsMenuItemForm-diningCommonsCode",
    );

    fireEvent.change(
      screen.getByTestId("UCSBDiningCommonsMenuItemForm-diningCommonsCode"),
      { target: { value: "ortega" } },
    );
    fireEvent.change(screen.getByTestId("UCSBDiningCommonsMenuItemForm-name"), {
      target: { value: "Chicken Caesar Salad" },
    });
    fireEvent.change(
      screen.getByTestId("UCSBDiningCommonsMenuItemForm-station"),
      { target: { value: "Entrees" } },
    );
    fireEvent.click(screen.getByTestId("UCSBDiningCommonsMenuItemForm-submit"));

    await waitFor(() => expect(mockSubmitAction).toHaveBeenCalled());

    expect(mockSubmitAction.mock.calls[0][0]).toEqual({
      diningCommonsCode: "ortega",
      name: "Chicken Caesar Salad",
      station: "Entrees",
    });

    expect(screen.queryByText(/is required./)).not.toBeInTheDocument();
    expect(screen.queryByText(/cannot be blank./)).not.toBeInTheDocument();
    expect(screen.queryByText(/must be at most/)).not.toBeInTheDocument();
  });

  test("that navigate(-1) is called when Cancel is clicked", async () => {
    render(
      <Router>
        <UCSBDiningCommonsMenuItemForm />
      </Router>,
    );
    await screen.findByTestId("UCSBDiningCommonsMenuItemForm-cancel");

    fireEvent.click(screen.getByTestId("UCSBDiningCommonsMenuItemForm-cancel"));

    await waitFor(() => expect(mockedNavigate).toHaveBeenCalledWith(-1));
  });
});
