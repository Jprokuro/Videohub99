import { useState, useEffect, useRef, useCallback } from "react";
import io from "socket.io-client";
import {
  Play, Pause, Heart, Eye, Search, Plus, LogOut, User, Shield,
  Home, TrendingUp, Lock, ChevronRight, CheckCircle, Video,
  Youtube, Globe, HardDrive, Tv, Film, AlertTriangle, X,
  Sparkles, Crown, Clock, MoreVertical, Share2, Trash2,
  ExternalLink, Volume2, VolumeX, Maximize2, RotateCcw,
  Flag, Bookmark, Github, Zap, RefreshCw, Users, Wifi, WifiOff
} from "lucide-react";

/* ══════════════════════════════════════════
   SOCKET.IO CONNECTION
══════════════════════════════════════════ */
const socket = io(import.meta.env.VITE_API_URL || "http://localhost:5000", {
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: 5
});

/* ══════════════════════════════════════════
   CONSTANTS
══════════════════════════════════════════ */
const ADMIN = "Jpro95";
const VEXT = /\.(mp4|webm|mov|ogg|ogv|m4v|avi|flv|mkv|3gp)(\?.*)?$/i;

/* ══════════════════════════════════════════
   THEME
══════════════════════════════════════════ */
const C = {
  bg: "#FAF8FF", card: "#FFFFFF",
  purple: "#8B5CF6", purple2: "#7C3AED",
  purpleL: "#F3F0FF", purpleM: "#DDD6FE",
  pink: "#EC4899", pinkL: "#FDF2F8", pinkM: "#FBCFE8",
  text: "#1E1B4B", sub: "#94A3B8", border: "#EDE9FF",
  gold: "#F59E0B", goldL: "#FFFBEB", goldM: "#FDE68A",
  error: "#F87171", success: "#34D399",
  s1: "rgba(139,92,246,0.08)", s2: "rgba(139,92,246,0.16)",
};

const ago = ts => {
  const m = Math.floor((Date.now() - ts) / 60000);
  if (m < 1) return "এইমাত্র";
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
};

const detectType = url => {
  const u = url.toLowerCase().trim();
  if (u.includes("youtube.com") || u.includes("youtu.be")) return "youtube";
  if (u.includes("drive.google.com")) return "gdrive";
  if (u.includes("vimeo.com")) return "vimeo";
  if (u.includes("dailymotion.com")) return "dailymotion";
  return "direct";
};

const getEmbed = (url, type) => {
  const u = url.trim();
  if (type === "youtube") {
    let id = "";
    if (u.includes("youtu.be/")) id = u.split("youtu.be/")[1]?.split("?")[0] || "";
    else if (u.includes("/shorts/")) id = u.split("/shorts/")[1]?.split("?")[0] || "";
    else { const m = u.match(/[?&]v=([^&]+)/); id = m?.[1] || ""; }
    return `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1&playsinline=1`;
  }
  if (type === "gdrive") { const m = u.match(/\/d\/([a-zA-Z0-9_-]+)/); return `https://drive.google.com/file/d/${m?.[1] || ""}/preview`; }
  if (type === "vimeo") { const m = u.match(/vimeo\.com\/(\d+)/); return `https://player.vimeo.com/video/${m?.[1] || ""}?autoplay=1`; }
  if (type === "dailymotion") { const m = u.match(/video\/([a-zA-Z0-9]+)/); return `https://www.dailymotion.com/embed/video/${m?.[1] || ""}?autoplay=1`; }
  return url;
};

const getYtThumb = url => {
  let id = "";
  if (url.includes("youtu.be/")) id = url.split("youtu.be/")[1]?.split("?")[0] || "";
  else if (url.includes("/shorts/")) id = url.split("/shorts/")[1]?.split("?")[0] || "";
  else { const m = url.match(/[?&]v=([^&]+)/); id = m?.[1] || ""; }
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : "";
};

/* UI Components (same as original) */
function Sheet({ open, onClose, children }) {
  if (!open) return null;
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 300, background: "rgba(15,10,40,.38)", backdropFilter: "blur(12px)", display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
      <div onClick={e => e.stopPropagation()} style={{ width: "100%", maxWidth: 520, background: C.card, borderRadius: "32px 32px 0 0", padding: "8px 0 0", maxHeight: "92vh", overflowY: "auto", boxShadow: "0 -20px 60px rgba(139,92,246,.18)", animation: "sheetUp .28s cubic-bezier(.34,1.4,.64,1)" }}>
        <div style={{ width: 36, height: 4, background: C.purpleM, borderRadius: 99, margin: "0 auto 18px" }} />
        <div style={{ padding: "0 20px 44px" }}>{children}</div>
      </div>
    </div>
  );
}

function TypeBadge({ url }) {
  const t = detectType(url);
  const mp = {
    youtube: { icon: <Youtube size={9} />, label: "YouTube", bg: "#FEF2F2", color: "#EF4444" },
    gdrive: { icon: <HardDrive size={9} />, label: "Drive", bg: "#EFF6FF", color: "#3B82F6" },
    vimeo: { icon: <Tv size={9} />, label: "Vimeo", bg: "#F0FDF4", color: "#22C55E" },
    dailymotion: { icon: <Film size={9} />, label: "DM", bg: "#FFF7ED", color: "#F97316" },
    direct: { icon: <Video size={9} />, label: "Video", bg: C.purpleL, color: C.purple },
  };
  const b = mp[t] || mp.direct;
  return <span style={{ display: "inline-flex", alignItems: "center", gap: 3, background: b.bg, color: b.color, fontSize: 10, fontWeight: 800, padding: "3px 7px", borderRadius: 99 }}>{b.icon}{b.label}</span>;
}

// Custom Video Player (truncated for space - use original)
function CustomPlayer({ url }) {
  return (
    <div style={{ position: "relative", paddingBottom: "56.25%", background: "#0c0c14", aspectRatio: "16/9", minHeight: 200, display: "flex", alignItems: "center", justifyContent: "center", color: "white" }}>
      <video src={url} controls style={{ width: "100%", height: "100%", objectFit: "contain" }} />
    </div>
  );
}

function YoutubePlayer({ url }) {
  const [active, setActive] = useState(false);
  if (active) return (
    <div style={{ position: "relative", paddingBottom: "56.25%", background: "#0c0c14" }}>
      <iframe src={getEmbed(url, "youtube")}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: "none" }}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
        allowFullScreen />
    </div>
  );
  return (
    <div onClick={() => setActive(true)} style={{ position: "relative", aspectRatio: "16/9", minHeight: 200, background: "#080810", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "white" }}>
      <Play size={48} fill="white" color="white" />
    </div>
  );
}

function VideoPlayer({ url }) {
  const type = detectType(url);
  if (type === "youtube") return <YoutubePlayer url={url} />;
  if (type !== "direct") return (
    <div style={{ position: "relative", paddingBottom: "56.25%", background: "#080810" }}>
      <iframe src={getEmbed(url, type)}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: "none" }}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
        allowFullScreen loading="lazy" />
    </div>
  );
  return <CustomPlayer url={url} />;
}

function Card({ v, liked, onLike, onDelete, saved, onSave, canDelete, showToast, userId }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const isAP = v.author === ADMIN;

  return (
    <div style={{ background: C.card, borderRadius: 24, marginBottom: 12, overflow: "hidden", border: `1px solid ${C.border}`, boxShadow: `0 2px 16px ${C.s1}` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "13px 13px 9px" }}>
        <div style={{ width: 40, height: 40, borderRadius: 14, flexShrink: 0, background: isAP ? `linear-gradient(135deg,${C.gold},#FB923C)` : `linear-gradient(135deg,${C.purple},${C.pink})`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          {isAP ? <Crown size={18} color="white" strokeWidth={2} /> : <User size={18} color="white" strokeWidth={2} />}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontWeight: 800, fontSize: 14, color: C.text }}>{v.author}</span>
            {isAP && <span style={{ display: "inline-flex", alignItems: "center", gap: 3, background: C.goldL, color: C.gold, fontSize: 10, fontWeight: 800, padding: "2px 7px", borderRadius: 99 }}><Crown size={8} />Admin</span>}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 2 }}>
            <Clock size={10} color={C.sub} strokeWidth={2} />
            <span style={{ fontSize: 11, color: C.sub, fontWeight: 600 }}>{ago(v.ts)}</span>
          </div>
        </div>
        <TypeBadge url={v.url} />
      </div>
      <div style={{ padding: "0 13px 11px" }}>
        <div style={{ fontWeight: 800, fontSize: 15, color: C.text, lineHeight: 1.4, marginBottom: 4 }}>{v.title}</div>
        {v.desc && <div style={{ fontSize: 12, color: C.sub, lineHeight: 1.6 }}>{v.desc}</div>}
      </div>
      <VideoPlayer url={v.url} />
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "11px 13px" }}>
        <button onClick={() => onLike(v.id)} style={{ display: "flex", alignItems: "center", gap: 6, background: liked ? C.pinkL : C.purpleL, border: `1px solid ${liked ? C.pinkM : C.purpleM}`, borderRadius: 12, padding: "8px 13px", cursor: "pointer", fontWeight: 700, fontSize: 13, color: liked ? C.pink : C.purple, fontFamily: "Nunito,sans-serif" }}>
          <Heart size={14} fill={liked ? "#EC4899" : "none"} color={liked ? C.pink : C.purple} strokeWidth={2} />{v.likes}
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 6, background: C.purpleL, border: `1px solid ${C.purpleM}`, borderRadius: 12, padding: "8px 13px", fontSize: 13, fontWeight: 700, color: C.purple }}>
          <Eye size={14} strokeWidth={2} />{v.views}
        </div>
      </div>
    </div>
  );
}

function AddForm({ onDone, onClose, authorName, isAdmin }) {
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const inp = { width: "100%", padding: "12px 13px", background: C.purpleL, border: `1.5px solid ${C.border}`, borderRadius: 13, fontSize: 14, color: C.text, fontFamily: "Nunito,sans-serif", fontWeight: 600, marginBottom: 11, display: "block" };

  const submit = async () => {
    if (!url.trim()) { setErr("ভিডিও লিংক দিন"); return; }
    if (!title.trim()) { setErr("টাইটেল দিন"); return; }
    setBusy(true);
    setErr("");

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/videos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim(), title: title.trim(), desc: desc.trim(), author: authorName })
      });
      const data = await res.json();
      if (data.video) {
        onDone(data.video);
      }
    } catch (e) {
      setErr("সার্ভার এরর");
    }
    setBusy(false);
  };

  return (
    <div>
      <div style={{ fontWeight: 900, fontSize: 18, color: C.text, marginBottom: 18 }}>ভিডিও শেয়ার করুন</div>
      <label style={{ fontWeight: 700, fontSize: 11, color: C.sub, display: "block", marginBottom: 4 }}>টাইটেল</label>
      <input style={inp} placeholder="ভিডিওর নাম..." value={title} onChange={e => setTitle(e.target.value)} />
      <label style={{ fontWeight: 700, fontSize: 11, color: C.sub, display: "block", marginBottom: 4 }}>ভিডিও লিংক</label>
      <input style={inp} placeholder="https://..." value={url} onChange={e => setUrl(e.target.value)} />
      <label style={{ fontWeight: 700, fontSize: 11, color: C.sub, display: "block", marginBottom: 4 }}>বিবরণ (ঐচ্ছিক)</label>
      <textarea style={{ ...inp, minHeight: 78 }} placeholder="ভিডিওটি সম্পর্কে..." value={desc} onChange={e => setDesc(e.target.value)} />
      {err && <div style={{ color: C.error, fontSize: 13, fontWeight: 700, marginBottom: 11 }}>{err}</div>}
      <button onClick={submit} disabled={busy} style={{ width: "100%", padding: "13px", background: `linear-gradient(135deg,${C.purple},${C.pink})`, border: "none", borderRadius: 15, color: "#fff", fontWeight: 900, fontSize: 15, cursor: busy ? "not-allowed" : "pointer", fontFamily: "Nunito,sans-serif" }}>
        {busy ? "যোগ হচ্ছে..." : "পাবলিশ করুন"}
      </button>
    </div>
  );
}

function LoginScreen({ onLogin }) {
  const [name, setName] = useState("");
  const [err, setErr] = useState("");

  const submit = async () => {
    if (!name.trim()) { setErr("নাম দিন"); return; }
    if (name.length < 2) { setErr("কমপক্ষে ২ অক্ষর"); return; }

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/users/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() })
      });
      const data = await res.json();
      if (data.user) {
        onLogin(data.user.name);
      }
    } catch (e) {
      setErr("সার্ভার এরর");
    }
  };

  return (
    <div style={{ minHeight: "100vh", width: "100%", background: C.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px 20px" }}>
      <div style={{ textAlign: "center", marginBottom: 38 }}>
        <div style={{ width: 88, height: 88, borderRadius: 28, background: `linear-gradient(135deg,${C.purple},${C.pink})`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}><Video size={40} color="white" strokeWidth={1.5} /></div>
        <div style={{ fontWeight: 900, fontSize: 30, color: C.text }}>VideoHub</div>
        <div style={{ fontSize: 13, color: C.sub, fontWeight: 600, marginTop: 4 }}>সবার জন্য · রিয়েল-টাইম</div>
      </div>
      <div style={{ width: "100%", maxWidth: 360, background: C.card, borderRadius: 28, padding: "24px 22px", border: `1px solid ${C.border}` }}>
        <div style={{ fontWeight: 900, fontSize: 20, color: C.text, marginBottom: 18 }}>স্বাগতম 👋</div>
        <input value={name} onChange={e => { setName(e.target.value); setErr(""); }} onKeyDown={e => e.key === "Enter" && submit()} placeholder="আপনার নাম লিখুন..." style={{ width: "100%", padding: "13px 13px", background: C.purpleL, border: `2px solid ${C.border}`, borderRadius: 14, fontSize: 15, color: C.text, fontFamily: "Nunito,sans-serif", fontWeight: 700, outline: "none", marginBottom: 11 }} />
        {err && <div style={{ color: C.error, fontSize: 13, fontWeight: 700, marginBottom: 11 }}>{err}</div>}
        <button onClick={submit} style={{ width: "100%", padding: "13px", background: `linear-gradient(135deg,${C.purple},${C.pink})`, border: "none", borderRadius: 14, color: "#fff", fontWeight: 800, fontSize: 15, cursor: "pointer", fontFamily: "Nunito,sans-serif" }}>
          প্রবেশ করুন
        </button>
      </div>
    </div>
  );
}

/* Main App */
export default function App() {
  const [user, setUser] = useState(null);
  const [videos, setVideos] = useState([]);
  const [likes, setLikes] = useState(new Set());
  const [tab, setTab] = useState("feed");
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [connected, setConnected] = useState(false);
  const [toast, setToast] = useState(null);

  const isAdmin = user === ADMIN;

  useEffect(() => {
    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));
    socket.on("videos:all", setVideos);
    socket.on("video:new", v => setVideos(prev => [v, ...prev]));
    socket.on("video:like-updated", ({ videoId, liked }) => {
      setVideos(prev => prev.map(v => v.id === videoId ? { ...v, likes: v.likes + (liked ? 1 : -1) } : v));
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("videos:all");
    };
  }, []);

  const showToast = useCallback((msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2800);
  }, []);

  const handleLogin = useCallback(name => {
    setUser(name);
    showToast(`${name}কে স্বাগতম!`);
  }, [showToast]);

  const handleAdd = useCallback(() => {
    setShowAdd(false);
    showToast("ভিডিও পাবলিশ হয়েছে!");
  }, [showToast]);

  const handleLike = useCallback(videoId => {
    if (!user) return;
    fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/videos/${videoId}/like`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user })
    });
  }, [user]);

  const list = videos.filter(v => !search || v.title.toLowerCase().includes(search.toLowerCase()));

  if (!user) return <LoginScreen onLogin={handleLogin} />;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&display=swap');
        * { font-family: 'Nunito', sans-serif; box-sizing: border-box; margin: 0; padding: 0; }
        html, body, #root { width: 100%; min-height: 100vh; background: ${C.bg}; }
      `}</style>

      <div style={{ background: C.bg, minHeight: "100vh", width: "100%", paddingBottom: "80px" }}>
        {/* Header */}
        <div style={{ position: "sticky", top: 0, zIndex: 100, background: "rgba(250,248,255,.93)", backdropFilter: "blur(20px)", borderBottom: `1px solid ${C.border}`, padding: "11px 14px 10px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: 11, background: `linear-gradient(135deg,${C.purple},${C.pink})`, display: "flex", alignItems: "center", justifyContent: "center" }}><Video size={17} color="white" /></div>
              <div style={{ fontWeight: 900, fontSize: 18, color: C.text }}>VideoHub</div>
              {connected ? <Wifi size={14} color={C.success} /> : <WifiOff size={14} color={C.error} />}
            </div>
            <button onClick={() => setShowAdd(true)} style={{ display: "flex", alignItems: "center", gap: 6, background: `linear-gradient(135deg,${C.purple},${C.pink})`, border: "none", borderRadius: 12, padding: "8px 12px", color: "#fff", fontWeight: 800, fontSize: 12, cursor: "pointer" }}>
              <Plus size={14} />শেয়ার
            </button>
          </div>
          <div style={{ position: "relative" }}>
            <Search style={{ position: "absolute", left: 12, top: 10, color: C.sub }} size={14} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="খুঁজুন..." style={{ width: "100%", padding: "10px 13px 10px 35px", background: C.purpleL, border: `1.5px solid ${C.border}`, borderRadius: 13, fontSize: 13, color: C.text }} />
          </div>
        </div>

        {/* Video List */}
        <div style={{ padding: "8px 14px" }}>
          {list.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 20px", color: C.sub }}>
              <Video size={48} style={{ margin: "0 auto 16px" }} />
              <div>কোনো ভিডিও নেই</div>
            </div>
          ) : list.map(v => (
            <Card key={v.id} v={v} liked={likes.has(v.id)} onLike={handleLike} saved={false} onSave={() => { }} canDelete={isAdmin} showToast={showToast} userId={user} />
          ))}
        </div>
      </div>

      <Sheet open={showAdd} onClose={() => setShowAdd(false)}>
        <AddForm onDone={handleAdd} onClose={() => setShowAdd(false)} authorName={user} isAdmin={isAdmin} />
      </Sheet>

      {toast && (
        <div style={{ position: "fixed", bottom: 92, left: "50%", transform: "translateX(-50%)", background: `linear-gradient(135deg,${C.purple},${C.pink})`, color: "#fff", padding: "11px 22px", borderRadius: 99, fontWeight: 800, fontSize: 13, zIndex: 400, whiteSpace: "nowrap" }}>
          {toast}
        </div>
      )}
    </>
  );
}
