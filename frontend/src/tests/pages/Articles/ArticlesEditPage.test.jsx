import { fireEvent, render, waitFor, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";
import ArticlesEditPage from "main/pages/Articles/ArticlesEditPage";

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
describe("ArticlesEditPage tests", () => {
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
      axiosMock.onGet("/api/Articles", { params: { id: 17 } }).timeout();
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
            <ArticlesEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );
      await screen.findByText("Edit Article");
      expect(
        screen.queryByTestId("ArticlesForm-title"),
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
      axiosMock.onGet("/api/Articles", { params: { id: 17 } }).reply(200, {
        id: 17,
        title: "Intro to Vite",
        url: "https://vite.dev/guide",
        explanation: "Good overview",
        email: "student@ucsb.edu",
        dateAdded: "2022-01-02T12:00:00",
      });
      axiosMock.onPut("/api/Articles").reply(200, {
        id: "17",
        title: "Updated Title",
        url: "https://vite.dev/new",
        explanation: "Updated explanation",
        email: "new@ucsb.edu",
        dateAdded: "2023-05-06T07:08",
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
            <ArticlesEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );

      await screen.findByTestId("ArticlesForm-id");

      expect(screen.getByTestId("ArticlesForm-id")).toHaveValue("17");
      expect(screen.getByTestId("ArticlesForm-title")).toHaveValue(
        "Intro to Vite",
      );
      expect(screen.getByTestId("ArticlesForm-url")).toHaveValue(
        "https://vite.dev/guide",
      );
      expect(screen.getByTestId("ArticlesForm-explanation")).toHaveValue(
        "Good overview",
      );
      expect(screen.getByTestId("ArticlesForm-email")).toHaveValue(
        "student@ucsb.edu",
      );
      expect(screen.getByTestId("ArticlesForm-dateAdded")).toHaveValue(
        "2022-01-02T12:00",
      );
      expect(screen.getByTestId("ArticlesForm-submit")).toHaveTextContent(
        "Update",
      );
    });

    test("Changes when you click Update", async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <ArticlesEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );

      await screen.findByTestId("ArticlesForm-id");

      fireEvent.change(screen.getByTestId("ArticlesForm-title"), {
        target: { value: "Updated Title" },
      });
      fireEvent.change(screen.getByTestId("ArticlesForm-url"), {
        target: { value: "https://vite.dev/new" },
      });
      fireEvent.change(screen.getByTestId("ArticlesForm-explanation"), {
        target: { value: "Updated explanation" },
      });
      fireEvent.change(screen.getByTestId("ArticlesForm-email"), {
        target: { value: "new@ucsb.edu" },
      });
      fireEvent.change(screen.getByTestId("ArticlesForm-dateAdded"), {
        target: { value: "2023-05-06T07:08" },
      });
      fireEvent.click(screen.getByTestId("ArticlesForm-submit"));

      await waitFor(() => expect(mockToast).toBeCalled());
      expect(mockToast).toBeCalledWith(
        "Article Updated - id: 17 title: Updated Title",
      );
      expect(mockNavigate).toBeCalledWith({ to: "/articles" });

      expect(axiosMock.history.put.length).toBe(1);
      expect(axiosMock.history.put[0].params).toEqual({ id: 17 });
      expect(axiosMock.history.put[0].data).toBe(
        JSON.stringify({
          title: "Updated Title",
          url: "https://vite.dev/new",
          explanation: "Updated explanation",
          email: "new@ucsb.edu",
          dateAdded: "2023-05-06T07:08",
        }),
      );
    });
  });
});
