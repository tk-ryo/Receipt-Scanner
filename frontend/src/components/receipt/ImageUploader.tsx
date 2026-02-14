import { useCallback, useRef, useState } from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImageUploaderProps {
  onFileSelect?: (file: File) => void;
  onFilesSelect?: (files: File[]) => void;
  multiple?: boolean;
  disabled?: boolean;
}

export default function ImageUploader({
  onFileSelect,
  onFilesSelect,
  multiple = false,
  disabled,
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFiles = useCallback(
    (fileList: FileList) => {
      const images = Array.from(fileList).filter((f) => f.type.startsWith("image/"));
      if (images.length === 0) return;

      if (multiple && onFilesSelect) {
        onFilesSelect(images);
      } else if (onFileSelect) {
        onFileSelect(images[0]);
      }
    },
    [onFileSelect, onFilesSelect, multiple],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (e.dataTransfer.files.length > 0) {
        handleFiles(e.dataTransfer.files);
      }
    },
    [handleFiles],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        handleFiles(e.target.files);
      }
      // 同じファイルを再選択できるようにリセット
      e.target.value = "";
    },
    [handleFiles],
  );

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={`
        flex flex-col items-center justify-center gap-4
        rounded-lg border-2 border-dashed p-8 transition-colors
        ${isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-muted-foreground/50"}
        ${disabled ? "pointer-events-none opacity-50" : "cursor-pointer"}
      `}
      onClick={() => !disabled && inputRef.current?.click()}
    >
      <Upload className="h-10 w-10 text-muted-foreground" />
      <div className="text-center">
        <p className="text-sm font-medium">
          ここにレシート画像をドラッグ＆ドロップ
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          または クリックしてファイルを選択
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          JPEG / PNG / WebP（10MB以下）
          {multiple && " ・ 複数選択可"}
        </p>
      </div>
      <Button variant="outline" size="sm" disabled={disabled} type="button">
        ファイルを選択
      </Button>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple={multiple}
        className="hidden"
        onChange={handleChange}
      />
    </div>
  );
}
