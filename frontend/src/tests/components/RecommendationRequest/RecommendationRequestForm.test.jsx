import { render, waitFor, fireEvent, screen } from "@testing-library/react";
import RecommendationRequestForm from "main/components/RecommendationRequest/RecommendationRequestForm";
import { recommendationRequestFixtures } from "fixtures/recommendationRequestFixtures";
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

describe("RecommendationRequestForm tests", () => {
  test("renders correctly", async () => {
    render(
      <Router>
        <RecommendationRequestForm />
      </Router>,
    );
    await screen.findByText(/Requester Email/);
    await screen.findByText(/Create/);
    expect(screen.getByText(/Requester Email/)).toBeInTheDocument();
    expect(screen.getByText(/Professor Email/)).toBeInTheDocument();
    expect(screen.getByText(/Explanation/)).toBeInTheDocument();
    expect(screen.getByText(/Date Requested/)).toBeInTheDocument();
    expect(screen.getByText(/Date Needed/)).toBeInTheDocument();
    expect(screen.getByText(/Done/)).toBeInTheDocument();
  });

  test("renders correctly when passing in a RecommendationRequest", async () => {
    render(
      <Router>
        <RecommendationRequestForm
          initialContents={
            recommendationRequestFixtures.oneRecommendationRequest
          }
        />
      </Router>,
    );
    await screen.findByTestId(/RecommendationRequestForm-id/);
    expect(screen.getByText(/Id/)).toBeInTheDocument();
    expect(screen.getByTestId(/RecommendationRequestForm-id/)).toHaveValue("1");
  });

  test("Correct Error messsages on bad input", async () => {
    render(
      <Router>
        <RecommendationRequestForm />
      </Router>,
    );
    await screen.findByTestId("RecommendationRequestForm-requesterEmail");
    const requesterEmail = screen.getByTestId(
      "RecommendationRequestForm-requesterEmail",
    );
    const professorEmail = screen.getByTestId(
      "RecommendationRequestForm-professorEmail",
    );
    const dateRequested = screen.getByTestId(
      "RecommendationRequestForm-dateRequested",
    );
    const dateNeeded = screen.getByTestId(
      "RecommendationRequestForm-dateNeeded",
    );
    const done = screen.getByTestId("RecommendationRequestForm-done");
    const submitButton = screen.getByTestId("RecommendationRequestForm-submit");

    fireEvent.change(requesterEmail, { target: { value: "bad-input" } });
    fireEvent.change(professorEmail, { target: { value: "bad-input" } });
    fireEvent.change(dateRequested, { target: { value: "bad-input" } });
    fireEvent.change(dateNeeded, { target: { value: "bad-input" } });
    fireEvent.change(done, { target: { value: "bad-input" } });
    fireEvent.click(submitButton);

    await screen.findByText(
      /Done must be either "true" or "false" in all lowercase./,
    );
    expect(
      screen.getByText(
        /RequesterEmail must include a domain with only letters, numbers, and non-consecutive dots between them, e.g., "freddy.fazbear.87@ucsb.edu"./,
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /ProfessorEmail must include a domain with only letters, numbers, and non-consecutive dots between them, e.g., "freddy.fazbear.87@ucsb.edu"./,
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /Done must be either "true" or "false" in all lowercase./,
      ),
    ).toBeInTheDocument();
  });

  test("Correct Error messsages on long input", async () => {
    render(
      <Router>
        <RecommendationRequestForm />
      </Router>,
    );

    await screen.findByTestId("RecommendationRequestForm-requesterEmail");
    const requesterEmail = screen.getByTestId(
      "RecommendationRequestForm-requesterEmail",
    );
    const professorEmail = screen.getByTestId(
      "RecommendationRequestForm-professorEmail",
    );
    const explanation = screen.getByTestId(
      "RecommendationRequestForm-explanation",
    );
    const submitButton = screen.getByTestId("RecommendationRequestForm-submit");

    fireEvent.change(requesterEmail, { target: { value: "a".repeat(151) } });
    fireEvent.change(professorEmail, { target: { value: "a".repeat(151) } });
    fireEvent.change(explanation, { target: { value: "a".repeat(151) } });
    fireEvent.click(submitButton);

    await screen.findByText(/Max RequesterEmail length is 100 characters./);
    expect(
      screen.getByText(/Max ProfessorEmail length is 100 characters./),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Max Explanation length is 100 characters./),
    ).toBeInTheDocument();
  });

  test("Correct Error messsages on missing input", async () => {
    render(
      <Router>
        <RecommendationRequestForm />
      </Router>,
    );

    await screen.findByTestId("RecommendationRequestForm-submit");
    const submitButton = screen.getByTestId("RecommendationRequestForm-submit");

    fireEvent.click(submitButton);

    await screen.findByText(/RequesterEmail is required./);
    expect(screen.getByText(/ProfessorEmail is required./)).toBeInTheDocument();
    expect(screen.getByText(/Explanation is required./)).toBeInTheDocument();
    expect(screen.getByText(/DateRequested is required./)).toBeInTheDocument();
    expect(screen.getByText(/DateNeeded is required./)).toBeInTheDocument();
    expect(screen.getByText(/Done is required./)).toBeInTheDocument();
  });

  test("No Error messsages on good input", async () => {
    const mockSubmitAction = vi.fn();

    render(
      <Router>
        <RecommendationRequestForm submitAction={mockSubmitAction} />
      </Router>,
    );
    await screen.findByTestId("RecommendationRequestForm-requesterEmail");

    const requesterEmailField = screen.getByTestId(
      "RecommendationRequestForm-requesterEmail",
    );
    const professorEmailField = screen.getByTestId(
      "RecommendationRequestForm-professorEmail",
    );
    const explanationField = screen.getByTestId(
      "RecommendationRequestForm-explanation",
    );
    const dateRequestedField = screen.getByTestId(
      "RecommendationRequestForm-dateRequested",
    );
    const dateNeededField = screen.getByTestId(
      "RecommendationRequestForm-dateNeeded",
    );
    const doneField = screen.getByTestId("RecommendationRequestForm-done");
    const submitButton = screen.getByTestId("RecommendationRequestForm-submit");

    fireEvent.change(requesterEmailField, {
      target: { value: "alberteinstein@ucsb.edu" },
    });
    fireEvent.change(professorEmailField, {
      target: { value: "isaacnewton@ucsb.edu" },
    });
    fireEvent.change(explanationField, {
      target: { value: "PhD for Physics at UCSB" },
    });
    fireEvent.change(dateRequestedField, {
      target: { value: "2026-01-02T12:30" },
    });
    fireEvent.change(dateNeededField, {
      target: { value: "2026-10-02T12:30" },
    });
    fireEvent.change(doneField, { target: { value: "true" } });
    fireEvent.click(submitButton);

    await waitFor(() => expect(mockSubmitAction).toHaveBeenCalled());

    expect(
      screen.queryByText(/RequesterEmail is required./),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(/ProfessorEmail is required./),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(/Explanation is required./),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(
        /RequesterEmail must include a domain with only letters, numbers, and non-consecutive dots between them, e.g., "freddy.fazbear.87@ucsb.edu"./,
      ),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(
        /ProfessorEmail must include a domain with only letters, numbers, and non-consecutive dots between them, e.g., "freddy.fazbear.87@ucsb.edu"./,
      ),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(/Max RequesterEmail length is 100 characters./),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(/Max ProfessorEmail length is 100 characters./),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(/Max Explanation length is 100 characters./),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(/DateRequested is required./),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(/DateRequested must be in ISO format./),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(/DateNeeded is required./),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(/DateNeeded must be in ISO format./),
    ).not.toBeInTheDocument();
    expect(screen.queryByText(/Done is required./)).not.toBeInTheDocument();
    expect(
      screen.queryByText(
        /Done must be either "true" or "false" in all lowercase./,
      ),
    ).not.toBeInTheDocument();
  });

  test("that navigate(-1) is called when Cancel is clicked", async () => {
    render(
      <Router>
        <RecommendationRequestForm />
      </Router>,
    );
    await screen.findByTestId("RecommendationRequestForm-cancel");
    const cancelButton = screen.getByTestId("RecommendationRequestForm-cancel");

    fireEvent.click(cancelButton);

    await waitFor(() => expect(mockedNavigate).toHaveBeenCalledWith(-1));
  });
});
