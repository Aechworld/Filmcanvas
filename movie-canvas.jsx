import { useState, useRef, useCallback, useEffect } from "react";

// ─── Generate a unique color from a string (for placeholder posters) ───
function stringToGradient(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  const h1 = Math.abs(hash % 360);
  const h2 = (h1 + 40) % 360;
  return `linear-gradient(135deg, hsl(${h1},40%,18%), hsl(${h2},50%,12%))`;
}

// ─── Get initials from movie title ───
function getInitials(title) {
  return title.split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join("");
}

// ─── Movie Card ───
function MovieCard({ card, onDragStart, onRemove, onEditPoster }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseDown={e => { if (e.button === 0) onDragStart(e, card.id); }}
      onContextMenu={e => { e.preventDefault(); onRemove(card.id); }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "absolute",
        left: card.x,
        top: card.y,
        width: 160,
        cursor: "grab",
        userSelect: "none",
        zIndex: card.dragging ? 1000 : card.z || 1,
      }}
    >
      {/* Poster */}
      <div style={{
        width: 160, height: 240, borderRadius: 10, overflow: "hidden",
        position: "relative",
        boxShadow: card.dragging
          ? "0 20px 60px rgba(0,0,0,0.8), 0 0 30px rgba(123,111,240,0.3)"
          : hovered
            ? "0 12px 40px rgba(0,0,0,0.7), 0 0 20px rgba(123,111,240,0.15)"
            : "0 8px 32px rgba(0,0,0,0.6)",
        transition: card.dragging ? "none" : "box-shadow 0.3s, transform 0.3s",
        transform: card.dragging ? "scale(1.05)" : hovered ? "scale(1.02)" : "scale(1)",
        border: "1px solid rgba(255,255,255,0.06)"
      }}>
        {card.posterUrl ? (
          <img
            src={card.posterUrl}
            alt={card.title}
            style={{ width: "100%", height: "100%", objectFit: "cover", pointerEvents: "none" }}
            draggable={false}
          />
        ) : (
          <div style={{
            width: "100%", height: "100%",
            background: stringToGradient(card.title),
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            padding: 16, boxSizing: "border-box"
          }}>
            <div style={{
              fontSize: 42, fontWeight: 200, color: "rgba(255,255,255,0.12)",
              letterSpacing: 4, lineHeight: 1
            }}>
              {getInitials(card.title)}
            </div>
            <div style={{
              fontSize: 11, color: "rgba(255,255,255,0.2)", marginTop: 12,
              textAlign: "center", lineHeight: 1.4, fontWeight: 300
            }}>
              {card.title}
            </div>
          </div>
        )}

        {/* Hover overlay with "Add Poster" button */}
        {hovered && !card.dragging && (
          <div
            onClick={e => { e.stopPropagation(); onEditPoster(card.id); }}
            style={{
              position: "absolute", bottom: 0, left: 0, right: 0,
              padding: "24px 8px 10px",
              background: "linear-gradient(transparent, rgba(0,0,0,0.8))",
              display: "flex", justifyContent: "center",
              cursor: "pointer"
            }}
          >
            <span style={{
              fontSize: 10, color: "rgba(255,255,255,0.5)",
              background: "rgba(255,255,255,0.08)", borderRadius: 6,
              padding: "4px 10px", letterSpacing: 0.5,
              backdropFilter: "blur(4px)"
            }}>
              {card.posterUrl ? "Change poster" : "Add poster URL"}
            </span>
          </div>
        )}
      </div>

      {/* Title */}
      <div style={{ padding: "10px 4px 0", textAlign: "center" }}>
        <div style={{
          color: "#e0e0e0", fontSize: 13, fontWeight: 500,
          lineHeight: 1.3, letterSpacing: 0.2,
          overflow: "hidden", textOverflow: "ellipsis",
          display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical"
        }}>
          {card.title}
        </div>
        {card.year && (
          <div style={{ color: "#555", fontSize: 11, marginTop: 4, fontWeight: 300 }}>
            {card.year}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Search / Input Popup ───
function SearchPopup({ x, y, onSubmit, onClose }) {
  const [query, setQuery] = useState("");
  const [year, setYear] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 50);
  }, []);

  const handleSubmit = () => {
    if (!query.trim()) return;
    onSubmit({ title: query.trim(), year: year.trim() });
  };

  return (
    <div
      style={{ position: "absolute", left: x, top: y, zIndex: 2000 }}
      onMouseDown={e => e.stopPropagation()}
    >
      <div style={{
        background: "#141420", borderRadius: 14, padding: 6,
        border: "1px solid #2a2a3a",
        boxShadow: "0 20px 80px rgba(0,0,0,0.8), 0 0 40px rgba(123,111,240,0.06)",
        width: 280
      }}>
        {/* Movie name input */}
        <input
          ref={inputRef}
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => {
            if (e.key === "Enter") handleSubmit();
            if (e.key === "Escape") onClose();
          }}
          placeholder="Movie name..."
          style={{
            width: "100%", padding: "14px 16px", background: "transparent",
            border: "none", color: "#fff", fontSize: 16, outline: "none",
            fontFamily: "'Inter', system-ui, sans-serif", boxSizing: "border-box",
            letterSpacing: 0.3, fontWeight: 300
          }}
        />

        {/* Divider */}
        <div style={{ height: 1, background: "#222", margin: "0 12px" }} />

        {/* Year input (optional) */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 4px" }}>
          <input
            value={year}
            onChange={e => setYear(e.target.value)}
            onKeyDown={e => {
              if (e.key === "Enter") handleSubmit();
              if (e.key === "Escape") onClose();
            }}
            placeholder="Year (optional)"
            style={{
              flex: 1, padding: "10px 12px", background: "transparent",
              border: "none", color: "#888", fontSize: 13, outline: "none",
              fontFamily: "'Inter', system-ui, sans-serif", boxSizing: "border-box",
              letterSpacing: 0.3
            }}
          />
          <button
            onClick={handleSubmit}
            style={{
              padding: "8px 16px", background: query.trim() ? "#7b6ff0" : "#222",
              border: "none", borderRadius: 8, color: "#fff", fontSize: 12,
              cursor: query.trim() ? "pointer" : "default",
              fontWeight: 500, letterSpacing: 0.5, transition: "all 0.2s",
              fontFamily: "'Inter', system-ui, sans-serif"
            }}
          >
            Pin it
          </button>
        </div>

        {/* Help text */}
        <div style={{
          padding: "6px 16px 10px", color: "#444", fontSize: 11,
          lineHeight: 1.5, letterSpacing: 0.2
        }}>
          Type a movie name and press <strong style={{ color: "#666" }}>Enter</strong> to pin it.
          You can add a poster image later by hovering the card.
        </div>
      </div>
    </div>
  );
}

// ─── Poster URL Modal ───
function PosterModal({ card, onSave, onClose }) {
  const [url, setUrl] = useState(card.posterUrl || "");
  const inputRef = useRef(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 5000,
        background: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: "'Inter', system-ui, sans-serif"
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: "#141420", borderRadius: 16, padding: "32px 28px",
          width: 400, maxWidth: "90%",
          border: "1px solid #2a2a3a",
          boxShadow: "0 20px 80px rgba(0,0,0,0.6)"
        }}
      >
        <div style={{ color: "#fff", fontSize: 16, fontWeight: 400, marginBottom: 4 }}>
          {card.title}
        </div>
        <div style={{ color: "#555", fontSize: 12, marginBottom: 20 }}>
          Paste an image URL for the poster. Tip: Google the movie → right-click poster → "Copy image address"
        </div>

        <input
          ref={inputRef}
          value={url}
          onChange={e => setUrl(e.target.value)}
          onKeyDown={e => {
            if (e.key === "Enter" && url.trim()) { onSave(url.trim()); }
            if (e.key === "Escape") onClose();
          }}
          placeholder="https://image-url.com/poster.jpg"
          style={{
            width: "100%", padding: "12px 14px", background: "#1a1a2a",
            border: "1px solid #333", borderRadius: 10, color: "#fff",
            fontSize: 14, outline: "none", boxSizing: "border-box"
          }}
          onFocus={e => e.target.style.borderColor = "#7b6ff0"}
          onBlur={e => e.target.style.borderColor = "#333"}
        />

        {/* Preview */}
        {url.trim() && (
          <div style={{
            marginTop: 16, borderRadius: 8, overflow: "hidden",
            width: 100, height: 150, background: "#111", margin: "16px auto 0"
          }}>
            <img
              src={url}
              alt="Preview"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
              onError={e => { e.target.style.display = "none"; }}
            />
          </div>
        )}

        <div style={{ display: "flex", gap: 10, marginTop: 20, justifyContent: "flex-end" }}>
          <button
            onClick={onClose}
            style={{
              padding: "10px 18px", background: "transparent",
              border: "1px solid #333", borderRadius: 8, color: "#888",
              fontSize: 13, cursor: "pointer", fontFamily: "'Inter', system-ui, sans-serif"
            }}
          >
            Cancel
          </button>
          <button
            onClick={() => url.trim() && onSave(url.trim())}
            style={{
              padding: "10px 20px",
              background: url.trim() ? "linear-gradient(135deg, #7b6ff0, #5a4fd4)" : "#222",
              border: "none", borderRadius: 8, color: "#fff",
              fontSize: 13, cursor: url.trim() ? "pointer" : "default",
              fontWeight: 500, fontFamily: "'Inter', system-ui, sans-serif"
            }}
          >
            Save poster
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Hint Overlay ───
function HintOverlay({ visible }) {
  if (!visible) return null;
  return (
    <div style={{
      position: "fixed", bottom: 32, left: "50%", transform: "translateX(-50%)",
      background: "rgba(20,20,35,0.9)", borderRadius: 12, padding: "14px 28px",
      color: "#888", fontSize: 13, zIndex: 50, backdropFilter: "blur(12px)",
      border: "1px solid #222", display: "flex", gap: 24, letterSpacing: 0.2,
      fontFamily: "'Inter', system-ui, sans-serif", whiteSpace: "nowrap"
    }}>
      <span><strong style={{ color: "#bbb" }}>Double-click</strong> to add film</span>
      <span><strong style={{ color: "#bbb" }}>Drag</strong> cards to move</span>
      <span><strong style={{ color: "#bbb" }}>Scroll</strong> to zoom</span>
      <span><strong style={{ color: "#bbb" }}>Shift+Drag</strong> to pan</span>
      <span><strong style={{ color: "#bbb" }}>Right-click</strong> to remove</span>
    </div>
  );
}

// ─── Main App ───
export default function FilmCanvas() {
  const [cards, setCards] = useState([]);
  const [search, setSearch] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [showHints, setShowHints] = useState(true);
  const [editingPosterId, setEditingPosterId] = useState(null);
  const panStart = useRef(null);
  const dragRef = useRef(null);
  const nextZ = useRef(1);
  const canvasRef = useRef(null);

  // Hide hints after 10 seconds
  useEffect(() => {
    const t = setTimeout(() => setShowHints(false), 10000);
    return () => clearTimeout(t);
  }, []);

  // ── Screen coords → Canvas coords ──
  const screenToCanvas = useCallback((sx, sy) => ({
    x: (sx - pan.x) / zoom,
    y: (sy - pan.y) / zoom
  }), [zoom, pan]);

  // ── Double-click to add ──
  const handleDoubleClick = useCallback((e) => {
    if (e.target.closest("[data-card]") || e.target.closest("[data-search]")) return;
    const pos = screenToCanvas(e.clientX, e.clientY);
    setSearch({ x: pos.x, y: pos.y });
  }, [screenToCanvas]);

  // ── Submit new card ──
  const handleSubmitMovie = useCallback((movie) => {
    setCards(prev => [...prev, {
      id: Date.now() + Math.random(),
      title: movie.title,
      year: movie.year || "",
      posterUrl: "",
      x: search.x,
      y: search.y,
      z: nextZ.current++,
      dragging: false
    }]);
    setSearch(null);
  }, [search]);

  // ── Drag start ──
  const handleDragStart = useCallback((e, id) => {
    if (editingPosterId) return;
    e.stopPropagation();
    const canvasPos = screenToCanvas(e.clientX, e.clientY);
    const card = cards.find(c => c.id === id);
    if (!card) return;
    dragRef.current = {
      id,
      startMx: canvasPos.x, startMy: canvasPos.y,
      startCx: card.x, startCy: card.y
    };
    nextZ.current++;
    setCards(prev => prev.map(c =>
      c.id === id ? { ...c, dragging: true, z: nextZ.current } : c
    ));
  }, [cards, screenToCanvas, editingPosterId]);

  // ── Mouse move ──
  const handleMouseMove = useCallback((e) => {
    if (dragRef.current) {
      const canvasPos = screenToCanvas(e.clientX, e.clientY);
      const d = dragRef.current;
      setCards(prev => prev.map(c =>
        c.id === d.id
          ? { ...c, x: d.startCx + (canvasPos.x - d.startMx), y: d.startCy + (canvasPos.y - d.startMy) }
          : c
      ));
      return;
    }
    if (isPanning && panStart.current) {
      const dx = e.clientX - panStart.current.mx;
      const dy = e.clientY - panStart.current.my;
      setPan({ x: panStart.current.px + dx, y: panStart.current.py + dy });
    }
  }, [isPanning, screenToCanvas]);

  // ── Mouse up ──
  const handleMouseUp = useCallback(() => {
    if (dragRef.current) {
      const id = dragRef.current.id;
      dragRef.current = null;
      setCards(prev => prev.map(c =>
        c.id === id ? { ...c, dragging: false } : c
      ));
    }
    setIsPanning(false);
    panStart.current = null;
  }, []);

  // ── Mouse down (pan) ──
  const handleMouseDown = useCallback((e) => {
    if (e.shiftKey || e.button === 1) {
      e.preventDefault();
      setIsPanning(true);
      panStart.current = { mx: e.clientX, my: e.clientY, px: pan.x, py: pan.y };
    }
  }, [pan]);

  // ── Zoom ──
  const handleWheel = useCallback((e) => {
    e.preventDefault();
    const scaleAmount = e.deltaY > 0 ? 0.92 : 1.08;
    const newZoom = Math.max(0.1, Math.min(5, zoom * scaleAmount));
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      const cx = e.clientX - rect.left;
      const cy = e.clientY - rect.top;
      setPan(prev => ({
        x: cx - (cx - prev.x) * (newZoom / zoom),
        y: cy - (cy - prev.y) * (newZoom / zoom)
      }));
    }
    setZoom(newZoom);
  }, [zoom]);

  // ── Remove card ──
  const handleRemoveCard = useCallback((id) => {
    setCards(prev => prev.filter(c => c.id !== id));
  }, []);

  // ── Edit poster ──
  const handleEditPoster = useCallback((id) => {
    setEditingPosterId(id);
  }, []);

  const handleSavePoster = useCallback((url) => {
    setCards(prev => prev.map(c =>
      c.id === editingPosterId ? { ...c, posterUrl: url } : c
    ));
    setEditingPosterId(null);
  }, [editingPosterId]);

  // ── Click outside search to close ──
  const handleCanvasClick = useCallback((e) => {
    if (search && !e.target.closest("[data-search]")) {
      setSearch(null);
    }
  }, [search]);

  // ── Attach non-passive wheel listener ──
  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    const opts = { passive: false };
    el.addEventListener("wheel", handleWheel, opts);
    return () => el.removeEventListener("wheel", handleWheel, opts);
  }, [handleWheel]);

  const editingCard = cards.find(c => c.id === editingPosterId);

  return (
    <div
      ref={canvasRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onDoubleClick={handleDoubleClick}
      onClick={handleCanvasClick}
      style={{
        position: "fixed", inset: 0, overflow: "hidden",
        background: "radial-gradient(ellipse at 50% 30%, #14142a 0%, #0a0a0f 70%)",
        cursor: isPanning ? "grabbing" : "crosshair",
        fontFamily: "'Inter', system-ui, sans-serif",
        userSelect: "none"
      }}
    >
      {/* Subtle dot grid */}
      <div style={{
        position: "fixed", inset: 0, opacity: 0.025, pointerEvents: "none",
        backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
        backgroundSize: `${30 * zoom}px ${30 * zoom}px`,
        backgroundPosition: `${pan.x % (30 * zoom)}px ${pan.y % (30 * zoom)}px`
      }} />

      {/* Watermark */}
      <div style={{
        position: "fixed", top: 24, left: 32, zIndex: 10,
        color: "rgba(255,255,255,0.04)", fontSize: 52, fontWeight: 200,
        letterSpacing: 6, pointerEvents: "none", textTransform: "uppercase"
      }}>
        Film Canvas
      </div>

      {/* Zoom indicator */}
      <div style={{
        position: "fixed", top: 28, right: 32, zIndex: 10,
        color: "#333", fontSize: 12, fontFamily: "monospace"
      }}>
        {Math.round(zoom * 100)}%
      </div>

      {/* Empty state */}
      {cards.length === 0 && !search && (
        <div style={{
          position: "fixed", inset: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          pointerEvents: "none", flexDirection: "column", gap: 12
        }}>
          <div style={{ color: "#333", fontSize: 18, fontWeight: 300, letterSpacing: 1 }}>
            Double-click anywhere to add your first film
          </div>
          <div style={{ color: "#222", fontSize: 13, fontWeight: 300 }}>
            Build your collection on an infinite canvas
          </div>
        </div>
      )}

      {/* Transformed canvas layer */}
      <div style={{
        position: "absolute",
        transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
        transformOrigin: "0 0"
      }}>
        {cards.map(card => (
          <div key={card.id} data-card="true">
            <MovieCard
              card={card}
              onDragStart={handleDragStart}
              onRemove={handleRemoveCard}
              onEditPoster={handleEditPoster}
            />
          </div>
        ))}

        {search && (
          <div data-search="true">
            <SearchPopup
              x={search.x}
              y={search.y}
              onSubmit={handleSubmitMovie}
              onClose={() => setSearch(null)}
            />
          </div>
        )}
      </div>

      {/* Poster URL modal */}
      {editingCard && (
        <PosterModal
          card={editingCard}
          onSave={handleSavePoster}
          onClose={() => setEditingPosterId(null)}
        />
      )}

      {/* Bottom hints */}
      <HintOverlay visible={showHints} />

      {/* Card count */}
      {cards.length > 0 && (
        <div style={{
          position: "fixed", bottom: 32, right: 32, zIndex: 10,
          color: "#333", fontSize: 12, fontFamily: "monospace"
        }}>
          {cards.length} film{cards.length !== 1 ? "s" : ""}
        </div>
      )}
    </div>
  );
}