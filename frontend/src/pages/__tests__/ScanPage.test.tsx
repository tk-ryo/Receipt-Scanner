import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import ScanPage from "../ScanPage";
import type { UploadStatus } from "@/hooks/useReceiptUpload";
import type { BatchUploadStatus } from "@/hooks/useBatchUpload";
import { createMockReceipt, createMockBatchScanResult } from "@/test/fixtures";

// hooks のモック
const mockUpload = vi.fn();
const mockReset = vi.fn();
const mockSelectFile = vi.fn();
const mockBatchUpload = vi.fn();
const mockBatchReset = vi.fn();
const mockBatchSelectFiles = vi.fn();

let mockStatus: UploadStatus = "idle";
let mockFile: File | null = null;
let mockPreviewUrl: string | null = null;
let mockReceipt = createMockReceipt();
let mockBatchStatus: BatchUploadStatus = "idle";
let mockBatchFiles: File[] = [];

vi.mock("@/hooks/useReceiptUpload", () => ({
  useReceiptUpload: () => ({
    status: mockStatus,
    receipt: mockStatus === "done" ? mockReceipt : null,
    error: null,
    file: mockFile,
    previewUrl: mockPreviewUrl,
    selectFile: mockSelectFile,
    upload: mockUpload,
    reset: mockReset,
  }),
}));

vi.mock("@/hooks/useBatchUpload", () => ({
  useBatchUpload: () => ({
    status: mockBatchStatus,
    files: mockBatchFiles,
    result: mockBatchStatus === "done" ? createMockBatchScanResult() : null,
    error: null,
    progress: mockBatchStatus === "done" ? 100 : 0,
    selectFiles: mockBatchSelectFiles,
    upload: mockBatchUpload,
    reset: mockBatchReset,
  }),
}));

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

function renderPage() {
  return render(
    <MemoryRouter>
      <ScanPage />
    </MemoryRouter>,
  );
}

describe("ScanPage", () => {
  beforeEach(() => {
    mockStatus = "idle";
    mockFile = null;
    mockPreviewUrl = null;
    mockBatchStatus = "idle";
    mockBatchFiles = [];
    vi.clearAllMocks();
  });

  it("初期表示（単一モード）でアップローダーを表示する", () => {
    renderPage();
    expect(screen.getByText("単一スキャン")).toBeInTheDocument();
    expect(screen.getByText("一括スキャン")).toBeInTheDocument();
    expect(screen.getByText("ここにレシート画像をドラッグ＆ドロップ")).toBeInTheDocument();
  });

  it("モード切替で一括モードに切り替えられる", async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByText("一括スキャン"));
    // 一括モードでもアップローダーが表示される
    expect(screen.getByText("ここにレシート画像をドラッグ＆ドロップ")).toBeInTheDocument();
  });

  it("ファイル選択後にスキャンボタンを表示する", () => {
    mockFile = new File(["data"], "test.jpg", { type: "image/jpeg" });
    mockPreviewUrl = "blob:mock-url";
    renderPage();
    expect(screen.getByText("スキャン開始")).toBeInTheDocument();
  });

  it("処理中の状態を表示する", () => {
    mockStatus = "analyzing";
    mockFile = new File(["data"], "test.jpg", { type: "image/jpeg" });
    renderPage();
    expect(screen.getByText("AI解析中...")).toBeInTheDocument();
  });

  it("完了後に結果を表示する", () => {
    mockStatus = "done";
    mockFile = new File(["data"], "test.jpg", { type: "image/jpeg" });
    renderPage();
    expect(screen.getByText("テストストア")).toBeInTheDocument();
    expect(screen.getByText(/編集/)).toBeInTheDocument();
  });
});
