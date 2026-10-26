/**
 * Tầng gọi dữ liệu cho phân quyền Y tế.
 * Hiện dùng localStorage làm "database" giả lập để chạy được khi chưa có Backend.
 * Khi có server, chỉ cần thay thân các hàm bên dưới bằng fetch tới:
 *   GET  /api/medical/lookup/:code
 *   POST /api/medical/evaluate
 */

export type Gender = "Nam" | "Nữ";

export interface Vitals {
  weight: number; // kg
  pulse: number; // lần/phút
  systolic: number; // mmHg
  diastolic: number; // mmHg
  temperature: number; // °C
  hemoglobin: number; // g/L
}

export interface IndicatorCheck {
  key: keyof Vitals;
  label: string;
  value: number;
  unit: string;
  rule: string;
  ok: boolean;
}

export interface Screening {
  vitals: Vitals;
  checks: IndicatorCheck[];
  passed: boolean;
  reasons: string[];
  at: string;
}

export type DonationOutcome = "success" | "failed";

export interface Donation {
  outcome: DonationOutcome;
  volumeMl?: number;
  failReason?: string;
  at: string;
}

export interface DonorRecord {
  maDinhDanh: string; // VD: HM-8392 ("" cho tới khi check-in)
  checkedIn?: boolean;
  checkInAt?: string;
  email?: string;
  sdt?: string;
  ghiChu?: string;
  conditions?: string[];
  hoTen: string;
  soCccd: string;
  mssv: string;
  ngaySinh: string;
  gioiTinh: Gender;
  nhomMau: string;
  lichHen: string;
  screening?: Screening;
  donation?: Donation;
}

const KEY = "hm_donors_v2";

const SEED: DonorRecord[] = [
  {
    maDinhDanh: "",
    hoTen: "Nguyễn Văn An",
    soCccd: "079203001234",
    mssv: "21IT001",
    ngaySinh: "2003-05-14",
    gioiTinh: "Nam",
    nhomMau: "O+",
    lichHen: "08:30 - 09:00",
  },
  {
    maDinhDanh: "",
    hoTen: "Trần Thị Bình",
    soCccd: "079204005678",
    mssv: "21IT042",
    ngaySinh: "2004-09-02",
    gioiTinh: "Nữ",
    nhomMau: "A+",
    lichHen: "09:00 - 09:30",
  },
  {
    maDinhDanh: "",
    hoTen: "Lê Hoàng Cường",
    soCccd: "079203009999",
    mssv: "21IT077",
    ngaySinh: "2003-11-20",
    gioiTinh: "Nam",
    nhomMau: "B+",
    lichHen: "09:30 - 10:00",
  },
];

function load(): DonorRecord[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as DonorRecord[];
  } catch {
    /* bỏ qua, dùng dữ liệu mẫu */
  }
  localStorage.setItem(KEY, JSON.stringify(SEED));
  return SEED;
}

function save(list: DonorRecord[]) {
  localStorage.setItem(KEY, JSON.stringify(list));
}

const delay = <T>(v: T, ms = 350) =>
  new Promise<T>((res) => setTimeout(() => res(v), ms));

/** Tra cứu nghiêm ngặt theo mã định danh (khớp chính xác). */
export async function lookupByCode(code: string): Promise<DonorRecord | null> {
  const c = code.trim().toUpperCase();
  return delay(load().find((d) => d.checkedIn && d.maDinhDanh === c) ?? null);
}

/* ---------------- Ban Tổ Chức ---------------- */

/** Danh sách sinh viên đã đăng ký thành công trong Database. */
export async function listDonors(): Promise<DonorRecord[]> {
  return delay(load(), 200);
}

/** Bỏ dấu + hạ chữ thường + gộp khoảng trắng để so khớp họ tên. */
export const normalizeName = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/gi, "d")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();

export type VerifyResult =
  | { ok: true; donor: DonorRecord; alreadyCheckedIn: boolean }
  | { ok: false; reason: string };

function newCode(existing: Set<string>): string {
  let code = "";
  do {
    code = `HM-${Math.floor(1000 + Math.random() * 9000)}`;
  } while (existing.has(code));
  return code;
}

/** Đối chiếu Họ tên + Số CCCD với DB; khớp thì check-in và cấp mã định danh. */
export async function verifyCccd(
  hoTen: string,
  soCccd: string,
): Promise<VerifyResult> {
  const list = load();
  const i = list.findIndex((d) => d.soCccd === soCccd.trim());
  if (i < 0) {
    return delay({
      ok: false,
      reason: "Không tìm thấy thông tin đăng ký / Từ chối check-in",
    });
  }
  if (normalizeName(list[i].hoTen) !== normalizeName(hoTen)) {
    return delay({
      ok: false,
      reason:
        "Họ tên trên CCCD không khớp với hồ sơ đăng ký / Từ chối check-in",
    });
  }
  const already = !!list[i].checkedIn;
  if (!already) {
    list[i] = {
      ...list[i],
      checkedIn: true,
      checkInAt: new Date().toISOString(),
      maDinhDanh: newCode(new Set(list.map((d) => d.maDinhDanh))),
    };
    save(list);
  }
  return delay({ ok: true, donor: list[i], alreadyCheckedIn: already });
}

/** Lưu kết quả sàng lọc sức khỏe. */
export async function saveScreening(
  code: string,
  screening: Screening,
): Promise<DonorRecord> {
  const list = load();
  const i = list.findIndex((d) => d.maDinhDanh === code);
  if (i < 0) throw new Error("Không tìm thấy hồ sơ");
  list[i] = { ...list[i], screening };
  save(list);
  return delay(list[i]);
}

/** Lưu kết quả lấy máu cuối cùng. */
export async function saveDonation(
  code: string,
  donation: Donation,
): Promise<DonorRecord> {
  const list = load();
  const i = list.findIndex((d) => d.maDinhDanh === code);
  if (i < 0) throw new Error("Không tìm thấy hồ sơ");
  list[i] = { ...list[i], donation };
  save(list);
  return delay(list[i]);
}

export type NotifyType =
  | "screening_failed"
  | "donation_failed"
  | "donation_done";

/** Giả lập gửi thông báo/email cho sinh viên (sau này gọi email.service ở BE). */
export async function notifyStudent(donor: DonorRecord, type: NotifyType) {
  console.info(`[notify] ${type} -> ${donor.hoTen} (${donor.maDinhDanh})`);
  return delay(true, 200);
}

/* ---------------- Sinh viên ---------------- */

export interface RegisterInput {
  hoTen: string;
  mssv: string;
  soCccd: string;
  email: string;
  sdt: string;
  ngaySinh: string;
  gioiTinh: Gender;
  nhomMau: string;
  canNang: number;
  conditions: string[]; // các tiền sử sức khỏe đã tick
  ghiChu: string;
}

export type RegisterResult =
  | { ok: true; donor: DonorRecord }
  | { ok: false; reason: string };

const SLOTS = [
  "08:00 - 08:30",
  "08:30 - 09:00",
  "09:00 - 09:30",
  "09:30 - 10:00",
  "10:00 - 10:30",
  "10:30 - 11:00",
];

/** Giả lập AI kiểm tra bệnh lý (sau này thay bằng aiScreening.service + Gemini). */
function screenRegistration(i: RegisterInput): string | null {
  const age =
    (Date.now() - new Date(i.ngaySinh).getTime()) / (365.25 * 24 * 3600 * 1000);
  if (isNaN(age) || age < 18 || age > 60)
    return "Độ tuổi hiến máu phải từ 18 đến 60.";
  if (i.canNang < 42) return "Cân nặng chưa đạt mức tối thiểu để hiến máu.";
  if (i.conditions.length > 0)
    return `Tiền sử sức khỏe chưa phù hợp để hiến máu: ${i.conditions.join("; ")}.`;
  return null;
}

/** Giả lập AI phân lịch: chọn khung giờ đang có ít người đăng ký nhất. */
function assignSlot(list: DonorRecord[]): string {
  const count = (slot: string) => list.filter((d) => d.lichHen === slot).length;
  return SLOTS.reduce(
    (best, s) => (count(s) < count(best) ? s : best),
    SLOTS[0],
  );
}

/** Giả lập gửi email theo mẫu (sau này gọi email.service ở BE). */
function sendEmail(to: string, subject: string, body: string) {
  console.info(`[email] -> ${to}\n${subject}\n${body}`);
}

export async function registerDonor(i: RegisterInput): Promise<RegisterResult> {
  const list = load();
  if (list.some((d) => d.soCccd === i.soCccd))
    return delay({ ok: false, reason: "Số CCCD này đã được đăng ký." });
  if (list.some((d) => d.mssv.toLowerCase() === i.mssv.toLowerCase()))
    return delay({ ok: false, reason: "Mã sinh viên này đã được đăng ký." });

  const reason = screenRegistration(i);
  if (reason) {
    sendEmail(
      i.email,
      "Thông báo kết quả đăng ký hiến máu",
      `Rất tiếc, hồ sơ của bạn chưa đủ điều kiện. Lý do: ${reason}`,
    );
    return delay({ ok: false, reason });
  }

  const donor: DonorRecord = {
    maDinhDanh: "",
    hoTen: i.hoTen.trim(),
    soCccd: i.soCccd.trim(),
    mssv: i.mssv.trim(),
    ngaySinh: i.ngaySinh,
    gioiTinh: i.gioiTinh,
    nhomMau: i.nhomMau,
    lichHen: assignSlot(list),
    email: i.email,
    sdt: i.sdt,
    ghiChu: i.ghiChu.trim(),
    conditions: i.conditions,
  };
  save([...list, donor]);
  sendEmail(
    i.email,
    "Xác nhận đăng ký hiến máu",
    `Đăng ký thành công. Lịch hẹn của bạn: ${donor.lichHen}. Vui lòng mang theo CCCD để check-in.`,
  );
  return delay({ ok: true, donor });
}
