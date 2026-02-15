import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import ScanPage from "@/pages/ScanPage";
import HistoryPage from "@/pages/HistoryPage";
import ReceiptDetailPage from "@/pages/ReceiptDetailPage";
import DashboardPage from "@/pages/DashboardPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ScanPage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/receipts/:id" element={<ReceiptDetailPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
      </Routes>
      <Toaster />
    </BrowserRouter>
  );
}

export default App;
