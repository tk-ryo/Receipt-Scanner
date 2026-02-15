import { renderHook, act } from "@testing-library/react";
import { useReceiptUpload } from "../useReceiptUpload";
import { scanReceipt } from "@/api/receipts";
import { createMockReceipt } from "@/test/fixtures";

vi.mock("@/api/receipts", () => ({
  scanReceipt: vi.fn(),
}));

const mockScanReceipt = scanReceipt as ReturnType<typeof vi.fn>;

function createFile(name: string, type: string, size = 1024): File {
  const content = new ArrayBuffer(size);
  return new File([content], name, { type });
}

describe("useReceiptUpload", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(URL.createObjectURL).mockReturnValue("blob:mock-url");
  });

  it("初期状態は idle", () => {
    const { result } = renderHook(() => useReceiptUpload());
    expect(result.current.status).toBe("idle");
    expect(result.current.file).toBeNull();
    expect(result.current.previewUrl).toBeNull();
  });

  it("有効な MIME タイプのファイルを選択できる", () => {
    const { result } = renderHook(() => useReceiptUpload());
    const file = createFile("test.jpg", "image/jpeg");

    act(() => result.current.selectFile(file));

    expect(result.current.file).toBe(file);
    expect(result.current.previewUrl).toBe("blob:mock-url");
    expect(result.current.error).toBeNull();
  });

  it("無効な MIME タイプでエラーを設定する", () => {
    const { result } = renderHook(() => useReceiptUpload());
    const file = createFile("test.pdf", "application/pdf");

    act(() => result.current.selectFile(file));

    expect(result.current.file).toBeNull();
    expect(result.current.error).toContain("対応していないファイル形式");
  });

  it("サイズ超過でエラーを設定する", () => {
    const { result } = renderHook(() => useReceiptUpload());
    const file = createFile("big.jpg", "image/jpeg", 11 * 1024 * 1024);

    act(() => result.current.selectFile(file));

    expect(result.current.file).toBeNull();
    expect(result.current.error).toContain("10MB");
  });

  it("previewUrl を生成・破棄する", () => {
    const { result } = renderHook(() => useReceiptUpload());
    const file1 = createFile("a.jpg", "image/jpeg");
    const file2 = createFile("b.jpg", "image/jpeg");

    act(() => result.current.selectFile(file1));
    act(() => result.current.selectFile(file2));

    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:mock-url");
  });

  it("upload: status 遷移 idle → analyzing → done", async () => {
    const receipt = createMockReceipt();
    mockScanReceipt.mockResolvedValue(receipt);

    const { result } = renderHook(() => useReceiptUpload());
    const file = createFile("test.jpg", "image/jpeg");

    act(() => result.current.selectFile(file));
    await act(() => result.current.upload());

    expect(result.current.status).toBe("done");
    expect(result.current.receipt).toEqual(receipt);
  });

  it("upload エラー時に status = error", async () => {
    mockScanReceipt.mockRejectedValue(new Error("サーバーエラー"));

    const { result } = renderHook(() => useReceiptUpload());
    const file = createFile("test.jpg", "image/jpeg");

    act(() => result.current.selectFile(file));
    await act(() => result.current.upload());

    expect(result.current.status).toBe("error");
    expect(result.current.error).toBe("サーバーエラー");
  });

  it("reset で全状態をリセットする", async () => {
    mockScanReceipt.mockResolvedValue(createMockReceipt());

    const { result } = renderHook(() => useReceiptUpload());
    const file = createFile("test.jpg", "image/jpeg");

    act(() => result.current.selectFile(file));
    await act(() => result.current.upload());
    act(() => result.current.reset());

    expect(result.current.status).toBe("idle");
    expect(result.current.file).toBeNull();
    expect(result.current.previewUrl).toBeNull();
    expect(result.current.receipt).toBeNull();
    expect(result.current.error).toBeNull();
  });
});
