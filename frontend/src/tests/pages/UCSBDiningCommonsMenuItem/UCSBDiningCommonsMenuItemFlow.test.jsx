import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";
import App from "../../../App";
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";

test("an admin can create, edit, and delete a menu item through the app routes", async () => {
  const axiosMock = new AxiosMockAdapter(axios);
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  let menuItem;
  axiosMock
    .onGet("/api/currentUser")
    .reply(200, apiCurrentUserFixtures.adminUser);
  axiosMock
    .onGet("/api/systemInfo")
    .reply(200, systemInfoFixtures.showingNeither);
  axiosMock
    .onGet("/api/ucsbdiningcommonsmenuitem/all")
    .reply(() => [200, menuItem ? [menuItem] : []]);
  axiosMock.onPost("/api/ucsbdiningcommonsmenuitem/post").reply((config) => {
    menuItem = { id: 17, ...config.params };
    return [200, menuItem];
  });
  axiosMock
    .onGet("/api/ucsbdiningcommonsmenuitem")
    .reply(() => [200, menuItem]);
  axiosMock.onPut("/api/ucsbdiningcommonsmenuitem").reply((config) => {
    menuItem = { id: 17, ...JSON.parse(config.data) };
    return [200, menuItem];
  });
  axiosMock.onDelete("/api/ucsbdiningcommonsmenuitem").reply(() => {
    menuItem = undefined;
    return [200, { message: "Menu item deleted" }];
  });

  try {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={["/diningcommonsmenuitem/create"]}>
          <App />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    const formId = "UCSBDiningCommonsMenuItemForm";
    const tableId = "UCSBDiningCommonsMenuItemTable";
    fireEvent.change(await screen.findByTestId(`${formId}-diningCommonsCode`), {
      target: { value: "ortega" },
    });
    fireEvent.change(screen.getByTestId(`${formId}-name`), {
      target: { value: "Pizza" },
    });
    fireEvent.change(screen.getByTestId(`${formId}-station`), {
      target: { value: "Entrees" },
    });
    fireEvent.click(screen.getByTestId(`${formId}-submit`));

    expect(
      await screen.findByTestId(`${tableId}-cell-row-0-col-name`),
    ).toHaveTextContent("Pizza");
    fireEvent.click(
      screen.getByTestId(`${tableId}-cell-row-0-col-Edit-button`),
    );
    expect(await screen.findByTestId(`${formId}-name`)).toHaveValue("Pizza");
    expect(
      axiosMock.history.get.find(
        (request) => request.url === "/api/ucsbdiningcommonsmenuitem",
      ).params,
    ).toEqual({ id: "17" });
    fireEvent.change(screen.getByTestId(`${formId}-name`), {
      target: { value: "Pasta" },
    });
    fireEvent.click(screen.getByTestId(`${formId}-submit`));

    await waitFor(() =>
      expect(
        screen.getByTestId(`${tableId}-cell-row-0-col-name`),
      ).toHaveTextContent("Pasta"),
    );
    fireEvent.click(
      screen.getByTestId(`${tableId}-cell-row-0-col-Delete-button`),
    );
    await waitFor(() =>
      expect(
        screen.queryByTestId(`${tableId}-cell-row-0-col-name`),
      ).not.toBeInTheDocument(),
    );
    expect(axiosMock.history.delete[0].params).toEqual({ id: 17 });
  } finally {
    axiosMock.restore();
    queryClient.clear();
  }
});
