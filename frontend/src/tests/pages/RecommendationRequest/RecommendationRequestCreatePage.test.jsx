import { render, waitFor, fireEvent, screen } from "@testing-library/react";
import RecommendationRequestCreatePage from "main/pages/RecommendationRequest/RecommendationRequestCreatePage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";

import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
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

describe("RecommendationRequestCreatePage tests", () => {
  const axiosMock = new AxiosMockAdapter(axios);

  beforeEach(() => {
    axiosMock.reset();
    axiosMock.resetHistory();
    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.userOnly);
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);
  });

  test("renders without crashing", async () => {
    const queryClient = new QueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <RecommendationRequestCreatePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(
        screen.getByTestId("RecommendationRequestForm-requesterEmail"),
      ).toBeInTheDocument();
    });
  });

  test("when you fill in the form and hit submit, it makes a request to the backend", async () => {
    const queryClient = new QueryClient();
    const recommendationRequest = {
      requesterEmail: "freddy.fazbear.87@ucsb.edu",
      professorEmail: "johnvonneumann@ucsb.edu",
      explanation: "PhD for CS at Stanford",
      dateRequested: "2026-01-01T12:30",
      dateNeeded: "2026-10-01T12:30",
      done: "true",
    };

    axiosMock
      .onPost("/api/recommendationrequests/post")
      .reply(202, recommendationRequest);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <RecommendationRequestCreatePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(
        screen.getByTestId("RecommendationRequestForm-requesterEmail"),
      ).toBeInTheDocument();
    });

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
      target: { value: "freddy.fazbear.87@ucsb.edu" },
    });
    fireEvent.change(professorEmailField, {
      target: { value: "johnvonneumann@ucsb.edu" },
    });
    fireEvent.change(explanationField, {
      target: { value: "PhD for CS at Stanford" },
    });
    fireEvent.change(dateRequestedField, {
      target: { value: "2026-01-01T12:30" },
    });
    fireEvent.change(dateNeededField, {
      target: { value: "2026-10-01T12:30" },
    });
    fireEvent.change(doneField, { target: { value: "false" } });

    expect(submitButton).toBeInTheDocument();

    fireEvent.click(submitButton);

    await waitFor(() => expect(axiosMock.history.post.length).toBe(1));

    expect(axiosMock.history.post[0].params).toEqual({
      requesterEmail: "freddy.fazbear.87@ucsb.edu",
      professorEmail: "johnvonneumann@ucsb.edu",
      explanation: "PhD for CS at Stanford",
      dateRequested: "2026-01-01T12:30",
      dateNeeded: "2026-10-01T12:30",
      done: "false",
    });

    expect(mockToast).toBeCalledWith(
      `New RecommendationRequest Created - id: ${recommendationRequest.id} requesterEmail: ${recommendationRequest.requesterEmail} professorEmail: ${recommendationRequest.professorEmail} explanation: ${recommendationRequest.explanation} dateRequested: ${recommendationRequest.dateRequested} dateNeeded: ${recommendationRequest.dateNeeded} done: ${recommendationRequest.done}`,
    );
    expect(mockNavigate).toBeCalledWith({ to: "/recommendationrequest" });
  });
});
