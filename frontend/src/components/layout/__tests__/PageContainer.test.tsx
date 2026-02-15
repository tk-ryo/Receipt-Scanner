import { render, screen } from "@testing-library/react";
import PageContainer from "../PageContainer";

describe("PageContainer", () => {
  it("children をレンダリングする", () => {
    render(
      <PageContainer>
        <p>テストコンテンツ</p>
      </PageContainer>,
    );
    expect(screen.getByText("テストコンテンツ")).toBeInTheDocument();
  });
});
