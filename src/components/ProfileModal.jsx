import React, { useState } from "react";
import { useForm } from "react-hook-form";

export default function ProfileModal({ isOpen, onClose, user, onUserUpdate, onLogout }) {
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editProfileLoading, setEditProfileLoading] = useState(false);
  const [editProfileMessage, setEditProfileMessage] = useState({ type: "", text: "" });

  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState({ type: "", text: "" });

  const [isExporting, setIsExporting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    reset: resetProfile,
    formState: { errors: profileErrors },
  } = useForm({
    mode: "onChange",
    defaultValues: {
      fullName: user?.fullName || "",
      email: user?.email || "",
      phone: user?.phone || "",
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPassword,
    formState: { errors: passwordErrors },
  } = useForm({ mode: "onChange" });

  const handleProfileUpdate = async (data) => {
    setEditProfileMessage({ type: "", text: "" });
    setEditProfileLoading(true);

    try {
      const res = await fetch("/api/auth/update-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentEmail: user.email,
          fullName: data.fullName,
          email: data.email,
          phone: data.phone,
        }),
      });

      const responseData = await res.json();
      if (!res.ok) throw new Error(responseData.error || "Failed to update profile.");

      onUserUpdate(responseData.user);

      setEditProfileMessage({ type: "success", text: "Profile updated successfully!" });
      setTimeout(() => {
        setIsEditingProfile(false);
        setEditProfileMessage({ type: "", text: "" });
      }, 1500);
    } catch (err) {
      setEditProfileMessage({ type: "danger", text: err.message });
    } finally {
      setEditProfileLoading(false);
    }
  };

  const handlePasswordChange = async (data) => {
    setPasswordMessage({ type: "", text: "" });
    setPasswordLoading(true);

    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email,
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
        }),
      });

      const responseData = await res.json();
      if (!res.ok) throw new Error(responseData.error || "Failed to change password.");

      setPasswordMessage({ type: "success", text: responseData.message || "Password updated!" });
      resetPassword();
      setTimeout(() => setShowPasswordForm(false), 2000);
    } catch (err) {
      setPasswordMessage({ type: "danger", text: err.message });
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleExportData = async () => {
    setIsExporting(true);
    try {
      const res = await fetch(`/api/resumes?userId=${user.email || user._id}`);
      const data = await res.json();
      if (!data.success) throw new Error("Failed to fetch resumes");

      // We'll skip decrypting here since it's a raw dump, but we'll include everything.
      const exportBlob = new Blob(
        [JSON.stringify({ user, resumes: data.resumes }, null, 2)],
        { type: "application/json" }
      );
      const url = URL.createObjectURL(exportBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `jtresume_export_${user.email}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      alert("Export failed: " + e.message);
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm("Are you absolutely sure you want to delete your account? This action is permanent and cannot be undone.")) return;
    setIsDeleting(true);
    try {
      const res = await fetch("/api/user/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email }),
      });
      if (res.ok) {
        alert("Your account and all associated data have been permanently deleted.");
        onLogout();
      } else {
        const err = await res.json();
        throw new Error(err.error || "Deletion failed");
      }
    } catch (e) {
      alert(e.message);
      setIsDeleting(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return "?";
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const providerColor = { google: "#4285F4", github: "#24292e", linkedin: "#0a66c2" };
  const providerLabel = { google: "Google", github: "GitHub", linkedin: "LinkedIn", email: "Email & Password" };

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "rgba(15,23,42,0.6)",
        backdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "rgba(30, 41, 59, 0.95)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: "24px",
          padding: "0",
          width: "100%",
          maxWidth: "400px",
          boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)",
          overflow: "hidden",
        }}
      >
        <div style={{ height: "110px", background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)", position: "relative" }}>
          <div style={{ position: "absolute", inset: 0, background: 'url("https://www.transparenttextures.com/patterns/cubes.png")', opacity: 0.2 }}></div>
          <button
            onClick={onClose}
            style={{
              position: "absolute", top: "16px", right: "16px", background: "rgba(0,0,0,0.2)",
              border: "none", color: "#fff", fontSize: "18px", width: "32px", height: "32px",
              borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", backdropFilter: "blur(4px)"
            }}
          >
            ✕
          </button>
        </div>

        <div style={{ padding: "0 28px 28px 28px", position: "relative", marginTop: "-42px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "16px" }}>
            {user?.avatar ? (
              <img src={user.avatar} alt={user.fullName} style={{ width: "84px", height: "84px", borderRadius: "50%", border: "4px solid rgb(30, 41, 59)", objectFit: "cover" }} />
            ) : (
              <div style={{ width: "84px", height: "84px", borderRadius: "50%", background: "linear-gradient(135deg, #38bdf8, #818cf8)", border: "4px solid rgb(30, 41, 59)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px", fontWeight: "800", color: "#fff" }}>
                {getInitials(user?.fullName)}
              </div>
            )}
            {!isEditingProfile && (
              <button onClick={() => setIsEditingProfile(true)} style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", fontSize: "12px", fontWeight: "600", padding: "8px 16px", borderRadius: "20px", cursor: "pointer" }}>
                Edit Profile
              </button>
            )}
          </div>

          <div style={{ marginBottom: "24px" }}>
            <h2 style={{ color: "#f8fafc", fontSize: "22px", fontWeight: "800", margin: "0 0 2px 0", letterSpacing: "-0.5px" }}>{user?.fullName || "User"}</h2>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ color: "#94a3b8", fontSize: "14px" }}>{user?.email}</span>
              {user?.provider && user.provider !== "email" && (
                <span style={{ background: providerColor[user.provider] || "#6366f1", color: "#fff", fontSize: "10px", fontWeight: "700", padding: "2px 8px", borderRadius: "12px", textTransform: "uppercase" }}>
                  {providerLabel[user.provider] || user.provider}
                </span>
              )}
            </div>
          </div>

          {editProfileMessage.text && (
            <div style={{ padding: "10px 14px", marginBottom: "20px", borderRadius: "8px", fontSize: "13px", background: editProfileMessage.type === "success" ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)", color: editProfileMessage.type === "success" ? "#34d399" : "#f87171", border: `1px solid ${editProfileMessage.type === "success" ? "rgba(16,185,129,0.2)" : "rgba(239,68,68,0.2)"}` }}>
              {editProfileMessage.text}
            </div>
          )}

          {isEditingProfile ? (
            <form onSubmit={handleProfileSubmit(handleProfileUpdate)} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "11px", color: "#94a3b8", fontWeight: "600", textTransform: "uppercase", marginBottom: "6px" }}>Full Name</label>
                <input type="text" {...registerProfile("fullName", { required: "Full Name is required" })} disabled={editProfileLoading} style={{ width: "100%", padding: "12px 14px", borderRadius: "10px", background: "rgba(0,0,0,0.2)", border: `1px solid ${profileErrors.fullName ? "#ef4444" : "rgba(255,255,255,0.1)"}`, color: "#fff", fontSize: "14px" }} />
                {profileErrors.fullName && <span style={{ color: "#ef4444", fontSize: "11px", marginTop: "4px", display: "block" }}>{profileErrors.fullName.message}</span>}
              </div>
              <div>
                <label style={{ display: "block", fontSize: "11px", color: "#94a3b8", fontWeight: "600", textTransform: "uppercase", marginBottom: "6px" }}>Email Address</label>
                <input type="email" {...registerProfile("email", { required: "Email address is required", pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: "Invalid email address" } })} disabled={editProfileLoading} style={{ width: "100%", padding: "12px 14px", borderRadius: "10px", background: "rgba(0,0,0,0.2)", border: `1px solid ${profileErrors.email ? "#ef4444" : "rgba(255,255,255,0.1)"}`, color: "#fff", fontSize: "14px" }} />
                {profileErrors.email && <span style={{ color: "#ef4444", fontSize: "11px", marginTop: "4px", display: "block" }}>{profileErrors.email.message}</span>}
              </div>
              <div>
                <label style={{ display: "block", fontSize: "11px", color: "#94a3b8", fontWeight: "600", textTransform: "uppercase", marginBottom: "6px" }}>Phone Number <span style={{ color: "#64748b", textTransform: "none", fontWeight: "400" }}>(Optional)</span></label>
                <input type="text" {...registerProfile("phone", { pattern: { value: /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/im, message: "Invalid phone number format" } })} disabled={editProfileLoading} style={{ width: "100%", padding: "12px 14px", borderRadius: "10px", background: "rgba(0,0,0,0.2)", border: `1px solid ${profileErrors.phone ? "#ef4444" : "rgba(255,255,255,0.1)"}`, color: "#fff", fontSize: "14px" }} />
                {profileErrors.phone && <span style={{ color: "#ef4444", fontSize: "11px", marginTop: "4px", display: "block" }}>{profileErrors.phone.message}</span>}
              </div>
              <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
                <button type="button" onClick={() => { setIsEditingProfile(false); resetProfile(); setEditProfileMessage({ type: "", text: "" }); }} disabled={editProfileLoading} style={{ flex: 1, padding: "12px", background: "transparent", color: "#cbd5e1", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", fontWeight: "600", cursor: "pointer" }}>Cancel</button>
                <button type="submit" disabled={editProfileLoading} style={{ flex: 1, padding: "12px", background: "#4f46e5", color: "#fff", border: "none", borderRadius: "10px", fontWeight: "600", cursor: "pointer" }}>{editProfileLoading ? "Saving..." : "Save"}</button>
              </div>
            </form>
          ) : (
            <>
              <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "16px", padding: "20px" }}>
                <div style={{ display: "flex", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "16px", marginBottom: "16px" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "10px", color: "#64748b", fontWeight: "700", textTransform: "uppercase" }}>Phone Number</div>
                    <div style={{ color: "#f1f5f9", fontSize: "14px", marginTop: "4px", fontWeight: "500" }}>{user?.phone || "—"}</div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "10px", color: "#64748b", fontWeight: "700", textTransform: "uppercase" }}>Member Since</div>
                    <div style={{ color: "#f1f5f9", fontSize: "14px", marginTop: "4px", fontWeight: "500" }}>{user?.createdAt ? new Date(user.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "—"}</div>
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: "10px", color: "#64748b", fontWeight: "700", textTransform: "uppercase" }}>Sign-in Method</div>
                  <div style={{ color: "#f1f5f9", fontSize: "14px", marginTop: "4px", fontWeight: "500" }}>{providerLabel[user?.provider] || "Email & Password"}</div>
                </div>
              </div>

              {(!user?.provider || user?.provider === "email") && (
                <div style={{ marginTop: "20px" }}>
                  <button onClick={() => setShowPasswordForm(!showPasswordForm)} style={{ width: "100%", padding: "14px 16px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", color: "#e2e8f0", fontSize: "13px", fontWeight: "600", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}>
                    Change Password
                    <span style={{ transform: showPasswordForm ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>▼</span>
                  </button>
                  {showPasswordForm && (
                    <form onSubmit={handlePasswordSubmit(handlePasswordChange)} style={{ marginTop: "12px", padding: "20px", background: "rgba(0,0,0,0.15)", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.05)" }}>
                      {passwordMessage.text && (
                        <div style={{ padding: "10px 12px", marginBottom: "16px", borderRadius: "8px", fontSize: "12px", background: passwordMessage.type === "success" ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)", color: passwordMessage.type === "success" ? "#34d399" : "#f87171" }}>
                          {passwordMessage.text}
                        </div>
                      )}
                      <div style={{ marginBottom: "16px" }}>
                        <input type="password" placeholder="Current Password" {...registerPassword("currentPassword", { required: "Required" })} disabled={passwordLoading} style={{ width: "100%", padding: "12px 14px", borderRadius: "8px", background: "rgba(0,0,0,0.3)", border: `1px solid ${passwordErrors.currentPassword ? "#ef4444" : "rgba(255,255,255,0.1)"}`, color: "#fff", fontSize: "13px" }} />
                      </div>
                      <div style={{ marginBottom: "16px" }}>
                        <input type="password" placeholder="New Password" {...registerPassword("newPassword", { required: "Required", minLength: { value: 8, message: "Min 8 chars" } })} disabled={passwordLoading} style={{ width: "100%", padding: "12px 14px", borderRadius: "8px", background: "rgba(0,0,0,0.3)", border: `1px solid ${passwordErrors.newPassword ? "#ef4444" : "rgba(255,255,255,0.1)"}`, color: "#fff", fontSize: "13px" }} />
                      </div>
                      <div style={{ marginBottom: "20px" }}>
                        <input type="password" placeholder="Confirm New Password" {...registerPassword("confirmPassword", { required: "Required", validate: (val, formValues) => val === formValues.newPassword || "No match" })} disabled={passwordLoading} style={{ width: "100%", padding: "12px 14px", borderRadius: "8px", background: "rgba(0,0,0,0.3)", border: `1px solid ${passwordErrors.confirmPassword ? "#ef4444" : "rgba(255,255,255,0.1)"}`, color: "#fff", fontSize: "13px" }} />
                      </div>
                      <button type="submit" disabled={passwordLoading} style={{ width: "100%", padding: "12px", background: "#4f46e5", color: "#fff", border: "none", borderRadius: "8px", fontWeight: "600", fontSize: "13px", cursor: "pointer" }}>
                        {passwordLoading ? "Updating..." : "Update Password"}
                      </button>
                    </form>
                  )}
                </div>
              )}

              <div style={{ marginTop: "32px", paddingTop: "20px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                <h3 style={{ color: "#f1f5f9", fontSize: "15px", fontWeight: "700", marginBottom: "16px" }}>Data & Privacy</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <button onClick={handleExportData} disabled={isExporting} style={{ width: "100%", padding: "12px 16px", background: "rgba(56, 189, 248, 0.1)", border: "1px solid rgba(56, 189, 248, 0.2)", borderRadius: "12px", color: "#38bdf8", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}>
                    {isExporting ? "Preparing Export..." : "Export All My Data (JSON)"}
                  </button>
                  <button onClick={handleDeleteAccount} disabled={isDeleting} style={{ width: "100%", padding: "12px 16px", background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.2)", borderRadius: "12px", color: "#f87171", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}>
                    {isDeleting ? "Deleting Account..." : "Permanently Delete Account"}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
