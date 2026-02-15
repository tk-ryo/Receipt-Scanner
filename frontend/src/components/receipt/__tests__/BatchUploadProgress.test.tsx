import { render, screen } from "@testing-library/react";
import BatchUploadProgress from "../BatchUploadProgress";
import { createMockBatchScanResult } from "@/test/fixtures";

describe("BatchUploadProgress", () => {
  it("成功/失敗件数を表示する", () => {
    const result = createMockBatchScanResult();
    render(<BatchUploadProgress result={result} />);

    expect(screen.getByText(/成功: 1件/)).toBeInTheDocument();
    expect(screen.getByText(/失敗: 1件/)).toBeInTheDocument();
  });

  it("成功アイテムに store_name と amount を表示する", () => {
    const result = createMockBatchScanResult();
    render(<BatchUploadProgress result={result} />);

    expect(screen.getByText("receipt1.jpg")).toBeInTheDocument();
    expect(screen.getByText(/テストストア/)).toBeInTheDocument();
    expect(screen.getByText(/1,500円/)).toBeInTheDocument();
  });

  it("失敗アイテムにエラーメッセージを表示する", () => {
    const result = createMockBatchScanResult();
    render(<BatchUploadProgress result={result} />);

    expect(screen.getByText("receipt2.jpg")).toBeInTheDocument();
    expect(screen.getByText(/解析に失敗しました/)).toBeInTheDocument();
  });

  it("store_name が null の場合「店名不明」を表示する", () => {
    const result = createMockBatchScanResult({
      results: [
        {
          filename: "test.jpg",
          success: true,
          receipt: { ...createMockBatchScanResult().results[0].receipt!, store_name: null },
          error: null,
        },
      ],
    });
    render(<BatchUploadProgress result={result} />);
    expect(screen.getByText(/店名不明/)).toBeInTheDocument();
  });
});
