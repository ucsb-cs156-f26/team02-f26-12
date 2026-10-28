import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router";

import HelpRequestForm from "main/components/HelpRequest/HelpRequestForm";
import { helpRequestFixtures } from "fixtures/helpRequestFixtures";

const mockedNavigate = vi.fn();

vi.mock("react-router", async () => {
  const originalModule = await vi.importActual("react-router");

  return {
    ...originalModule,
    useNavigate: () => mockedNavigate,
  };
});

describe("HelpRequestForm tests", () => {
  const testId = "HelpRequestForm";

  test("renders correctly with no initialContents", () => {
    render(
      <Router>
        <HelpRequestForm />
      </Router>,
    );

    expect(screen.getByText("Requester Email")).toBeInTheDocument();
    expect(screen.getByText("Team ID")).toBeInTheDocument();
    expect(screen.getByText("Table or Breakout Room")).toBeInTheDocument();
    expect(screen.getByText("Request Time")).toBeInTheDocument();
    expect(screen.getByText("Explanation")).toBeInTheDocument();
    expect(screen.getByText("Solved")).toBeInTheDocument();
    expect(screen.getByText("Create")).toBeInTheDocument();
  });

  test("renders correctly with initialContents", () => {
    render(
      <Router>
        <HelpRequestForm
          initialContents={helpRequestFixtures.oneHelpRequest[0]}
        />
      </Router>,
    );

    expect(screen.getByTestId(`${testId}-id`)).toBeInTheDocument();
    expect(screen.getByText("Id")).toBeInTheDocument();
  });

  test("navigate(-1) is called when Cancel is clicked", () => {
    render(
      <Router>
        <HelpRequestForm />
      </Router>,
    );

    fireEvent.click(screen.getByTestId(`${testId}-cancel`));

    expect(mockedNavigate).toHaveBeenCalledWith(-1);
  });

  test("required validations are performed", async () => {
    render(
      <Router>
        <HelpRequestForm />
      </Router>,
    );

    fireEvent.click(screen.getByText("Create"));

    expect(
      await screen.findByText("Requester email is required."),
    ).toBeInTheDocument();
    expect(screen.getByText("Team ID is required.")).toBeInTheDocument();
    expect(
      screen.getByText("Table or breakout room is required."),
    ).toBeInTheDocument();
    expect(screen.getByText("Request time is required.")).toBeInTheDocument();
    expect(screen.getByText("Explanation is required.")).toBeInTheDocument();
  });

  test("email validation is performed", async () => {
    render(
      <Router>
        <HelpRequestForm />
      </Router>,
    );

    fireEvent.change(screen.getByTestId(`${testId}-requesterEmail`), {
      target: { value: "a@b" },
    });
    fireEvent.click(screen.getByText("Create"));

    await waitFor(() => {
      expect(
        screen.getByText("Requester email must be a valid email address."),
      ).toBeInTheDocument();
    });
  });
});