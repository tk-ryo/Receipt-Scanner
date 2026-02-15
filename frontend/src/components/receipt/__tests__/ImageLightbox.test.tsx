import { render, screen } from "@testing-library/react";
import ImageLightbox from "../ImageLightbox";

describe("ImageLightbox", () => {
  it("open=true で画像を表示する", () => {
    render(
      <ImageLightbox
        open={true}
        onOpenChange={vi.fn()}
        src="/uploads/test.jpg"
        alt="テスト画像"
      />,
    );
    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("src", "/uploads/test.jpg");
    expect(img).toHaveAttribute("alt", "テスト画像");
  });

  it("open=false で画像を表示しない", () => {
    render(
      <ImageLightbox
        open={false}
        onOpenChange={vi.fn()}
        src="/uploads/test.jpg"
      />,
    );
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });
});
