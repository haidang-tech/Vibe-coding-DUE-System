import { useState } from "react";
import type { DonorRecord } from "../../services/api";

interface Props {
  donor: DonorRecord;
  onClose: () => void;
}

/** Cho phép chọn "In mã định danh" hoặc "Hiện mã định danh" (thẻ cỡ lớn). */
export default function IdentityCodeModal({ donor, onClose }: Props) {
  const [showBig, setShowBig] = useState(false);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        {!showBig ? (
          <>
            <div className="login-icon">✅</div>
            <h3 style={{ textAlign: "center" }}>Cấp mã định danh</h3>
            <p className="sub" style={{ textAlign: "center" }}>
              {donor.hoTen} · MSSV {donor.mssv}
            </p>
            <div className="actions" style={{ justifyContent: "center" }}>
              <button className="btn" onClick={() => window.print()}>
                🖨️ In mã định danh
              </button>
              <button className="btn ghost" onClick={() => setShowBig(true)}>
                📱 Hiện mã định danh
              </button>
            </div>
            <button className="link-btn" onClick={onClose}>
              Đóng
            </button>
          </>
        ) : (
          <>
            <p className="sub" style={{ textAlign: "center", margin: 0 }}>
              Mã định danh của bạn
            </p>
            <div className="big-code">{donor.maDinhDanh}</div>
            <p className="hint" style={{ marginTop: 0 }}>
              Vui lòng chụp lại hoặc ghi nhớ mã này để đưa cho nhân viên y tế.
            </p>
            <div className="actions" style={{ justifyContent: "center" }}>
              <button className="btn ghost" onClick={() => setShowBig(false)}>
                Quay lại
              </button>
              <button className="btn" onClick={onClose}>
                Xong
              </button>
            </div>
          </>
        )}
      </div>

      {/* Phiếu khám giấy: chỉ hiển thị khi in */}
      <div className="print-sheet">
        <h2>PHIẾU KHÁM HIẾN MÁU TÌNH NGUYỆN</h2>
        <div className="print-code">{donor.maDinhDanh}</div>
        <table>
          <tbody>
            <tr><td>Họ tên</td><td>{donor.hoTen}</td></tr>
            <tr><td>MSSV</td><td>{donor.mssv}</td></tr>
            <tr><td>Nhóm máu</td><td>{donor.nhomMau}</td></tr>
            <tr><td>Lịch hẹn</td><td>{donor.lichHen}</td></tr>
          </tbody>
        </table>
        <p>Vui lòng đưa phiếu này cho nhân viên y tế tại bàn khám.</p>
      </div>
    </div>
  );
}
