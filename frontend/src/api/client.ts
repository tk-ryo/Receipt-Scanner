import axios, { AxiosError } from "axios";

const client = axios.create({
  baseURL: "http://localhost:8000/api",
});

function getErrorMessage(error: AxiosError<{ detail?: string }>): string {
  if (!error.response) {
    return "ネットワークエラー：サーバーに接続できません";
  }

  const detail = error.response.data?.detail;
  const status = error.response.status;

  switch (status) {
    case 400:
      return detail ?? "リクエストが正しくありません";
    case 404:
      return detail ?? "データが見つかりません";
    case 413:
      return "ファイルサイズが大きすぎます";
    case 422:
      return detail ?? "入力値が正しくありません";
    case 500:
      return detail ?? "サーバー内部エラーが発生しました";
    default:
      return detail ?? `エラーが発生しました（${status}）`;
  }
}

client.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ detail?: string }>) => {
    const message = getErrorMessage(error);
    return Promise.reject(new Error(message));
  },
);

export default client;
