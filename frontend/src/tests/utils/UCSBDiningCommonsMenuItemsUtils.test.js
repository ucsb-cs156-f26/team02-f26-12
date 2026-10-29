import { toast } from "react-toastify";
import {
  onDeleteSuccess,
  cellToAxiosParamsDelete,
} from "main/utils/UCSBDiningCommonsMenuItemUtils";

vi.mock("react-toastify", async (importOriginal) => {
  const originalModule = await importOriginal();
  return {
    ...originalModule,
    toast: vi.fn(),
  };
});

describe("UCSBDiningCommonsMenuItemUtils tests", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.clearAllMocks();
  });

  describe("onDeleteSuccess", () => {
    test("puts the message on console.log and in a toast", () => {
      const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});

      onDeleteSuccess("abc");

      expect(toast).toHaveBeenCalledWith("abc");
      expect(logSpy).toHaveBeenCalledWith("abc");
    });
  });

  describe("cellToAxiosParamsDelete", () => {
    test("returns the correct params", () => {
      const cell = { row: { original: { id: 17 } } };

      const result = cellToAxiosParamsDelete(cell);

      expect(result).toEqual({
        url: "/api/ucsbdiningcommonsmenuitem",
        method: "DELETE",
        params: { id: 17 },
      });
    });
  });
});
