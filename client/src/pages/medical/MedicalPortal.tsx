import "./medical.css";
import { useState } from "react";
import type { DonorRecord } from "../../services/api";
import CodeEntryGate from "./CodeEntryGate";
import HealthCalculator from "./HealthCalculator";
import DonationStatus from "./DonationStatus";

type Step = "code" | "screening" | "donation";

interface Props {
  onLogout: () => void;
}

const STEPS: { key: Step; label: string }[] = [
  { key: "code", label: "1. Nhập mã" },
  { key: "screening", label: "2. Khám sàng lọc" },
  { key: "donation", label: "3. Lấy máu" },
];

/** Điều phối luồng của phân quyền Y tế: Mã -> Khám -> Lấy máu. */
export default function MedicalPortal({ onLogout }: Props) {
  const [step, setStep] = useState<Step>("code");
  const [donor, setDonor] = useState<DonorRecord | null>(null);

  const reset = () => {
    setDonor(null);
    setStep("code");
  };

  const handleUnlock = (d: DonorRecord) => {
    setDonor(d);
    // Hồ sơ đã khám đạt trước đó thì vào thẳng bước lấy máu
    setStep(d.screening?.passed ? "donation" : "screening");
  };

  const handleScreened = (d: DonorRecord) => {
    if (d.screening?.passed) {
      setDonor(d);
      setStep("donation");
    } else {
      reset();
    }
  };

  const activeIndex = STEPS.findIndex((s) => s.key === step);

  return (
    <div className="panel">
      <div className="dash-head">
        <h3>Bảng điều khiển Y tế</h3>
        <button className="btn ghost" onClick={onLogout}>
          Đăng xuất
        </button>
      </div>

      <ol className="stepper">
        {STEPS.map((s, i) => (
          <li
            key={s.key}
            className={i === activeIndex ? "current" : i < activeIndex ? "past" : ""}
          >
            {s.label}
          </li>
        ))}
      </ol>

      {step === "code" && <CodeEntryGate onUnlock={handleUnlock} />}
      {step === "screening" && donor && (
        <HealthCalculator donor={donor} onDone={handleScreened} onCancel={reset} />
      )}
      {step === "donation" && donor && (
        <DonationStatus donor={donor} onFinish={reset} />
      )}
    </div>
  );
}
