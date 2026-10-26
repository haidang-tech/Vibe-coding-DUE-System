import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

export interface CccdData {
  hoTen: string;
  soCccd: string;
}

/**
 * Mã QR trên CCCD gắn chip có dạng:
 * soCCCD|soCMND cũ|Họ tên|ddMMyyyy|Giới tính|Địa chỉ|ddMMyyyy (ngày cấp)
 */
export function parseCccdQr(text: string): CccdData | null {
  const parts = text.split("|").map((s) => s.trim());
  if (parts.length < 3) return null;
  const soCccd = parts[0];
  const hoTen = parts[2];
  if (!/^\d{12}$/.test(soCccd) || !hoTen) return null;
  return { hoTen, soCccd };
}

interface Props {
  active: boolean;
  onScan: (data: CccdData) => void;
  onError?: (msg: string) => void;
}

const READER_ID = "cccd-reader";

export default function CccdCameraScanner({ active, onScan, onError }: Props) {
  const [status, setStatus] = useState("");
  // Giữ callback mới nhất mà không phải khởi động lại camera
  const cbRef = useRef({ onScan, onError });
  cbRef.current = { onScan, onError };

  useEffect(() => {
    if (!active) return;
    let cancelled = false;
    let started = false;
    const scanner = new Html5Qrcode(READER_ID);
    let lastText = "";

    setStatus("Đang bật camera...");
    scanner
      .start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 260, height: 260 } },
        (text) => {
          if (text === lastText) return; // tránh quét lặp cùng một mã
          lastText = text;
          const data = parseCccdQr(text);
          if (data) cbRef.current.onScan(data);
          else cbRef.current.onError?.("Mã QR không phải của CCCD gắn chip.");
        },
        () => {
          /* bỏ qua lỗi từng khung hình */
        },
      )
      .then(() => {
        started = true;
        if (cancelled) {
          scanner.stop().catch(() => {});
        } else {
          setStatus("Đưa mã QR trên CCCD vào khung hình");
        }
      })
      .catch((err) => {
        if (cancelled) return;
        setStatus("");
        cbRef.current.onError?.(
          `Không mở được camera: ${String(err)}. Hãy cấp quyền camera hoặc dùng nhập tay.`,
        );
      });

    return () => {
      cancelled = true;
      if (started) scanner.stop().catch(() => {});
    };
  }, [active]);

  return (
    <div className="scanner">
      <div id={READER_ID} className="scanner-view" />
      {active && status && <p className="hint">{status}</p>}
      {!active && <div className="scanner-off">Camera đang tắt</div>}
    </div>
  );
}
