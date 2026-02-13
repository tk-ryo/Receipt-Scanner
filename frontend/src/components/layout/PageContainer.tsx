interface PageContainerProps {
  children: React.ReactNode;
}

export default function PageContainer({ children }: PageContainerProps) {
  return (
    <main className="container mx-auto px-4 py-6">
      {children}
    </main>
  );
}
