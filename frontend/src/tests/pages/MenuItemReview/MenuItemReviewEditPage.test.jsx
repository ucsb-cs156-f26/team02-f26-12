import { fireEvent, render, waitFor, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";
import MenuItemReviewEditPage from "main/pages/MenuItemReview/MenuItemReviewEditPage";

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
describe("MenuItemReviewEditPage tests", () => {
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
      axiosMock.onGet("/api/menuitemreview", { params: { id: 17 } }).timeout();
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
            <MenuItemReviewEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );
      await screen.findByText("Edit MenuItemReview");
      expect(
        screen.queryByTestId("MenuItemReviewForm-itemId"),
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
      axiosMock
        .onGet("/api/menuitemreview", { params: { id: 17 } })
        .reply(200, {
          id: 17,
          itemId: 27,
          reviewerEmail: "cgaucho@ucsb.edu",
          stars: 3,
          dateReviewed: "2022-04-20T12:00:00",
          comments: "The food was okay.",
        });
      axiosMock.onPut("/api/menuitemreview").reply(200, {
        id: 17,
        itemId: 28,
        reviewerEmail: "ldelplaya@ucsb.edu",
        stars: 5,
        dateReviewed: "2023-05-21T08:30",
        comments: "Much better now.",
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
            <MenuItemReviewEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );

      await screen.findByTestId("MenuItemReviewForm-id");

      expect(screen.getByTestId("MenuItemReviewForm-id")).toHaveValue("17");
      expect(screen.getByTestId("MenuItemReviewForm-itemId")).toHaveValue(27);
      expect(
        screen.getByTestId("MenuItemReviewForm-reviewerEmail"),
      ).toHaveValue("cgaucho@ucsb.edu");
      expect(screen.getByTestId("MenuItemReviewForm-stars")).toHaveValue(3);
      expect(screen.getByTestId("MenuItemReviewForm-comments")).toHaveValue(
        "The food was okay.",
      );
      expect(screen.getByTestId("MenuItemReviewForm-submit")).toHaveTextContent(
        "Update",
      );
    });

    test("Changes are sent to the backend when you click Update", async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <MenuItemReviewEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );

      await screen.findByTestId("MenuItemReviewForm-id");

      fireEvent.change(screen.getByTestId("MenuItemReviewForm-itemId"), {
        target: { value: "28" },
      });
      fireEvent.change(screen.getByTestId("MenuItemReviewForm-reviewerEmail"), {
        target: { value: "ldelplaya@ucsb.edu" },
      });
      fireEvent.change(screen.getByTestId("MenuItemReviewForm-stars"), {
        target: { value: "5" },
      });
      fireEvent.change(screen.getByTestId("MenuItemReviewForm-dateReviewed"), {
        target: { value: "2023-05-21T08:30" },
      });
      fireEvent.change(screen.getByTestId("MenuItemReviewForm-comments"), {
        target: { value: "Much better now." },
      });

      fireEvent.click(screen.getByTestId("MenuItemReviewForm-submit"));

      await waitFor(() => expect(mockToast).toBeCalled());
      expect(mockToast).toBeCalledWith(
        "MenuItemReview Updated - id: 17 itemId: 28",
      );
      expect(mockNavigate).toBeCalledWith({ to: "/menuitemreview" });

      expect(axiosMock.history.put.length).toBe(1); // times called
      expect(axiosMock.history.put[0].params).toEqual({ id: 17 });
      expect(axiosMock.history.put[0].data).toBe(
        JSON.stringify({
          itemId: 28,
          reviewerEmail: "ldelplaya@ucsb.edu",
          stars: 5,
          dateReviewed: "2023-05-21T08:30",
          comments: "Much better now.",
        }),
      ); // sent object
    });

    test("Invalid data shows errors and is not sent to the backend", async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <MenuItemReviewEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );

      await screen.findByTestId("MenuItemReviewForm-id");

      fireEvent.change(screen.getByTestId("MenuItemReviewForm-comments"), {
        target: { value: "" },
      });
      fireEvent.click(screen.getByTestId("MenuItemReviewForm-submit"));

      expect(
        await screen.findByText("Comments are required."),
      ).toBeInTheDocument();
      expect(axiosMock.history.put.length).toBe(0);
      expect(mockToast).not.toBeCalled();
      expect(mockNavigate).not.toBeCalled();
    });
  });
});
