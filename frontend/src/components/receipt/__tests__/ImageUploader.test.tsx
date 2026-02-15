import { render, screen, fireEvent } from "@testing-library/react";
import ImageUploader from "../ImageUploader";

describe("ImageUploader", () => {
  it("デフォルトレンダリング", () => {
    render(<ImageUploader />);
    expect(screen.getByText("ここにレシート画像をドラッグ＆ドロップ")).toBeInTheDocument();
    expect(screen.getByText("ファイルを選択")).toBeInTheDocument();
  });

  it("disabled 状態で操作できない", () => {
    render(<ImageUploader disabled />);
    expect(screen.getByText("ファイルを選択")).toBeDisabled();
  });

  it("multiple の場合「複数選択可」を表示", () => {
    render(<ImageUploader multiple />);
    expect(screen.getByText(/複数選択可/)).toBeInTheDocument();
  });

  it("画像ファイルのドロップで onFileSelect が呼ばれる", () => {
    const onFileSelect = vi.fn();
    render(<ImageUploader onFileSelect={onFileSelect} />);

    const dropZone = screen.getByText("ここにレシート画像をドラッグ＆ドロップ").closest("div")!;
    const file = new File(["data"], "test.jpg", { type: "image/jpeg" });

    fireEvent.drop(dropZone, {
      dataTransfer: { files: [file] },
    });

    expect(onFileSelect).toHaveBeenCalledWith(file);
  });

  it("画像でないファイルのドロップでは onFileSelect が呼ばれない", () => {
    const onFileSelect = vi.fn();
    render(<ImageUploader onFileSelect={onFileSelect} />);

    const dropZone = screen.getByText("ここにレシート画像をドラッグ＆ドロップ").closest("div")!;
    const file = new File(["data"], "test.pdf", { type: "application/pdf" });

    fireEvent.drop(dropZone, {
      dataTransfer: { files: [file] },
    });

    expect(onFileSelect).not.toHaveBeenCalled();
  });

  it("ファイル input で選択できる", () => {
    const onFileSelect = vi.fn();
    render(<ImageUploader onFileSelect={onFileSelect} />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(["data"], "test.jpg", { type: "image/jpeg" });

    fireEvent.change(input, { target: { files: [file] } });

    expect(onFileSelect).toHaveBeenCalledWith(file);
  });
});
