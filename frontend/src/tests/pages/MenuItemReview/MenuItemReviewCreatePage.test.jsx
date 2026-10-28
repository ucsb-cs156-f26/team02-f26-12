import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import MenuItemReviewCreatePage from "main/pages/MenuItemReview/MenuItemReviewCreatePage";
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

describe("MenuItemReviewCreatePage tests", () => {
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
          <MenuItemReviewCreatePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByLabelText("Menu Item ID")).toBeInTheDocument();
    });
    expect(screen.getByText("Create New MenuItemReview")).toBeInTheDocument();
  });

  test("on submit, makes request to backend, and redirects to /menuitemreview", async () => {
    const queryClient = new QueryClient();
    const menuItemReview = {
      id: 5,
      itemId: 27,
      reviewerEmail: "student@ucsb.edu",
      stars: 4,
      dateReviewed: "2022-04-20T12:00:00",
      comments: "Tasty",
    };

    axiosMock.onPost("/api/menuitemreview/post").reply(202, menuItemReview);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <MenuItemReviewCreatePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByLabelText("Menu Item ID")).toBeInTheDocument();
    });

    const itemIdInput = screen.getByLabelText("Menu Item ID");
    const reviewerEmailInput = screen.getByLabelText("Reviewer Email");
    const starsInput = screen.getByLabelText("Stars");
    const dateReviewedInput = screen.getByLabelText("Date Reviewed");
    const commentsInput = screen.getByLabelText("Comments");
    const createButton = screen.getByText("Create");

    fireEvent.change(itemIdInput, { target: { value: "27" } });
    fireEvent.change(reviewerEmailInput, {
      target: { value: "student@ucsb.edu" },
    });
    fireEvent.change(starsInput, { target: { value: "4" } });
    fireEvent.change(dateReviewedInput, {
      target: { value: "2022-04-20T12:00" },
    });
    fireEvent.change(commentsInput, { target: { value: "Tasty" } });
    fireEvent.click(createButton);

    await waitFor(() => expect(axiosMock.history.post.length).toBe(1));

    expect(axiosMock.history.post[0].params).toEqual({
      itemId: 27,
      reviewerEmail: "student@ucsb.edu",
      stars: 4,
      dateReviewed: "2022-04-20T12:00",
      comments: "Tasty",
    });

    // assert - check that the toast was called with the expected message
    expect(mockToast).toBeCalledWith(
      "New menuItemReview Created - id: 5 itemId: 27",
    );
    expect(mockNavigate).toBeCalledWith({ to: "/menuitemreview" });
  });

  test("with invalid data, shows errors and does not send anything to the backend", async () => {
    axiosMock.onPost("/api/menuitemreview/post").reply(202, {});

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <MenuItemReviewCreatePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByLabelText("Menu Item ID")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Create"));

    expect(
      await screen.findByText("Menu Item ID is required."),
    ).toBeInTheDocument();
    expect(screen.getByText("Reviewer Email is required.")).toBeInTheDocument();
    expect(screen.getByText("Stars is required.")).toBeInTheDocument();
    expect(screen.getByText("Date Reviewed is required.")).toBeInTheDocument();
    expect(screen.getByText("Comments are required.")).toBeInTheDocument();

    expect(axiosMock.history.post.length).toBe(0);
    expect(mockNavigate).not.toBeCalled();
  });
});
