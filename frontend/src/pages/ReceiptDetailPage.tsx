import { useParams } from "react-router-dom";

export default function ReceiptDetailPage() {
  const { id } = useParams();
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold">レシート詳細 #{id}</h1>
    </div>
  );
}
