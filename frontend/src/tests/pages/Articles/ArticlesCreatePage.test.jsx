import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ArticlesCreatePage from "main/pages/Articles/ArticlesCreatePage";
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

describe("ArticlesCreatePage tests", () => {
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
          <ArticlesCreatePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("ArticlesForm-title")).toBeInTheDocument();
    });
  });

  test("on submit, makes request to backend, and redirects to /articles", async () => {
    const queryClient = new QueryClient();
    const article = {
      id: 7,
      title: "Intro to Vite",
      url: "https://vite.dev/guide",
      explanation: "Good overview of the build tool",
      email: "student@ucsb.edu",
      dateAdded: "2022-01-02T12:00",
    };

    axiosMock.onPost("/api/Articles/post").reply(202, article);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ArticlesCreatePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("ArticlesForm-title")).toBeInTheDocument();
    });

    fireEvent.change(screen.getByTestId("ArticlesForm-title"), {
      target: { value: "Intro to Vite" },
    });
    fireEvent.change(screen.getByTestId("ArticlesForm-url"), {
      target: { value: "https://vite.dev/guide" },
    });
    fireEvent.change(screen.getByTestId("ArticlesForm-explanation"), {
      target: { value: "Good overview of the build tool" },
    });
    fireEvent.change(screen.getByTestId("ArticlesForm-email"), {
      target: { value: "student@ucsb.edu" },
    });
    fireEvent.change(screen.getByTestId("ArticlesForm-dateAdded"), {
      target: { value: "2022-01-02T12:00" },
    });

    const createButton = screen.getByText("Create");
    expect(createButton).toBeInTheDocument();
    fireEvent.click(createButton);

    await waitFor(() => expect(axiosMock.history.post.length).toBe(1));

    expect(axiosMock.history.post[0].params).toEqual({
      title: "Intro to Vite",
      url: "https://vite.dev/guide",
      explanation: "Good overview of the build tool",
      email: "student@ucsb.edu",
      dateAdded: "2022-01-02T12:00",
    });

    expect(mockToast).toBeCalledWith(
      "New article Created - id: 7 title: Intro to Vite",
    );
    expect(mockNavigate).toBeCalledWith({ to: "/articles" });
  });
});
