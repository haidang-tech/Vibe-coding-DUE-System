import { useEffect, useState } from "react";
import { listDonors, type DonorRecord } from "../../services/api";

interface Props {
  refreshKey?: number;
}

export default function StudentList({ refreshKey = 0 }: Props) {
  const [donors, setDonors] = useState<DonorRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  useEffect(() => {
    setLoading(true);
    listDonors().then((d) => {
      setDonors(d);
      setLoading(false);
    });
  }, [refreshKey]);

  const keyword = q.trim().toLowerCase();
  const rows = donors.filter(
    (d) =>
      !keyword ||
      d.hoTen.toLowerCase().includes(keyword) ||
      d.mssv.toLowerCase().includes(keyword) ||
      d.soCccd.includes(keyword),
  );

  const checkedIn = donors.filter((d) => d.checkedIn).length;

  const statusOf = (d: DonorRecord) => {
    if (d.donation)
      return d.donation.outcome === "success"
        ? { cls: "ok", text: "Đã hiến máu" }
        : { cls: "no", text: "Hiến thất bại" };
    if (d.screening && !d.screening.passed)
      return { cls: "no", text: "Không đạt sàng lọc" };
    if (d.screening?.passed) return { cls: "ok", text: "Chờ lấy máu" };
    if (d.checkedIn) return { cls: "wait", text: "Đã check-in" };
    return { cls: "wait", text: "Chưa check-in" };
  };

  return (
    <div>
      <div className="dash-head">
        <div>
          <b>{donors.length}</b> đã đăng ký · <b>{checkedIn}</b> đã check-in
        </div>
        <div className="field" style={{ minWidth: 260 }}>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Tìm theo tên, MSSV, CCCD..."
          />
        </div>
      </div>

      {loading ? (
        <div className="alert" style={{ background: "#f3f4f6", color: "#6b7280" }}>
          Đang tải...
        </div>
      ) : rows.length === 0 ? (
        <div className="alert" style={{ background: "#f3f4f6", color: "#6b7280" }}>
          Không có hồ sơ phù hợp.
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Họ tên</th>
                <th>MSSV</th>
                <th>Số CCCD</th>
                <th>Nhóm máu</th>
                <th>Lịch hẹn</th>
                <th>Mã định danh</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((d, i) => {
                const s = statusOf(d);
                return (
                  <tr key={d.soCccd}>
                    <td>{i + 1}</td>
                    <td>{d.hoTen}</td>
                    <td>{d.mssv}</td>
                    <td>{d.soCccd}</td>
                    <td>
                      <b>{d.nhomMau}</b>
                    </td>
                    <td>{d.lichHen}</td>
                    <td>{d.maDinhDanh || "—"}</td>
                    <td>
                      <span className={`badge ${s.cls}`}>{s.text}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
