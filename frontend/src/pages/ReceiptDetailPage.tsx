import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Header from "@/components/layout/Header";
import PageContainer from "@/components/layout/PageContainer";
import AnalysisResult from "@/components/receipt/AnalysisResult";
import ReceiptEditForm from "@/components/receipt/ReceiptEditForm";
import { deleteReceipt, getReceipt } from "@/api/receipts";
import type { Receipt } from "@/types/receipt";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function ReceiptDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetch = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getReceipt(Number(id));
      setReceipt(data);
    } catch {
      setError("レシートの取得に失敗しました");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const handleSaved = (updated: Receipt) => {
    setReceipt(updated);
    setEditing(false);
  };

  const handleDelete = async () => {
    if (!receipt) return;
    if (!window.confirm("このレシートを削除しますか？")) return;
    setDeleting(true);
    try {
      await deleteReceipt(receipt.id);
      toast.success("削除しました");
      navigate("/history");
    } catch {
      toast.error("削除に失敗しました");
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <PageContainer>
        {/* 戻るリンク */}
        <Link
          to="/history"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          履歴に戻る
        </Link>

        {/* ローディング */}
        {loading && (
          <div className="space-y-4">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-64 w-full rounded-lg" />
          </div>
        )}

        {/* エラー */}
        {error && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {/* レシート詳細 */}
        {!loading && receipt && (
          <div className="grid gap-6 md:grid-cols-2">
            {/* 左カラム: 画像 */}
            <div className="space-y-4">
              <div className="overflow-hidden rounded-lg border">
                <img
                  src={`http://localhost:8000${receipt.image_path}`}
                  alt="レシート画像"
                  className="w-full object-contain"
                />
              </div>

              {/* アクションボタン */}
              <div className="flex gap-2">
                {!editing && (
                  <Button
                    variant="outline"
                    onClick={() => setEditing(true)}
                    className="flex-1"
                  >
                    <Pencil className="h-4 w-4" />
                    編集
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                  {deleting ? "削除中..." : "削除"}
                </Button>
              </div>
            </div>

            {/* 右カラム: 詳細 / 編集フォーム */}
            <div>
              {editing ? (
                <ReceiptEditForm receipt={receipt} onSaved={handleSaved} />
              ) : (
                <AnalysisResult receipt={receipt} />
              )}
            </div>
          </div>
        )}
      </PageContainer>
    </div>
  );
}
