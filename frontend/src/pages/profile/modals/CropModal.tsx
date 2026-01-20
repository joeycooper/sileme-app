import type { PointerEvent, RefObject } from "react";
import { PREVIEW_SIZE } from "../constants";

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
    <div className="crop-overlay" role="dialog" aria-modal="true">
      <div className="crop-panel">
        <div className="crop-header">
          <h3>裁剪头像</h3>
          <button className="link" type="button" onClick={onCancel}>
            关闭
          </button>
        </div>
        <div className="crop-preview" ref={cropPreviewRef} style={{ width: PREVIEW_SIZE }}>
          {cropImage ? (
            <img
              src={cropImageUrl}
              alt="头像预览"
              className="crop-image"
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
        <div className="crop-controls">
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
        <div className="crop-actions">
          <button className="secondary" type="button" onClick={onCancel}>
            取消
          </button>
          <button className="primary" type="button" onClick={onSave} disabled={cropSaving}>
            {cropSaving ? "保存中..." : "保存头像"}
          </button>
        </div>
      </div>
    </div>
  );
}
