import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import MenuItemReviewForm from "main/components/MenuItemReview/MenuItemReviewForm";
import { menuItemReviewFixtures } from "fixtures/menuItemReviewFixtures";

const mockedNavigate = vi.fn();

vi.mock("react-router", async () => {
  const originalModule = await vi.importActual("react-router");
  return {
    ...originalModule,
    useNavigate: () => mockedNavigate,
  };
});

describe("MenuItemReviewForm tests", () => {
  const queryClient = new QueryClient();
  const testId = "MenuItemReviewForm";

  const expectedHeaders = [
    "Menu Item ID",
    "Reviewer Email",
    "Stars",
    "Date Reviewed",
    "Comments",
  ];

  const renderForm = (props = {}) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <MenuItemReviewForm {...props} />
        </Router>
      </QueryClientProvider>,
    );
  };

  test("renders correctly with no initialContents", async () => {
    renderForm();

    expect(screen.getByText("Create")).toBeInTheDocument();

    expectedHeaders.forEach((headerText) => {
      expect(screen.getByText(headerText)).toBeInTheDocument();
    });

    expect(screen.queryByTestId(`${testId}-id`)).not.toBeInTheDocument();
  });

  test("renders correctly with initialContents", async () => {
    const review = menuItemReviewFixtures.oneMenuItemReview[0];

    renderForm({
      initialContents: review,
      buttonLabel: "Update",
    });

    expect(screen.getByText("Update")).toBeInTheDocument();

    expectedHeaders.forEach((headerText) => {
      expect(screen.getByText(headerText)).toBeInTheDocument();
    });

    const idInput = screen.getByTestId(`${testId}-id`);

    expect(idInput).toBeInTheDocument();
    expect(idInput).toHaveValue(String(review.id));
    expect(idInput).toHaveAttribute("readonly");

    expect(screen.getByTestId(`${testId}-itemId`)).toHaveValue(review.itemId);
    expect(screen.getByTestId(`${testId}-reviewerEmail`)).toHaveValue(
      review.reviewerEmail,
    );
    expect(screen.getByTestId(`${testId}-stars`)).toHaveValue(review.stars);
    expect(screen.getByTestId(`${testId}-comments`)).toHaveValue(
      review.comments,
    );
  });

  test("navigates back when Cancel is clicked", async () => {
    mockedNavigate.mockClear();
    renderForm();

    fireEvent.click(screen.getByTestId(`${testId}-cancel`));

    await waitFor(() => {
      expect(mockedNavigate).toHaveBeenCalledWith(-1);
    });
  });

  test("displays required field validation errors", async () => {
    renderForm();

    fireEvent.click(screen.getByTestId(`${testId}-submit`));

    expect(
      await screen.findByText("Menu Item ID is required."),
    ).toBeInTheDocument();

    expect(screen.getByText("Reviewer Email is required.")).toBeInTheDocument();
    expect(screen.getByText("Stars is required.")).toBeInTheDocument();
    expect(screen.getByText("Date Reviewed is required.")).toBeInTheDocument();
    expect(screen.getByText("Comments are required.")).toBeInTheDocument();
  });

  test("validates Menu Item ID is positive", async () => {
    renderForm();

    fireEvent.change(screen.getByTestId(`${testId}-itemId`), {
      target: { value: "-1" },
    });

    fireEvent.click(screen.getByTestId(`${testId}-submit`));

    expect(
      await screen.findByText("Menu Item ID must be positive."),
    ).toBeInTheDocument();
  });

  test("validates star rating range", async () => {
    renderForm();

    const starsInput = screen.getByTestId(`${testId}-stars`);

    fireEvent.change(starsInput, {
      target: { value: "6" },
    });

    fireEvent.click(screen.getByTestId(`${testId}-submit`));

    expect(
      await screen.findByText("Stars cannot exceed 5."),
    ).toBeInTheDocument();
  });

  test("validates stars must be a whole number", async () => {
    renderForm();

    const starsInput = screen.getByTestId(`${testId}-stars`);

    fireEvent.change(starsInput, {
      target: { value: "3.5" },
    });

    fireEvent.click(screen.getByTestId(`${testId}-submit`));

    expect(
      await screen.findByText("Stars must be a whole number."),
    ).toBeInTheDocument();
  });

  test("rejects an invalid email address", async () => {
    renderForm();

    fireEvent.change(screen.getByTestId(`${testId}-reviewerEmail`), {
      target: { value: "not-an-email" },
    });

    fireEvent.click(screen.getByTestId(`${testId}-submit`));

    expect(
      await screen.findByText("Enter a valid email address."),
    ).toBeInTheDocument();
  });

  test("rejects email addresses with extra text", async () => {
    renderForm();

    fireEvent.change(screen.getByTestId(`${testId}-reviewerEmail`), {
      target: { value: "student@ucsb.edu.extra@" },
    });

    fireEvent.click(screen.getByTestId(`${testId}-submit`));

    expect(
      await screen.findByText("Enter a valid email address."),
    ).toBeInTheDocument();
  });

  test("rejects email addresses with invalid prefixes", async () => {
    renderForm();

    fireEvent.change(screen.getByTestId(`${testId}-reviewerEmail`), {
      target: { value: "@@student@ucsb.edu" },
    });

    fireEvent.click(screen.getByTestId(`${testId}-submit`));

    expect(
      await screen.findByText("Enter a valid email address."),
    ).toBeInTheDocument();
  });

  test("rejects negative star ratings", async () => {
    renderForm();

    fireEvent.change(screen.getByTestId(`${testId}-stars`), {
      target: { value: "-1" },
    });

    fireEvent.click(screen.getByTestId(`${testId}-submit`));

    expect(
      await screen.findByText("Stars must be at least 0."),
    ).toBeInTheDocument();
  });

  test("validates comments are not blank", async () => {
    renderForm();

    fireEvent.change(screen.getByTestId(`${testId}-comments`), {
      target: { value: "   " },
    });

    fireEvent.click(screen.getByTestId(`${testId}-submit`));

    expect(
      await screen.findByText("Comments cannot be blank."),
    ).toBeInTheDocument();
  });

  test("submits valid form data", async () => {
    const submitAction = vi.fn();

    renderForm({ submitAction });

    fireEvent.change(screen.getByTestId(`${testId}-itemId`), {
      target: { value: "27" },
    });

    fireEvent.change(screen.getByTestId(`${testId}-reviewerEmail`), {
      target: { value: "student@ucsb.edu" },
    });

    fireEvent.change(screen.getByTestId(`${testId}-stars`), {
      target: { value: "5" },
    });

    fireEvent.change(screen.getByTestId(`${testId}-dateReviewed`), {
      target: { value: "2026-10-27T10:00" },
    });

    fireEvent.change(screen.getByTestId(`${testId}-comments`), {
      target: { value: "Great food!" },
    });

    fireEvent.click(screen.getByTestId(`${testId}-submit`));

    await waitFor(() => {
      expect(submitAction).toHaveBeenCalledWith(
        expect.objectContaining({
          itemId: 27,
          reviewerEmail: "student@ucsb.edu",
          stars: 5,
          dateReviewed: "2026-10-27T10:00",
          comments: "Great food!",
        }),
        expect.anything(),
      );
    });
  });
});
