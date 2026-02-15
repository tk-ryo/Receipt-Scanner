import { renderHook, act } from "@testing-library/react";
import { useBatchUpload } from "../useBatchUpload";
import { batchScanReceipts } from "@/api/receipts";
import { createMockBatchScanResult } from "@/test/fixtures";

vi.mock("@/api/receipts", () => ({
  batchScanReceipts: vi.fn(),
}));

const mockBatchScan = batchScanReceipts as ReturnType<typeof vi.fn>;

function createFile(name: string, type: string, size = 1024): File {
  return new File([new ArrayBuffer(size)], name, { type });
}

describe("useBatchUpload", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("全て有効なファイルを選択できる", () => {
    const { result } = renderHook(() => useBatchUpload());
    const files = [
      createFile("a.jpg", "image/jpeg"),
      createFile("b.png", "image/png"),
    ];

    act(() => result.current.selectFiles(files));

    expect(result.current.files).toHaveLength(2);
    expect(result.current.error).toBeNull();
  });

  it("一部無効なファイルをスキップし警告を出す", () => {
    const { result } = renderHook(() => useBatchUpload());
    const files = [
      createFile("a.jpg", "image/jpeg"),
      createFile("b.pdf", "application/pdf"),
    ];

    act(() => result.current.selectFiles(files));

    expect(result.current.files).toHaveLength(1);
    expect(result.current.error).toContain("1件のファイルがスキップ");
  });

  it("全て無効なファイルでエラーを設定する", () => {
    const { result } = renderHook(() => useBatchUpload());
    const files = [createFile("a.pdf", "application/pdf")];

    act(() => result.current.selectFiles(files));

    expect(result.current.files).toHaveLength(0);
    expect(result.current.error).toContain("対応していないファイル形式");
  });

  it("upload: progress と status 遷移", async () => {
    const batchResult = createMockBatchScanResult();
    mockBatchScan.mockResolvedValue(batchResult);

    const { result } = renderHook(() => useBatchUpload());
    const files = [createFile("a.jpg", "image/jpeg")];

    act(() => result.current.selectFiles(files));
    await act(() => result.current.upload());

    expect(result.current.status).toBe("done");
    expect(result.current.progress).toBe(100);
    expect(result.current.result).toEqual(batchResult);
  });

  it("upload エラー時の状態", async () => {
    mockBatchScan.mockRejectedValue(new Error("一括エラー"));

    const { result } = renderHook(() => useBatchUpload());
    act(() => result.current.selectFiles([createFile("a.jpg", "image/jpeg")]));
    await act(() => result.current.upload());

    expect(result.current.status).toBe("error");
    expect(result.current.error).toBe("一括エラー");
  });

  it("reset で全状態をリセットする", async () => {
    mockBatchScan.mockResolvedValue(createMockBatchScanResult());

    const { result } = renderHook(() => useBatchUpload());
    act(() => result.current.selectFiles([createFile("a.jpg", "image/jpeg")]));
    await act(() => result.current.upload());
    act(() => result.current.reset());

    expect(result.current.status).toBe("idle");
    expect(result.current.files).toHaveLength(0);
    expect(result.current.result).toBeNull();
    expect(result.current.progress).toBe(0);
  });
});
