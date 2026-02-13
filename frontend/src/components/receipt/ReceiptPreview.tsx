interface ReceiptPreviewProps {
  src: string;
  alt?: string;
}

export default function ReceiptPreview({ src, alt = "レシート画像" }: ReceiptPreviewProps) {
  return (
    <div className="overflow-hidden rounded-lg border bg-muted/30">
      <img
        src={src}
        alt={alt}
        className="mx-auto max-h-[480px] w-auto object-contain"
      />
    </div>
  );
}
