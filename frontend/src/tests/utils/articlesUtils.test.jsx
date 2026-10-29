import {
  cellToAxiosParamsDelete,
  onDeleteSuccess,
} from "main/utils/articlesUtils";
import { toast } from "react-toastify";

vi.mock("react-toastify", () => ({
  toast: vi.fn(),
}));

describe("articlesUtils tests", () => {
  test("onDeleteSuccess logs the message and shows a toast", () => {
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    onDeleteSuccess("Articles deleted");

    expect(consoleSpy).toHaveBeenCalledWith("Articles deleted");
    expect(toast).toHaveBeenCalledWith("Articles deleted");

    consoleSpy.mockRestore();
  });

  test("cellToAxiosParamsDelete returns the expected axios params", () => {
    const cell = { row: { original: { id: 17 } } };

    expect(cellToAxiosParamsDelete(cell)).toEqual({
      url: "/api/Articles",
      method: "DELETE",
      params: { id: 17 },
    });
  });
});
