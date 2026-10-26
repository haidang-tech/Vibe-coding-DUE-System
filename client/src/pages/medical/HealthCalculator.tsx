import { useMemo, useState } from "react";
import {
  notifyStudent,
  saveScreening,
  type DonorRecord,
  type IndicatorCheck,
  type Screening,
  type Vitals,
} from "../../services/api";

interface Props {
  donor: DonorRecord;
  onDone: (donor: DonorRecord) => void;
  onCancel: () => void;
}

type Draft = Record<keyof Vitals, string>;

/** Công thức đánh giá chỉ số sức khỏe (theo tiêu chuẩn hiến máu tình nguyện). */
export function evaluateVitals(v: Vitals, gender: "Nam" | "Nữ"): {
  checks: IndicatorCheck[];
  passed: boolean;
  reasons: string[];
} {
  const minWeight = gender === "Nam" ? 45 : 42;
  const minHb = gender === "Nam" ? 125 : 120;

  const checks: IndicatorCheck[] = [
    {
      key: "weight",
      label: "Cân nặng",
      value: v.weight,
      unit: "kg",
      rule: `≥ ${minWeight}`,
      ok: v.weight >= minWeight,
    },
    {
      key: "pulse",
      label: "Mạch",
      value: v.pulse,
      unit: "lần/phút",
      rule: "60 – 90",
      ok: v.pulse >= 60 && v.pulse <= 90,
    },
    {
      key: "systolic",
      label: "Huyết áp tâm thu",
      value: v.systolic,
      unit: "mmHg",
      rule: "100 – 139",
      ok: v.systolic >= 100 && v.systolic <= 139,
    },
    {
      key: "diastolic",
      label: "Huyết áp tâm trương",
      value: v.diastolic,
      unit: "mmHg",
      rule: "60 – 89",
      ok: v.diastolic >= 60 && v.diastolic <= 89,
    },
    {
      key: "temperature",
      label: "Thân nhiệt",
      value: v.temperature,
      unit: "°C",
      rule: "36.0 – 37.5",
      ok: v.temperature >= 36 && v.temperature <= 37.5,
    },
    {
      key: "hemoglobin",
      label: "Huyết sắc tố (Hb)",
      value: v.hemoglobin,
      unit: "g/L",
      rule: `≥ ${minHb}`,
      ok: v.hemoglobin >= minHb,
    },
  ];

  const reasons = checks
    .filter((c) => !c.ok)
    .map((c) => `${c.label} ${c.value} ${c.unit} (yêu cầu ${c.rule})`);
  return { checks, passed: reasons.length === 0, reasons };
}

const FIELDS: {
  key: keyof Vitals;
  label: string;
  unit: string;
  step: string;
  placeholder: string;
}[] = [
  { key: "weight", label: "Cân nặng", unit: "kg", step: "0.1", placeholder: "55" },
  { key: "pulse", label: "Mạch", unit: "lần/phút", step: "1", placeholder: "75" },
  { key: "systolic", label: "Huyết áp tâm thu", unit: "mmHg", step: "1", placeholder: "120" },
  { key: "diastolic", label: "Huyết áp tâm trương", unit: "mmHg", step: "1", placeholder: "80" },
  { key: "temperature", label: "Thân nhiệt", unit: "°C", step: "0.1", placeholder: "36.8" },
  { key: "hemoglobin", label: "Huyết sắc tố (Hb)", unit: "g/L", step: "1", placeholder: "135" },
];

export default function HealthCalculator({ donor, onDone, onCancel }: Props) {
  const [draft, setDraft] = useState<Draft>({
    weight: "",
    pulse: "",
    systolic: "",
    diastolic: "",
    temperature: "",
    hemoglobin: "",
  });
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<Screening | null>(
    donor.screening ?? null,
  );

  const complete = useMemo(
    () => FIELDS.every((f) => draft[f.key].trim() !== "" && !isNaN(Number(draft[f.key]))),
    [draft],
  );

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!complete) return;
    setSaving(true);

    const vitals = Object.fromEntries(
      FIELDS.map((f) => [f.key, Number(draft[f.key])]),
    ) as unknown as Vitals;
    const { checks, passed, reasons } = evaluateVitals(vitals, donor.gioiTinh);
    const screening: Screening = {
      vitals,
      checks,
      passed,
      reasons,
      at: new Date().toISOString(),
    };

    const updated = await saveScreening(donor.maDinhDanh, screening);
    if (!passed) await notifyStudent(updated, "screening_failed");
    setResult(screening);
    setSaving(false);
    if (!passed) return; // dừng tại đây, chờ nhân viên bấm "Hoàn tất"
    onDone(updated);
  };

  return (
    <div>
      <DonorSummary donor={donor} />

      <form className="grid" onSubmit={submit}>
        <div className="section-title">Chỉ số khám sàng lọc</div>
        {FIELDS.map((f) => (
          <div className="field" key={f.key}>
            <label>
              {f.label} ({f.unit})
            </label>
            <input
              required
              type="number"
              step={f.step}
              value={draft[f.key]}
              placeholder={f.placeholder}
              disabled={!!result}
              onChange={(e) => setDraft({ ...draft, [f.key]: e.target.value })}
            />
          </div>
        ))}

        {!result && (
          <div className="field full actions">
            <button className="btn" type="submit" disabled={!complete || saving}>
              {saving ? "Đang tính toán..." : "Lưu & đánh giá"}
            </button>
            <button type="button" className="btn ghost" onClick={onCancel}>
              Hủy
            </button>
          </div>
        )}
      </form>

      {result && (
        <>
          <table className="result-table">
            <thead>
              <tr>
                <th>Chỉ số</th>
                <th>Giá trị</th>
                <th>Yêu cầu</th>
                <th>Kết quả</th>
              </tr>
            </thead>
            <tbody>
              {result.checks.map((c) => (
                <tr key={c.key}>
                  <td>{c.label}</td>
                  <td>
                    {c.value} {c.unit}
                  </td>
                  <td>{c.rule}</td>
                  <td>
                    <span className={`badge ${c.ok ? "ok" : "no"}`}>
                      {c.ok ? "Đạt" : "Không đạt"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {result.passed ? (
            <div className="alert ok">Sức khỏe đạt – đã mở bước lấy máu.</div>
          ) : (
            <>
              <div className="alert err">
                <b>Sức khỏe không đạt.</b> Lý do: {result.reasons.join("; ")}.
                Hệ thống đã lưu kết quả và gửi thông báo cho sinh viên.
              </div>
              <div className="actions" style={{ marginTop: 16 }}>
                <button className="btn" onClick={() => onDone({ ...donor, screening: result })}>
                  Hoàn tất & tiếp nhận người kế tiếp
                </button>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

export function DonorSummary({ donor }: { donor: DonorRecord }) {
  return (
    <div className="donor-card">
      <div className="donor-code">{donor.maDinhDanh}</div>
      <div className="donor-info">
        <b>{donor.hoTen}</b>
        <span>
          MSSV {donor.mssv} · {donor.gioiTinh} · Nhóm máu <b>{donor.nhomMau}</b>
        </span>
        <span>Lịch hẹn: {donor.lichHen}</span>
      </div>
    </div>
  );
}
