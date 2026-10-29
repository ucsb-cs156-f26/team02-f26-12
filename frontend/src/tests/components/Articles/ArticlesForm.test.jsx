import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router";

import ArticlesForm from "main/components/Articles/ArticlesForm";
import { articlesFixtures } from "fixtures/articlesFixtures";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const mockedNavigate = vi.fn();
vi.mock("react-router", async () => {
  const originalModule = await vi.importActual("react-router");
  return {
    ...originalModule,
    useNavigate: () => mockedNavigate,
  };
});

describe("ArticlesForm tests", () => {
  const queryClient = new QueryClient();

  const expectedHeaders = [
    "Title",
    "URL",
    "Explanation",
    "Email",
    "Date Added",
  ];
  const testId = "ArticlesForm";

  test("renders correctly with no initialContents", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <ArticlesForm />
        </Router>
      </QueryClientProvider>,
    );

    expect(await screen.findByText(/Create/)).toBeInTheDocument();

    expectedHeaders.forEach((headerText) => {
      const header = screen.getByText(headerText);
      expect(header).toBeInTheDocument();
    });

    expect(screen.queryByTestId(`${testId}-id`)).not.toBeInTheDocument();
  });

  test("renders correctly when passing in initialContents", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <ArticlesForm initialContents={articlesFixtures.oneArticle[0]} />
        </Router>
      </QueryClientProvider>,
    );

    expect(await screen.findByText(/Create/)).toBeInTheDocument();

    expectedHeaders.forEach((headerText) => {
      const header = screen.getByText(headerText);
      expect(header).toBeInTheDocument();
    });

    expect(await screen.findByTestId(`${testId}-id`)).toBeInTheDocument();
    expect(screen.getByText(`Id`)).toBeInTheDocument();
    expect(screen.getByTestId(`${testId}-id`)).toHaveValue("1");
    expect(screen.getByTestId(`${testId}-title`)).toHaveValue(
      articlesFixtures.oneArticle[0].title,
    );
    expect(screen.getByTestId(`${testId}-url`)).toHaveValue(
      articlesFixtures.oneArticle[0].url,
    );
    expect(screen.getByTestId(`${testId}-explanation`)).toHaveValue(
      articlesFixtures.oneArticle[0].explanation,
    );
    expect(screen.getByTestId(`${testId}-email`)).toHaveValue(
      articlesFixtures.oneArticle[0].email,
    );
    expect(screen.getByTestId(`${testId}-dateAdded`)).toHaveValue(
      "2022-01-02T12:00",
    );
  });

  test("that navigate(-1) is called when Cancel is clicked", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <ArticlesForm />
        </Router>
      </QueryClientProvider>,
    );
    expect(await screen.findByTestId(`${testId}-cancel`)).toBeInTheDocument();
    const cancelButton = screen.getByTestId(`${testId}-cancel`);

    fireEvent.click(cancelButton);

    await waitFor(() => expect(mockedNavigate).toHaveBeenCalledWith(-1));
  });

  test("that the correct validations are performed", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <ArticlesForm />
        </Router>
      </QueryClientProvider>,
    );

    expect(await screen.findByText(/Create/)).toBeInTheDocument();
    const submitButton = screen.getByText(/Create/);
    fireEvent.click(submitButton);

    await screen.findByText(/Title is required/);
    expect(screen.getByText(/URL is required/)).toBeInTheDocument();
    expect(screen.getByText(/Explanation is required/)).toBeInTheDocument();
    expect(screen.getByText(/Email is required/)).toBeInTheDocument();
    expect(screen.getByText(/Date Added is required/)).toBeInTheDocument();
  });

  test("that submitAction is called when all fields are filled in", async () => {
    const submitAction = vi.fn();

    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <ArticlesForm submitAction={submitAction} />
        </Router>
      </QueryClientProvider>,
    );

    expect(await screen.findByTestId(`${testId}-title`)).toBeInTheDocument();

    fireEvent.change(screen.getByTestId(`${testId}-title`), {
      target: { value: "Some title" },
    });
    fireEvent.change(screen.getByTestId(`${testId}-url`), {
      target: { value: "https://example.com/some-article" },
    });
    fireEvent.change(screen.getByTestId(`${testId}-explanation`), {
      target: { value: "Some explanation" },
    });
    fireEvent.change(screen.getByTestId(`${testId}-email`), {
      target: { value: "student@ucsb.edu" },
    });
    fireEvent.change(screen.getByTestId(`${testId}-dateAdded`), {
      target: { value: "2022-01-02T12:00" },
    });
    fireEvent.click(screen.getByTestId(`${testId}-submit`));

    await waitFor(() => expect(submitAction).toHaveBeenCalled());
    expect(screen.queryByText(/is required/)).not.toBeInTheDocument();
  });
});
