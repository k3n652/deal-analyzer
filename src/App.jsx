import { useState, useEffect } from "react";

const C = {
  bg: "#0f0f0f", surface: "#1a1a1a", surface2: "#222",
  border: "#2a2a2a", green: "#00e676", red: "#ff4444",
  yellow: "#ffd600", text: "#f0f0f0", muted: "#666",
};

const fmt = (n) => !n || isNaN(n) ? "—" : "$" + Number(n).toLocaleString("en-US", { maximumFractionDigits: 0 });
const pct = (n) => isNaN(n) || !isFinite(n) ? "—" : n.toFixed(1) + "%";
const STORAGE_KEY = "wsa-deals-v2";

async function loadDeals() {
  try { const r = await window.storage.get(STORAGE_KEY); return r ? JSON.parse(r.value) : []; }
  catch { return []; }
}
async function saveDeals(deals) {
  try { await window.storage.set(STORAGE_KEY, JSON.stringify(deals)); } catch (e) { console.error(e); }
}

const inputStyle = {
  background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 6,
  color: "#f0f0f0", fontSize: 15, padding: "10px 12px",
  width: "100%", outline: "none", boxSizing: "border-box",
};
const labelStyle = {
  color: "#666", fontSize: 11, fontWeight: 700,
  letterSpacing: "0.08em", textTransform: "uppercase",
  marginBottom: 5, display: "block",
};

// Defined OUTSIDE App to prevent remount on every render
function Field({ k, label, placeholder, prefix = true, textarea = false, value, onChange }) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <div style={{ position: "relative" }}>
        {prefix && !textarea && (
          <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#666" }}>$</span>
        )}
        {textarea ? (
          <textarea rows={3} placeholder={placeholder} value={value} onChange={onChange}
            style={{ ...inputStyle, paddingLeft: 12, resize: "vertical", lineHeight: 1.5 }} />
        ) : (
          <input type={prefix ? "number" : "text"} placeholder={placeholder} value={value} onChange={onChange}
            style={{ ...inputStyle, paddingLeft: prefix ? 24 : 12 }} />
        )}
      </div>
    </div>
  );
}

function StatBox({ label, value, color }) {
  return (
    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: "14px 16px" }}>
      <div style={{ color: C.muted, fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 }}>{label}</div>
      <div style={{ color: color || C.text, fontSize: 20, fontWeight: 800, fontFamily: "monospace" }}>{value}</div>
    </div>
  );
}

function Btn({ onClick, disabled, color, textColor, children, style = {} }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      padding: "10px 0", borderRadius: 7, border: "none", cursor: disabled ? "not-allowed" : "pointer",
      background: color || C.surface2, color: textColor || C.text,
      fontWeight: 700, fontSize: 13, transition: "all 0.15s", ...style,
    }}>{children}</button>
  );
}

function exportPDF(deal) {
  const isDeal = deal.isDeal;
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Deal Report – ${deal.address}</title>
  <style>
    body { font-family: 'Helvetica Neue', Arial, sans-serif; margin: 0; padding: 40px; color: #111; background: #fff; }
    h1 { font-size: 22px; margin: 0 0 4px; }
    .sub { color: #888; font-size: 13px; margin-bottom: 24px; }
    .badge { display: inline-block; padding: 4px 12px; border-radius: 4px; font-weight: 800; font-size: 13px;
      background: ${isDeal ? "#e6f9ef" : "#fdecea"}; color: ${isDeal ? "#00a550" : "#d32f2f"}; margin-bottom: 20px; }
    .section { margin-bottom: 24px; }
    .section-title { font-size: 10px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #888; margin-bottom: 10px; border-bottom: 1px solid #eee; padding-bottom: 6px; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .stat { background: #f7f7f7; border-radius: 6px; padding: 12px 14px; }
    .stat-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.07em; color: #888; margin-bottom: 4px; }
    .stat-value { font-size: 18px; font-weight: 800; font-family: monospace; }
    .row { display: flex; justify-content: space-between; padding: 7px 0; border-bottom: 1px solid #f0f0f0; font-size: 13px; }
    .row:last-child { border-bottom: none; font-weight: 700; }
    .notes-box { background: #f7f7f7; border-radius: 6px; padding: 14px; font-size: 13px; line-height: 1.6; white-space: pre-wrap; }
    .footer { margin-top: 40px; font-size: 11px; color: #bbb; text-align: center; }
    .highlight { color: ${isDeal ? "#00a550" : "#d32f2f"}; }
  </style></head><body>
  <h1>${deal.address}</h1>
  <div class="sub">Analyzed ${deal.date} · Wholesale Deal Report</div>
  <div class="badge">${isDeal ? "✓ DEAL" : "✗ PASS"}</div>
  <div class="section">
    <div class="section-title">Key Numbers</div>
    <div class="grid">
      <div class="stat"><div class="stat-label">ARV</div><div class="stat-value">${fmt(deal.arv)}</div></div>
      <div class="stat"><div class="stat-label">Repairs</div><div class="stat-value">${fmt(deal.repairs)}</div></div>
      <div class="stat"><div class="stat-label">Asking Price</div><div class="stat-value">${fmt(deal.askingPrice)}</div></div>
      <div class="stat"><div class="stat-label">Your Max Offer</div><div class="stat-value highlight">${fmt(deal.maoWholesaler)}</div></div>
      <div class="stat"><div class="stat-label">Spread</div><div class="stat-value highlight">${fmt(deal.spread)}</div></div>
      <div class="stat"><div class="stat-label">Assignment Fee</div><div class="stat-value">${fmt(deal.assignmentFee)}</div></div>
    </div>
  </div>
  <div class="section">
    <div class="section-title">Breakdown (70% Rule)</div>
    ${[
      ["ARV × 70%", fmt(deal.arv * 0.7)],
      ["− Repairs", fmt(deal.repairs)],
      ["= Buyer's MAO", fmt(deal.mao70)],
      ["− Assignment Fee", fmt(deal.assignmentFee)],
      ["− Closing Costs", fmt(deal.closingCosts)],
      ["= Your Max Offer", fmt(deal.maoWholesaler)],
    ].map(([l, v]) => `<div class="row"><span>${l}</span><span>${v}</span></div>`).join("")}
  </div>
  ${deal.notes ? `<div class="section"><div class="section-title">Notes</div><div class="notes-box">${deal.notes.replace(/</g, "&lt;")}</div></div>` : ""}
  <div class="footer">Generated by Wholesale Deal Analyzer · ${deal.date}</div>
  </body></html>`;

  const win = window.open("", "_blank");
  win.document.write(html);
  win.document.close();
  win.onload = () => { win.print(); };
}

const EMPTY = { address: "", arv: "", repairs: "", askingPrice: "", assignmentFee: "", closingCosts: "", notes: "" };

export default function App() {
  const [tab, setTab] = useState("analyze");
  const [inputs, setInputs] = useState(EMPTY);
  const [deals, setDeals] = useState([]);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    // CSS reset to remove white border
    document.body.style.margin = "0";
    document.body.style.padding = "0";
    document.body.style.background = "#0f0f0f";
    loadDeals().then((d) => { setDeals(d); setLoading(false); });
  }, []);

  const set = (k) => (e) => { setInputs((p) => ({ ...p, [k]: e.target.value })); setSaved(false); };

  const arv = parseFloat(inputs.arv) || 0;
  const repairs = parseFloat(inputs.repairs) || 0;
  const assignmentFee = inputs.assignmentFee !== "" ? parseFloat(inputs.assignmentFee) || 0 : 5000;
  const closingCosts = inputs.closingCosts !== "" ? parseFloat(inputs.closingCosts) || 0 : 3000;
  const askingPrice = parseFloat(inputs.askingPrice) || 0;
  const mao70 = arv * 0.7 - repairs;
  const maoWholesaler = mao70 - assignmentFee - closingCosts;
  const spread = maoWholesaler - askingPrice;
  const profitMargin = arv > 0 ? (assignmentFee / arv) * 100 : 0;
  const hasData = arv > 0 && askingPrice > 0;
  const isDeal = hasData && spread >= 0;
  const statusColor = !hasData ? C.muted : isDeal ? C.green : C.red;
  const statusLabel = !hasData ? "Enter numbers to analyze" : isDeal ? "✓ DEAL — Make the offer" : "✗ NO DEAL — Pass or renegotiate";

  const handleSave = async () => {
    if (!hasData) return;
    const deal = {
      id: Date.now(), date: new Date().toLocaleDateString(),
      address: inputs.address || "Unnamed Property",
      arv, repairs, askingPrice, assignmentFee, closingCosts,
      mao70, maoWholesaler, spread, profitMargin, isDeal,
      notes: inputs.notes,
    };
    const updated = [deal, ...deals];
    setDeals(updated);
    await saveDeals(updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleDelete = async (id) => {
    const updated = deals.filter((d) => d.id !== id);
    setDeals(updated);
    await saveDeals(updated);
    setDeleteId(null);
  };

  const handleLoad = (deal) => {
    setInputs({ address: deal.address, arv: deal.arv, repairs: deal.repairs, askingPrice: deal.askingPrice, assignmentFee: deal.assignmentFee, closingCosts: deal.closingCosts, notes: deal.notes || "" });
    setTab("analyze");
  };

  return (
    <div style={{ background: C.bg, minHeight: "100vh", fontFamily: "'Inter', system-ui, sans-serif", color: C.text, padding: "28px 16px" }}>
      <div style={{ maxWidth: 500, margin: "0 auto" }}>

        <div style={{ marginBottom: 20 }}>
          <div style={{ color: C.green, fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 4 }}>Wholesale Deal Analyzer</div>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 900 }}>Is it a deal?</h1>
        </div>

        <div style={{ display: "flex", gap: 4, marginBottom: 20, background: C.surface, borderRadius: 8, padding: 4 }}>
          {["analyze", "history"].map((t) => (
            <button key={t} onClick={() => setTab(t)} style={{
              flex: 1, padding: "8px 0", borderRadius: 6, border: "none", cursor: "pointer",
              background: tab === t ? C.surface2 : "transparent",
              color: tab === t ? C.text : C.muted,
              fontWeight: 700, fontSize: 13, textTransform: "capitalize",
            }}>
              {t === "history" ? `History (${deals.length})` : "Analyze"}
            </button>
          ))}
        </div>

        {tab === "analyze" && (
          <>
            <div style={{ background: hasData ? statusColor + "15" : C.surface, border: `1px solid ${statusColor}`, borderRadius: 8, padding: "11px 16px", marginBottom: 20, color: statusColor, fontWeight: 700, fontSize: 14 }}>
              {statusLabel}
            </div>

            <div style={{ display: "grid", gap: 14, marginBottom: 20 }}>
              <Field k="address" label="Property Address / Label" placeholder="e.g. 123 Main St" prefix={false} value={inputs.address} onChange={set("address")} />
              <Field k="arv" label="After Repair Value (ARV)" placeholder="e.g. 200000" value={inputs.arv} onChange={set("arv")} />
              <Field k="repairs" label="Estimated Repairs" placeholder="e.g. 30000" value={inputs.repairs} onChange={set("repairs")} />
              <Field k="askingPrice" label="Seller's Asking Price" placeholder="e.g. 100000" value={inputs.askingPrice} onChange={set("askingPrice")} />
              <Field k="assignmentFee" label="Your Assignment Fee" placeholder="default $5,000" value={inputs.assignmentFee} onChange={set("assignmentFee")} />
              <Field k="closingCosts" label="Closing Costs (est.)" placeholder="default $3,000" value={inputs.closingCosts} onChange={set("closingCosts")} />
              <Field k="notes" label="Notes" placeholder="Motivated seller, needs roof, off-market..." prefix={false} textarea value={inputs.notes} onChange={set("notes")} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
              <StatBox label="Buyer's MAO (70%)" value={fmt(mao70)} />
              <StatBox label="Your Max Offer" value={fmt(maoWholesaler)} color={isDeal && hasData ? C.green : C.text} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 20 }}>
              <StatBox label="Spread vs Asking" value={hasData ? fmt(spread) : "—"} color={hasData ? (spread >= 0 ? C.green : C.red) : C.muted} />
              <StatBox label="Your Profit Margin" value={hasData ? pct(profitMargin) : "—"} color={C.yellow} />
            </div>

            {hasData && (
              <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: 16, marginBottom: 16, fontSize: 13 }}>
                <div style={{ color: C.muted, fontWeight: 700, fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 }}>Breakdown</div>
                {[
                  ["ARV × 70%", fmt(arv * 0.7), null],
                  ["− Repairs", fmt(repairs), null],
                  ["= Buyer's MAO", fmt(mao70), C.text],
                  ["− Assignment Fee", fmt(assignmentFee), null],
                  ["− Closing Costs", fmt(closingCosts), null],
                  ["= Your Max Offer", fmt(maoWholesaler), isDeal ? C.green : C.red],
                ].map(([label, val, color], i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: i < 5 ? `1px solid ${C.border}` : "none", color: color || C.muted, fontWeight: color ? 700 : 400 }}>
                    <span>{label}</span><span style={{ fontFamily: "monospace" }}>{val}</span>
                  </div>
                ))}
              </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <Btn onClick={handleSave} disabled={!hasData}
                color={saved ? C.green + "22" : hasData ? C.green : C.border}
                textColor={saved ? C.green : hasData ? C.bg : C.muted}
                style={{ fontWeight: 800, fontSize: 14 }}>
                {saved ? "✓ Saved" : "Save Deal"}
              </Btn>
              <Btn onClick={() => {
                if (!hasData) return;
                exportPDF({ address: inputs.address || "Unnamed Property", date: new Date().toLocaleDateString(), arv, repairs, askingPrice, assignmentFee, closingCosts, mao70, maoWholesaler, spread, profitMargin, isDeal, notes: inputs.notes });
              }} disabled={!hasData} color={hasData ? C.surface2 : C.border} style={{ border: `1px solid ${hasData ? C.border : "transparent"}` }}>
                Export PDF
              </Btn>
            </div>
          </>
        )}

        {tab === "history" && (
          <div>
            {loading ? (
              <div style={{ color: C.muted, textAlign: "center", padding: 40 }}>Loading...</div>
            ) : deals.length === 0 ? (
              <div style={{ color: C.muted, textAlign: "center", padding: 40, fontSize: 14 }}>No saved deals yet.<br />Analyze and save a deal first.</div>
            ) : (
              <div style={{ display: "grid", gap: 10 }}>
                {deals.map((d) => (
                  <div key={d.id} style={{ background: C.surface, border: `1px solid ${d.isDeal ? C.green + "44" : C.border}`, borderRadius: 10, padding: 16 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 2 }}>{d.address}</div>
                        <div style={{ color: C.muted, fontSize: 11 }}>{d.date}</div>
                      </div>
                      <span style={{ background: d.isDeal ? C.green + "22" : C.red + "22", color: d.isDeal ? C.green : C.red, fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 4 }}>
                        {d.isDeal ? "DEAL" : "PASS"}
                      </span>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: d.notes ? 10 : 12 }}>
                      {[["ARV", fmt(d.arv)], ["Max Offer", fmt(d.maoWholesaler)], ["Profit", fmt(d.assignmentFee)]].map(([label, val]) => (
                        <div key={label} style={{ background: C.bg, borderRadius: 6, padding: "8px 10px" }}>
                          <div style={{ color: C.muted, fontSize: 10, fontWeight: 700, marginBottom: 2 }}>{label}</div>
                          <div style={{ fontFamily: "monospace", fontSize: 13, fontWeight: 700 }}>{val}</div>
                        </div>
                      ))}
                    </div>
                    {d.notes && (
                      <div style={{ background: C.bg, borderRadius: 6, padding: "8px 10px", marginBottom: 12, fontSize: 12, color: C.muted, lineHeight: 1.5, whiteSpace: "pre-wrap" }}>
                        {d.notes}
                      </div>
                    )}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                      <Btn onClick={() => handleLoad(d)} style={{ border: `1px solid ${C.border}`, fontSize: 12 }}>Load</Btn>
                      <Btn onClick={() => exportPDF(d)} style={{ border: `1px solid ${C.border}`, fontSize: 12 }}>PDF</Btn>
                      {deleteId === d.id ? (
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, gridColumn: "1 / -1" }}>
                          <Btn onClick={() => handleDelete(d.id)} color={C.red} textColor="#fff" style={{ fontSize: 12 }}>Confirm</Btn>
                          <Btn onClick={() => setDeleteId(null)} style={{ border: `1px solid ${C.border}`, fontSize: 12, color: C.muted }}>Cancel</Btn>
                        </div>
                      ) : (
                        <Btn onClick={() => setDeleteId(d.id)} style={{ border: `1px solid ${C.border}`, fontSize: 12, color: C.muted }}>Delete</Btn>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div style={{ color: C.muted, fontSize: 11, marginTop: 16, textAlign: "center" }}>
          Based on the 70% rule · Deals saved to your device
        </div>

        <div style={{ marginTop: 32, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: 20 }}>
          <div style={{ color: C.green, fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>
            Coming Soon
          </div>
          <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 6 }}>
            Get early access
          </div>
          <div style={{ color: C.muted, fontSize: 13, marginBottom: 16, lineHeight: 1.5 }}>
            We're building the full version — unlimited deals, cash buyer tools, and more. Join the waitlist to be one of the first to know when it drops.
          </div>
          <iframe
            src="https://tally.so/r/5BODXd?"
            width="100%"
            height="180"
            frameBorder="0"
            marginHeight="0"
            marginWidth="0"
            title="Waitlist"
            style={{ borderRadius: 8 }}
          />
        </div>
      </div>
    </div>
  );
}
