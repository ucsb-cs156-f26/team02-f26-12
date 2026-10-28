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

  beforeEach(() => {
    mockedNavigate.mockClear();
  });

  test("renders correctly for creating a HelpRequest", () => {
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

    expect(screen.getByTestId(`${testId}-requesterEmail`)).toBeInTheDocument();
    expect(screen.getByTestId(`${testId}-teamId`)).toBeInTheDocument();
    expect(
      screen.getByTestId(`${testId}-tableOrBreakoutRoom`),
    ).toBeInTheDocument();
    expect(screen.getByTestId(`${testId}-requestTime`)).toBeInTheDocument();
    expect(screen.getByTestId(`${testId}-explanation`)).toBeInTheDocument();
    expect(screen.getByTestId(`${testId}-solved`)).toBeInTheDocument();
    expect(screen.getByTestId(`${testId}-submit`)).toBeInTheDocument();
    expect(screen.getByTestId(`${testId}-cancel`)).toBeInTheDocument();
    expect(screen.getByText("Create")).toBeInTheDocument();
  });

  test("renders initial contents for updating a HelpRequest", () => {
    const initialContents = helpRequestFixtures.oneHelpRequest[0];

    render(
      <Router>
        <HelpRequestForm
          initialContents={initialContents}
          buttonLabel="Update"
        />
      </Router>,
    );

    expect(screen.getByTestId(`${testId}-id`)).toHaveValue(
      String(initialContents.id),
    );
    expect(screen.getByTestId(`${testId}-id`)).toBeDisabled();
    expect(screen.getByTestId(`${testId}-requesterEmail`)).toHaveValue(
      initialContents.requesterEmail,
    );
    expect(screen.getByTestId(`${testId}-teamId`)).toHaveValue(
      initialContents.teamId,
    );
    expect(screen.getByTestId(`${testId}-tableOrBreakoutRoom`)).toHaveValue(
      initialContents.tableOrBreakoutRoom,
    );
    expect(screen.getByTestId(`${testId}-requestTime`)).toHaveValue(
      initialContents.requestTime.slice(0, 16),
    );
    expect(screen.getByTestId(`${testId}-explanation`)).toHaveValue(
      initialContents.explanation,
    );
    expect(screen.getByTestId(`${testId}-solved`)).not.toBeChecked();
    expect(screen.getByTestId(`${testId}-submit`)).toHaveTextContent("Update");
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

    fireEvent.click(screen.getByTestId(`${testId}-submit`));

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

  test("invalid email validation is performed", async () => {
    render(
      <Router>
        <HelpRequestForm />
      </Router>,
    );

    fireEvent.change(screen.getByTestId(`${testId}-requesterEmail`), {
      target: { value: "a@b" },
    });
    fireEvent.click(screen.getByTestId(`${testId}-submit`));

    expect(
      await screen.findByText("Requester email must be a valid email address."),
    ).toBeInTheDocument();
  });

  test("explanation maximum length validation is performed", async () => {
    render(
      <Router>
        <HelpRequestForm />
      </Router>,
    );

    fireEvent.change(screen.getByTestId(`${testId}-explanation`), {
      target: { value: "a".repeat(256) },
    });
    fireEvent.click(screen.getByTestId(`${testId}-submit`));

    expect(
      await screen.findByText("Explanation cannot exceed 255 characters."),
    ).toBeInTheDocument();
  });

  test("valid form data is submitted", async () => {
    const submitAction = vi.fn();

    render(
      <Router>
        <HelpRequestForm submitAction={submitAction} />
      </Router>,
    );

    fireEvent.change(screen.getByTestId(`${testId}-requesterEmail`), {
      target: { value: "student@example.com" },
    });
    fireEvent.change(screen.getByTestId(`${testId}-teamId`), {
      target: { value: "f26-12" },
    });
    fireEvent.change(screen.getByTestId(`${testId}-tableOrBreakoutRoom`), {
      target: { value: "1" },
    });
    fireEvent.change(screen.getByTestId(`${testId}-requestTime`), {
      target: { value: "2026-10-28T10:00" },
    });
    fireEvent.change(screen.getByTestId(`${testId}-explanation`), {
      target: { value: "Need help with the assignment." },
    });
    fireEvent.click(screen.getByTestId(`${testId}-solved`));
    fireEvent.click(screen.getByTestId(`${testId}-submit`));

    await waitFor(() => {
      expect(submitAction).toHaveBeenCalledWith(
        expect.objectContaining({
          requesterEmail: "student@example.com",
          teamId: "f26-12",
          tableOrBreakoutRoom: "1",
          requestTime: "2026-10-28T10:00",
          explanation: "Need help with the assignment.",
          solved: true,
        }),
        expect.anything(),
      );
    });
  });
});
