import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";

interface ImageLightboxProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  src: string;
  alt?: string;
}

export default function ImageLightbox({ open, onOpenChange, src, alt = "レシート画像" }: ImageLightboxProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl p-2">
        <DialogTitle className="sr-only">{alt}</DialogTitle>
        <img
          src={src}
          alt={alt}
          className="w-full h-auto max-h-[85vh] object-contain rounded"
        />
      </DialogContent>
    </Dialog>
  );
}
