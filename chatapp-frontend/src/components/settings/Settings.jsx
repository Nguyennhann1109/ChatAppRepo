import { useState } from "react";
import "./Settings.css";

export default function Settings() {
  const [theme, setTheme] = useState("light");
  const [notifications, setNotifications] = useState(true);

  return (
    <div className="settings">
      <h2>Cài đặt</h2>

      <div className="setting-item">
        <label>Giao diện:</label>
        <select value={theme} onChange={(e) => setTheme(e.target.value)}>
          <option value="light">Sáng</option>
          <option value="dark">Tối</option>
        </select>
      </div>

      <div className="setting-item">
        <label>Thông báo:</label>
        <input
          type="checkbox"
          checked={notifications}
          onChange={(e) => setNotifications(e.target.checked)}
        />
        <span>Bật thông báo tin nhắn mới</span>
      </div>

      <button className="btn-save">Lưu thay đổi</button>
    </div>
  );
}
