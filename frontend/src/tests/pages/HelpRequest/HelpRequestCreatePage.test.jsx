import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import HelpRequestCreatePage from "main/pages/HelpRequest/HelpRequestCreatePage";
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

describe("HelpRequestCreatePage tests", () => {
  const axiosMock = new AxiosMockAdapter(axios);

  beforeEach(() => {
    vi.clearAllMocks();
    axiosMock.reset();
    axiosMock.resetHistory();
    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.userOnly);
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);
  });

  const queryClient = new QueryClient();

  test("renders without crashing", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <HelpRequestCreatePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByLabelText("Requester Email")).toBeInTheDocument();
    });
    expect(screen.getByText("Create New HelpRequest")).toBeInTheDocument();
  });

  test("on submit, makes request to backend, and redirects to /helprequests", async () => {
    const queryClient = new QueryClient();
    const helpRequest = {
      id: 1,
      requesterEmail: "cgaucho@ucsb.edu",
      teamId: "f26-12",
      tableOrBreakoutRoom: "7",
      requestTime: "2026-10-28T14:00:00",
      explanation: "Help with Dokku",
      solved: true,
    };

    axiosMock.onPost("/api/helprequests/post").reply(202, helpRequest);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <HelpRequestCreatePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByLabelText("Requester Email")).toBeInTheDocument();
    });

    const requesterEmailInput = screen.getByLabelText("Requester Email");
    const teamIdInput = screen.getByLabelText("Team ID");
    const tableOrBreakoutRoomInput = screen.getByLabelText(
      "Table or Breakout Room",
    );
    const requestTimeInput = screen.getByLabelText("Request Time");
    const explanationInput = screen.getByLabelText("Explanation");
    const solvedInput = screen.getByLabelText("Solved");
    const createButton = screen.getByText("Create");

    fireEvent.change(requesterEmailInput, {
      target: { value: "cgaucho@ucsb.edu" },
    });
    fireEvent.change(teamIdInput, { target: { value: "f26-12" } });
    fireEvent.change(tableOrBreakoutRoomInput, { target: { value: "7" } });
    fireEvent.change(requestTimeInput, {
      target: { value: "2026-10-28T14:00" },
    });
    fireEvent.change(explanationInput, {
      target: { value: "Help with Dokku" },
    });
    fireEvent.click(solvedInput);
    fireEvent.click(createButton);

    await waitFor(() => expect(axiosMock.history.post.length).toBe(1));

    expect(axiosMock.history.post[0].params).toEqual({
      requesterEmail: "cgaucho@ucsb.edu",
      teamId: "f26-12",
      tableOrBreakoutRoom: "7",
      requestTime: "2026-10-28T14:00",
      explanation: "Help with Dokku",
      solved: true,
    });

    // assert - check that the toast was called with the expected message
    expect(mockToast).toBeCalledWith(
      "New helpRequest Created - id: 1 requesterEmail: cgaucho@ucsb.edu",
    );
    expect(mockNavigate).toBeCalledWith({ to: "/helprequests" });
  });

  test("with invalid data, shows errors and does not send anything to the backend", async () => {
    axiosMock.onPost("/api/helprequests/post").reply(202, {});

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <HelpRequestCreatePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByLabelText("Requester Email")).toBeInTheDocument();
    });

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

    expect(axiosMock.history.post.length).toBe(0);
    expect(mockNavigate).not.toBeCalled();
  });
});
