import { vi, type Mock } from "vitest";
import client from "../client";
import {
  scanReceipt,
  getReceipts,
  updateReceipt,
  deleteReceipt,
  exportCsv,
} from "../receipts";
import { createMockReceipt } from "@/test/fixtures";

vi.mock("../client", () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

const mockClient = client as unknown as {
  post: Mock;
  get: Mock;
  put: Mock;
  delete: Mock;
};

describe("receipts API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("scanReceipt", () => {
    it("FormData でファイルを送信する", async () => {
      const receipt = createMockReceipt();
      mockClient.post.mockResolvedValue({ data: receipt });

      const file = new File(["dummy"], "test.jpg", { type: "image/jpeg" });
      const result = await scanReceipt(file);

      expect(mockClient.post).toHaveBeenCalledWith("/receipts/scan", expect.any(FormData));
      expect(result).toEqual(receipt);
    });
  });

  describe("getReceipts", () => {
    it("skip/limit パラメータを送信する", async () => {
      const response = { items: [], total: 0 };
      mockClient.get.mockResolvedValue({ data: response });

      await getReceipts(10, 20);

      expect(mockClient.get).toHaveBeenCalledWith("/receipts", {
        params: { skip: 10, limit: 20 },
      });
    });

    it("フィルタの空文字/undefined を除外する", async () => {
      mockClient.get.mockResolvedValue({ data: { items: [], total: 0 } });

      await getReceipts(0, 20, {
        category: "食費",
        search: "",
        date_from: undefined,
      });

      expect(mockClient.get).toHaveBeenCalledWith("/receipts", {
        params: { skip: 0, limit: 20, category: "食費" },
      });
    });
  });

  describe("updateReceipt", () => {
    it("PUT リクエストを送信する", async () => {
      const receipt = createMockReceipt();
      mockClient.put.mockResolvedValue({ data: receipt });

      const body = {
        store_name: "更新ストア",
        date: null,
        total_amount: null,
        tax: null,
        payment_method: null,
        category: null,
        items: [],
      };
      const result = await updateReceipt(1, body);

      expect(mockClient.put).toHaveBeenCalledWith("/receipts/1", body);
      expect(result).toEqual(receipt);
    });
  });

  describe("deleteReceipt", () => {
    it("DELETE リクエストを送信する", async () => {
      mockClient.delete.mockResolvedValue({});
      await deleteReceipt(1);
      expect(mockClient.delete).toHaveBeenCalledWith("/receipts/1");
    });
  });

  describe("exportCsv", () => {
    it("Blob ダウンロードを実行する", async () => {
      const blob = new Blob(["csv data"], { type: "text/csv" });
      mockClient.get.mockResolvedValue({ data: blob });

      // DOM操作をモック
      const mockClick = vi.fn();
      const mockAnchor = {
        href: "",
        download: "",
        click: mockClick,
      } as unknown as HTMLAnchorElement;
      vi.spyOn(document, "createElement").mockReturnValue(mockAnchor);
      vi.spyOn(document.body, "appendChild").mockImplementation(() => mockAnchor);
      vi.spyOn(document.body, "removeChild").mockImplementation(() => mockAnchor);

      await exportCsv();

      expect(mockClient.get).toHaveBeenCalledWith("/receipts/export/csv", {
        params: {},
        responseType: "blob",
      });
      expect(mockClick).toHaveBeenCalled();
      expect(mockAnchor.download).toBe("receipts.csv");
    });
  });
});
