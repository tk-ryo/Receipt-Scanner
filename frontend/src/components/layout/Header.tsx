import { Receipt } from "lucide-react";
import { Link } from "react-router-dom";

export default function Header() {
  return (
    <header className="border-b bg-background">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 font-bold text-lg">
          <Receipt className="h-5 w-5" />
          Receipt Scanner
        </Link>
        <nav className="flex items-center gap-4">
          <Link
            to="/"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            スキャン
          </Link>
          <Link
            to="/history"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            履歴
          </Link>
        </nav>
      </div>
    </header>
  );
}
