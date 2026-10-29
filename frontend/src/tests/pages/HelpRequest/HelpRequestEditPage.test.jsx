import { fireEvent, render, waitFor, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";
import HelpRequestEditPage from "main/pages/HelpRequest/HelpRequestEditPage";

import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";
import mockConsole from "tests/testutils/mockConsole";

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
    useParams: vi.fn(() => ({
      id: 17,
    })),
    Navigate: vi.fn((x) => {
      mockNavigate(x);
      return null;
    }),
  };
});

let axiosMock;
describe("HelpRequestEditPage tests", () => {
  describe("when the backend doesn't return data", () => {
    beforeEach(() => {
      axiosMock = new AxiosMockAdapter(axios);
      axiosMock.reset();
      axiosMock.resetHistory();
      axiosMock
        .onGet("/api/currentUser")
        .reply(200, apiCurrentUserFixtures.userOnly);
      axiosMock
        .onGet("/api/systemInfo")
        .reply(200, systemInfoFixtures.showingNeither);
      axiosMock.onGet("/api/helprequests", { params: { id: 17 } }).timeout();
    });

    afterEach(() => {
      mockToast.mockClear();
      mockNavigate.mockClear();
      axiosMock.restore();
      axiosMock.resetHistory();
    });

    const queryClient = new QueryClient();
    test("renders header but form is not present", async () => {
      const restoreConsole = mockConsole();

      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <HelpRequestEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );
      await screen.findByText("Edit HelpRequest");
      expect(
        screen.queryByTestId("HelpRequestForm-requesterEmail"),
      ).not.toBeInTheDocument();
      expect(mockNavigate).not.toBeCalled();
      restoreConsole();
    });
  });

  describe("tests where backend is working normally", () => {
    beforeEach(() => {
      axiosMock = new AxiosMockAdapter(axios);
      axiosMock.reset();
      axiosMock.resetHistory();
      axiosMock
        .onGet("/api/currentUser")
        .reply(200, apiCurrentUserFixtures.userOnly);
      axiosMock
        .onGet("/api/systemInfo")
        .reply(200, systemInfoFixtures.showingNeither);
      axiosMock.onGet("/api/helprequests", { params: { id: 17 } }).reply(200, {
        id: 17,
        requesterEmail: "cgaucho@ucsb.edu",
        teamId: "f26-12",
        tableOrBreakoutRoom: "7",
        requestTime: "2026-10-28T14:00",
        explanation: "Help with backend",
        solved: false,
      });
      axiosMock.onPut("/api/helprequests").reply(200, {
        id: 17,
        requesterEmail: "ldelplaya@ucsb.edu",
        teamId: "f26-13",
        tableOrBreakoutRoom: "8",
        requestTime: "2026-10-28T15:00",
        explanation: "All good now",
        solved: true,
      });
    });

    afterEach(() => {
      mockToast.mockClear();
      mockNavigate.mockClear();
      axiosMock.restore();
      axiosMock.resetHistory();
    });

    const queryClient = new QueryClient();

    test("Is populated with the data provided", async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <HelpRequestEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );

      await screen.findByTestId("HelpRequestForm-id");

      expect(screen.getByTestId("HelpRequestForm-id")).toHaveValue("17");
      expect(screen.getByTestId("HelpRequestForm-requesterEmail")).toHaveValue(
        "cgaucho@ucsb.edu",
      );
      expect(screen.getByTestId("HelpRequestForm-teamId")).toHaveValue(
        "f26-12",
      );
      expect(
        screen.getByTestId("HelpRequestForm-tableOrBreakoutRoom"),
      ).toHaveValue("7");
      expect(screen.getByTestId("HelpRequestForm-requestTime")).toHaveValue(
        "2026-10-28T14:00",
      );
      expect(screen.getByTestId("HelpRequestForm-explanation")).toHaveValue(
        "Help with backend",
      );
      expect(screen.getByTestId("HelpRequestForm-solved")).not.toBeChecked();
      expect(screen.getByTestId("HelpRequestForm-submit")).toHaveTextContent(
        "Update",
      );
    });

    test("Changes are sent to the backend when you click Update", async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <HelpRequestEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );

      await screen.findByTestId("HelpRequestForm-id");

      fireEvent.change(screen.getByTestId("HelpRequestForm-requesterEmail"), {
        target: { value: "ldelplaya@ucsb.edu" },
      });
      fireEvent.change(screen.getByTestId("HelpRequestForm-teamId"), {
        target: { value: "f26-13" },
      });
      fireEvent.change(
        screen.getByTestId("HelpRequestForm-tableOrBreakoutRoom"),
        {
          target: { value: "8" },
        },
      );
      fireEvent.change(screen.getByTestId("HelpRequestForm-requestTime"), {
        target: { value: "2026-10-28T15:00" },
      });
      fireEvent.change(screen.getByTestId("HelpRequestForm-explanation"), {
        target: { value: "All good now" },
      });
      fireEvent.click(screen.getByTestId("HelpRequestForm-solved"));

      fireEvent.click(screen.getByTestId("HelpRequestForm-submit"));

      await waitFor(() => expect(mockToast).toBeCalled());
      expect(mockToast).toBeCalledWith(
        "HelpRequest Updated - id: 17 requesterEmail: ldelplaya@ucsb.edu",
      );
      expect(mockNavigate).toBeCalledWith({ to: "/helprequests" });

      expect(axiosMock.history.put.length).toBe(1); // times called
      expect(axiosMock.history.put[0].params).toEqual({ id: 17 });
      expect(axiosMock.history.put[0].data).toBe(
        JSON.stringify({
          requesterEmail: "ldelplaya@ucsb.edu",
          teamId: "f26-13",
          tableOrBreakoutRoom: "8",
          requestTime: "2026-10-28T15:00",
          explanation: "All good now",
          solved: true,
        }),
      ); // sent object
    });

    test("Invalid data shows errors and is not sent to the backend", async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <HelpRequestEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );

      await screen.findByTestId("HelpRequestForm-id");

      fireEvent.change(screen.getByTestId("HelpRequestForm-explanation"), {
        target: { value: "" },
      });
      fireEvent.click(screen.getByTestId("HelpRequestForm-submit"));

      expect(
        await screen.findByText("Explanation is required."),
      ).toBeInTheDocument();
      expect(axiosMock.history.put.length).toBe(0);
      expect(mockToast).not.toBeCalled();
      expect(mockNavigate).not.toBeCalled();
    });
  });
});
