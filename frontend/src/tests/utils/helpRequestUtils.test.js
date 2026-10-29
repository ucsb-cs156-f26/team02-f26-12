import {
  onDeleteSuccess,
  cellToAxiosParamsDelete,
} from "main/utils/helpRequestUtils";

const { mockToast } = vi.hoisted(() => ({ mockToast: vi.fn() }));

vi.mock("react-toastify", () => ({
  toast: mockToast,
}));

describe("helpRequestUtils tests", () => {
  beforeEach(() => {
    mockToast.mockClear();
  });

  describe("onDeleteSuccess", () => {
    test("puts the message on console.log and in a toast", () => {
      // arrange
      const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});

      // act
      onDeleteSuccess("abc");

      // assert
      expect(mockToast).toHaveBeenCalledWith("abc");
      expect(logSpy).toHaveBeenCalledWith("abc");

      logSpy.mockRestore();
    });
  });

  describe("cellToAxiosParamsDelete", () => {
    test("returns the expected axios params for a delete", () => {
      // arrange
      const cell = { row: { original: { id: 17 } } };

      // act
      const result = cellToAxiosParamsDelete(cell);

      // assert
      expect(result).toEqual({
        url: "/api/helprequests",
        method: "DELETE",
        params: { id: 17 },
      });
    });
  });
});
