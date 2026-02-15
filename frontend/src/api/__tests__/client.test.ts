import { AxiosError, type AxiosResponse } from "axios";

// client をインポートするとインターセプターが登録される
import client from "../client";

function createAxiosError(
  status: number | null,
  detail?: string,
): AxiosError<{ detail?: string }> {
  const error = new AxiosError("Request failed") as AxiosError<{ detail?: string }>;
  if (status !== null) {
    error.response = {
      status,
      data: detail !== undefined ? { detail } : {},
      statusText: "",
      headers: {},
      config: {} as never,
    } as AxiosResponse<{ detail?: string }>;
  }
  return error;
}

// インターセプターを直接テストするため、登録済みのハンドラを抽出
// axios interceptors の rejected ハンドラを取り出す
const responseInterceptor = (client.interceptors.response as unknown as {
  handlers: Array<{ rejected: (error: AxiosError) => Promise<never> }>;
}).handlers[0].rejected;

describe("client interceptor", () => {
  it("400 エラーで detail がある場合、detail を返す", async () => {
    const error = createAxiosError(400, "バリデーションエラー");
    await expect(responseInterceptor(error)).rejects.toThrow("バリデーションエラー");
  });

  it("400 エラーで detail がない場合、デフォルトメッセージを返す", async () => {
    const error = createAxiosError(400);
    await expect(responseInterceptor(error)).rejects.toThrow("リクエストが正しくありません");
  });

  it("404 エラーでデフォルトメッセージを返す", async () => {
    const error = createAxiosError(404);
    await expect(responseInterceptor(error)).rejects.toThrow("データが見つかりません");
  });

  it("413 エラーで detail を無視し固定メッセージを返す", async () => {
    const error = createAxiosError(413, "Entity too large");
    await expect(responseInterceptor(error)).rejects.toThrow("ファイルサイズが大きすぎます");
  });

  it("422 エラーでデフォルトメッセージを返す", async () => {
    const error = createAxiosError(422);
    await expect(responseInterceptor(error)).rejects.toThrow("入力値が正しくありません");
  });

  it("500 エラーでデフォルトメッセージを返す", async () => {
    const error = createAxiosError(500);
    await expect(responseInterceptor(error)).rejects.toThrow("サーバー内部エラーが発生しました");
  });

  it("500 エラーで detail がある場合、detail を返す", async () => {
    const error = createAxiosError(500, "DB接続エラー");
    await expect(responseInterceptor(error)).rejects.toThrow("DB接続エラー");
  });

  it("ネットワークエラー（response なし）でメッセージを返す", async () => {
    const error = createAxiosError(null);
    await expect(responseInterceptor(error)).rejects.toThrow(
      "ネットワークエラー：サーバーに接続できません",
    );
  });
});
