import type { PointerEvent, RefObject } from "react";
import { PREVIEW_SIZE } from "../constants";
import { Button } from "@/components/ui/button";

type CropModalProps = {
  open: boolean;
  cropImageUrl: string | null;
  cropImage: HTMLImageElement | null;
  cropScale: number;
  cropBaseScale: number;
  cropOffset: { x: number; y: number };
  cropPreviewRef: RefObject<HTMLDivElement>;
  cropImageRef: RefObject<HTMLImageElement>;
  cropSaving: boolean;
  onCancel: () => void;
  onSave: () => void;
  onScaleChange: (next: number) => void;
  onPointerDown: (event: PointerEvent<HTMLImageElement>) => void;
  onPointerMove: (event: PointerEvent<HTMLImageElement>) => void;
  onPointerUp: (event: PointerEvent<HTMLImageElement>) => void;
};

export default function CropModal({
  open,
  cropImageUrl,
  cropImage,
  cropScale,
  cropBaseScale,
  cropOffset,
  cropPreviewRef,
  cropImageRef,
  cropSaving,
  onCancel,
  onSave,
  onScaleChange,
  onPointerDown,
  onPointerMove,
  onPointerUp
}: CropModalProps) {
  if (!open || !cropImageUrl) return null;
  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/50 px-4" role="dialog" aria-modal="true">
      <div className="w-full max-w-md rounded-3xl border border-border/70 bg-white/95 p-6 shadow-lift">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-ink">裁剪头像</h3>
          <Button variant="ghost" type="button" onClick={onCancel}>
            关闭
          </Button>
        </div>
        <div
          className="mx-auto mt-4 grid h-60 w-60 touch-none place-items-center overflow-hidden rounded-3xl border border-border/70 bg-slate-50"
          ref={cropPreviewRef}
          style={{ width: PREVIEW_SIZE, height: PREVIEW_SIZE }}
        >
          {cropImage ? (
            <img
              src={cropImageUrl}
              alt="头像预览"
              className="touch-none select-none cursor-grab active:cursor-grabbing"
              ref={cropImageRef}
              style={{
                width: cropImage.width * cropBaseScale,
                height: cropImage.height * cropBaseScale,
                transform: `translate(${cropOffset.x}px, ${cropOffset.y}px) scale(${cropScale})`
              }}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
            />
          ) : null}
        </div>
        <div className="mt-4 flex items-center gap-3 text-xs text-muted-foreground">
          <span>缩放</span>
          <input
            type="range"
            min="1"
            max="3"
            step="0.01"
            value={cropScale}
            onChange={(event) => onScaleChange(Number(event.target.value))}
          />
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" type="button" onClick={onCancel}>
            取消
          </Button>
          <Button type="button" onClick={onSave} disabled={cropSaving}>
            {cropSaving ? "保存中..." : "保存头像"}
          </Button>
        </div>
      </div>
    </div>
  );
}
