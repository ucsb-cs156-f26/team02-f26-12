import { fireEvent, render, waitFor, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";
import UCSBDatesEditPage from "main/pages/UCSBDates/UCSBDatesEditPage";

import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";

import mockConsole from "tests/testutils/mockConsole";
import { beforeEach, afterEach } from "vitest";

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
describe("UCSBDatesEditPage tests", () => {
  describe("when the backend doesn't return data", () => {
    beforeEach(() => {
      axiosMock = new AxiosMockAdapter(axios);
      axiosMock
        .onGet("/api/currentUser")
        .reply(200, apiCurrentUserFixtures.userOnly);
      axiosMock
        .onGet("/api/systemInfo")
        .reply(200, systemInfoFixtures.showingNeither);
      axiosMock.onGet("/api/ucsbdates", { params: { id: 17 } }).timeout();
    });

    afterEach(() => {
      mockToast.mockClear();
      mockNavigate.mockClear();
      axiosMock.restore();
      axiosMock.resetHistory();
    });

    const queryClient = new QueryClient();
    test("renders header but table is not present", async () => {
      const restoreConsole = mockConsole();

      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <UCSBDatesEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );

      await screen.findByText(/Welcome/);
      await screen.findByText("Edit UCSBDate");
      expect(
        screen.queryByTestId("UCSBDateForm-quarterYYYYQ"),
      ).not.toBeInTheDocument();
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
      axiosMock.onGet("/api/ucsbdates", { params: { id: 17 } }).reply(200, {
        id: 17,
        quarterYYYYQ: "20221",
        name: "Pi Day",
        localDateTime: "2022-03-14T15:00",
      });
      axiosMock.onPut("/api/ucsbdates").reply(200, {
        id: "17",
        quarterYYYYQ: "20224",
        name: "Christmas Morning",
        localDateTime: "2022-12-25T08:00",
      });
    });

    afterEach(() => {
      mockToast.mockClear();
      mockNavigate.mockClear();
      axiosMock.restore();
      axiosMock.resetHistory();
    });

    const queryClient = new QueryClient();
    test("renders without crashing", async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <UCSBDatesEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );
      await screen.findByText(/Welcome/);
      await screen.findByTestId("UCSBDateForm-quarterYYYYQ");
      expect(
        screen.getByTestId("UCSBDateForm-quarterYYYYQ"),
      ).toBeInTheDocument();
    });

    test("Is populated with the data provided", async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <UCSBDatesEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );

      await screen.findByTestId("UCSBDateForm-quarterYYYYQ");

      const idField = screen.getByTestId("UCSBDateForm-id");
      const quarterYYYYQField = screen.getByTestId("UCSBDateForm-quarterYYYYQ");
      const nameField = screen.getByTestId("UCSBDateForm-name");
      const localDateTimeField = screen.getByTestId(
        "UCSBDateForm-localDateTime",
      );
      const submitButton = screen.getByTestId("UCSBDateForm-submit");

      expect(idField).toHaveValue("17");
      expect(quarterYYYYQField).toHaveValue("20221");
      expect(nameField).toHaveValue("Pi Day");
      expect(localDateTimeField).toHaveValue("2022-03-14T15:00");
      expect(submitButton).toBeInTheDocument();
    });

    test("Changes when you click Update", async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <UCSBDatesEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );

      await screen.findByTestId("UCSBDateForm-quarterYYYYQ");

      const idField = screen.getByTestId("UCSBDateForm-id");
      const quarterYYYYQField = screen.getByTestId("UCSBDateForm-quarterYYYYQ");
      const nameField = screen.getByTestId("UCSBDateForm-name");
      const localDateTimeField = screen.getByTestId(
        "UCSBDateForm-localDateTime",
      );
      const submitButton = screen.getByTestId("UCSBDateForm-submit");

      expect(idField).toHaveValue("17");
      expect(quarterYYYYQField).toHaveValue("20221");
      expect(nameField).toHaveValue("Pi Day");
      expect(localDateTimeField).toHaveValue("2022-03-14T15:00");

      expect(submitButton).toBeInTheDocument();

      fireEvent.change(quarterYYYYQField, { target: { value: "20224" } });
      fireEvent.change(nameField, { target: { value: "Christmas Morning" } });
      fireEvent.change(localDateTimeField, {
        target: { value: "2022-12-25T08:00" },
      });

      fireEvent.click(submitButton);

      await waitFor(() => expect(mockToast).toBeCalled());
      expect(mockToast).toBeCalledWith(
        "UCSBDate Updated - id: 17 name: Christmas Morning",
      );
      expect(mockNavigate).toBeCalledWith({ to: "/ucsbdates" });

      expect(axiosMock.history.put.length).toBe(1); // times called
      expect(axiosMock.history.put[0].params).toEqual({ id: 17 });
      expect(axiosMock.history.put[0].data).toBe(
        JSON.stringify({
          quarterYYYYQ: "20224",
          name: "Christmas Morning",
          localDateTime: "2022-12-25T08:00",
        }),
      ); // posted object
    });
  });
});
