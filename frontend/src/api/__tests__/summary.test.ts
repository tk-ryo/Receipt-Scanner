import { vi, type Mock } from "vitest";
import client from "../client";
import { getMonthlySummary, getMonthlyList } from "../summary";
import { createMockMonthlySummary, createMockMonthOption } from "@/test/fixtures";

vi.mock("../client", () => ({
  default: {
    get: vi.fn(),
  },
}));

const mockClient = client as unknown as { get: Mock };

describe("summary API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getMonthlySummary", () => {
    it("year/month パラメータを送信する", async () => {
      const summary = createMockMonthlySummary();
      mockClient.get.mockResolvedValue({ data: summary });

      const result = await getMonthlySummary(2025, 1);

      expect(mockClient.get).toHaveBeenCalledWith("/summary/monthly", {
        params: { year: 2025, month: 1 },
      });
      expect(result).toEqual(summary);
    });
  });

  describe("getMonthlyList", () => {
    it("data.months をアンラップする", async () => {
      const months = [createMockMonthOption(), createMockMonthOption({ month: 2 })];
      mockClient.get.mockResolvedValue({ data: { months } });

      const result = await getMonthlyList();

      expect(mockClient.get).toHaveBeenCalledWith("/summary/monthly-list");
      expect(result).toEqual(months);
    });
  });
});
