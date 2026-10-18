import { forwardRef } from "react";

const BLUE = "#1f3fae";
const RED = "#e0262d";
const line = `1.5px solid ${BLUE}`;
const PRICE_INCLUDES_GST = false; // true = product price la GST already irukku
const r2 = (n) => Math.round((Number(n) + Number.EPSILON) * 100) / 100;

const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
  "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

const below100 = (n) => (n < 20 ? ones[n] : `${tens[Math.floor(n / 10)]} ${ones[n % 10]}`.trim());

export function amountInWords(amount) {
  const rupees = Math.floor(amount);
  const paise = Math.round((amount - rupees) * 100);
  if (rupees === 0 && paise === 0) return "Zero Only";

  const parts = [];
  const crore = Math.floor(rupees / 10000000);
  const lakh = Math.floor((rupees % 10000000) / 100000);
  const thousand = Math.floor((rupees % 100000) / 1000);
  const hundred = Math.floor((rupees % 1000) / 100);
  const rest = rupees % 100;

  if (crore) parts.push(`${below100(crore)} Crore`);
  if (lakh) parts.push(`${below100(lakh)} Lakh`);
  if (thousand) parts.push(`${below100(thousand)} Thousand`);
  if (hundred) parts.push(`${ones[hundred]} Hundred`);
  if (rest) parts.push(below100(rest));

  let words = parts.join(" ");
  if (paise) words += ` and ${below100(paise)} Paise`;
  return `${words} Only`;
}

const fmt = (v) => Number(v || 0).toFixed(2);
const th = { borderRight: line, borderBottom: line, padding: "6px 4px", textAlign: "center", fontWeight: "bold" };
const td = { borderRight: line, padding: "6px 6px", fontSize: 17 };

const BillInvoice = forwardRef(({ bill, items }, ref) => {
  if (!bill) return null;

  const rows = items.map((item) => {
    const qty = Number(item.quantity || 0);
    const rate = Number(item.unitPrice ?? item.price ?? item.sellingPrice ?? 0);
    const amount = Number(item.subtotal ?? item.totalPrice ?? qty * rate);
    const name = item.product?.name ?? item.productName ?? item.product?.productName ?? "Product";
    return { name, qty, rate, amount };
  });

  const itemsTotal = r2(rows.reduce((s, r) => s + r.amount, 0));
const GST_RATE = Number(bill.gstRate ?? 18);

let taxable, cgst, sgst, total;

if (PRICE_INCLUDES_GST) {
  total = itemsTotal;
  taxable = r2(total / (1 + GST_RATE / 100));
  cgst = r2((total - taxable) / 2);
  sgst = r2(total - taxable - cgst);
} else {
  taxable = itemsTotal;
  cgst = r2((taxable * GST_RATE) / 200);
  sgst = r2((taxable * GST_RATE) / 200);
  total = r2(taxable + cgst + sgst);
}
  const emptyRows = Math.max(0, 10 - rows.length);

  return (
    <div
      ref={ref}
      style={{
        width: 780, background: "#fff", color: BLUE, padding: 10,
        fontFamily: "Arial, sans-serif", boxSizing: "border-box",
      }}
    >
      {/* Header */}
      <div style={{ border: line, padding: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ width: 150, textAlign: "center", fontSize: 13, fontWeight: "bold" }}>
          வாழ்க வளமுடன்
          <div style={{ fontSize: 54, fontWeight: "bold", border: `3px solid ${BLUE}`, width: 70, margin: "4px auto" }}>R</div>
        </div>

        <div style={{ textAlign: "center", flex: 1 }}>
          <div style={{ color: RED, fontSize: 52, fontWeight: 900, letterSpacing: 1, lineHeight: 1 }}>ROBOTICS</div>
          <div style={{ fontSize: 22, fontWeight: "bold", letterSpacing: 3 }}>COMPUTER SERVICES</div>
          <div style={{ background: BLUE, color: "#fff", fontSize: 20, fontWeight: "bold", padding: "2px 10px", display: "inline-block" }}>
            CCTV Camera, Sales &amp; Service
          </div>
        </div>

        <div style={{ textAlign: "right", fontSize: 14, fontWeight: "bold", width: 190 }}>
          <div style={{ fontSize: 17 }}>Cell : 93600 23679</div>
          <div>E-mail : robo1515@yahoo.com</div>
          <div>GSTIN : 33AIDPR8362H1Z2</div>
        </div>
      </div>

      <div style={{ border: line, borderTop: "none", padding: "4px 8px", fontSize: 13, fontWeight: "bold", textAlign: "center" }}>
        64, Gandhi Road, Kanupparayan Kovil Southside, Near B.M. Ortho Hospital, Periyar Colony, Tirupur - 641 652.
      </div>

      <div style={{ border: line, margin: "6px 0", padding: "4px 8px", fontSize: 14, fontWeight: "bold" }}>
        Special Service For : Laptop, Mother Boards, Monitors, SMPS, Printers, UPS, Adapter and All Peripherals
      </div>

      {/* Customer + Bill No */}
      <div style={{ display: "flex", gap: 6 }}>
        <div style={{ flex: 1, border: line, padding: 10, fontSize: 18, fontWeight: "bold" }}>
          <div>To, M/s. <span style={{ fontWeight: "normal" }}>{bill.customerName || ""}</span></div>
          <div style={{ marginTop: 8, fontWeight: "normal", fontSize: 15 }}>
            {bill.customerPhone ? `Ph: ${bill.customerPhone}` : "\u00A0"}
          </div>
        </div>
        <div style={{ width: 270, border: line, fontWeight: "bold" }}>
          <div style={{ borderBottom: line, padding: "4px 8px", fontSize: 18 }}>CASH / SERVICE BILL</div>
          <div style={{ padding: "4px 8px", fontSize: 18 }}>
            No &nbsp;&nbsp;: <span style={{ color: "#000", fontSize: 24, marginLeft: 8 }}>{bill.billNumber}</span>
          </div>
          <div style={{ padding: "4px 8px", fontSize: 18 }}>
            Date : <span style={{ color: "#000", fontSize: 20, marginLeft: 8 }}>
              {bill.billDate ? new Date(bill.billDate).toLocaleDateString("en-GB") : ""}
            </span>
          </div>
        </div>
      </div>

      {/* Items table */}
      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 6, border: line }}>
        <thead>
          <tr>
            <th style={th} rowSpan={2}>S.No.</th>
            <th style={th} rowSpan={2}>Description</th>
            <th style={th} rowSpan={2}>Qty</th>
            <th style={th} colSpan={2}>Rate</th>
            <th style={{ ...th, borderRight: "none" }} colSpan={2}>Amount</th>
          </tr>
          <tr>
            <th style={{ ...th, fontSize: 12 }}>Rs.</th>
            <th style={{ ...th, fontSize: 12 }}>Ps.</th>
            <th style={{ ...th, fontSize: 12 }}>Rs.</th>
            <th style={{ ...th, fontSize: 12, borderRight: "none" }}>Ps.</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              <td style={{ ...td, textAlign: "center" }}>{i + 1}</td>
              <td style={td}>{r.name}</td>
              <td style={{ ...td, textAlign: "center" }}>{r.qty}</td>
              <td style={{ ...td, textAlign: "right" }}>{fmt(r.rate)}</td>
              <td style={{ ...td, textAlign: "center", fontSize: 14 }}>00</td>
              <td style={{ ...td, textAlign: "right" }}>{fmt(r.amount)}</td>
              <td style={{ ...td, textAlign: "center", fontSize: 14, borderRight: "none" }}>00</td>
            </tr>
          ))}

          {Array.from({ length: emptyRows }).map((_, i) => (
            <tr key={`e${i}`}>
              {[...Array(7)].map((_, c) => (
                <td key={c} style={{ ...td, height: 30, borderRight: c === 6 ? "none" : line }}>&nbsp;</td>
              ))}
            </tr>
          ))}

<tr style={{ borderTop: line }}>
  <td style={td}></td>
  <td style={{ ...td, textAlign: "right", fontSize: 15, fontWeight: "bold" }}>
    Taxable Amount
  </td>
  <td style={td}></td><td style={td}></td><td style={td}></td>
  <td style={{ ...td, textAlign: "right" }}>{fmt(taxable)}</td>
  <td style={{ ...td, textAlign: "center", fontSize: 14, borderRight: "none" }}>00</td>
</tr>

      {[
  ["CGST", cgst],
  ["SGST", sgst],
].map(([label, val]) => (
  <tr key={label} style={{ borderTop: line }}>
    <td style={td}></td>

    <td
      style={{
        ...td,
        textAlign: "right",
        fontSize: 15,
        fontWeight: "bold",
      }}
    >
      {label} ......... {GST_RATE / 2}%
    </td>

    <td style={td}></td>
    <td style={td}></td>
    <td style={td}></td>

    <td style={{ ...td, textAlign: "right" }}>
      {fmt(val)}
    </td>

    <td
      style={{
        ...td,
        textAlign: "center",
        fontSize: 14,
        borderRight: "none",
      }}
    >
      00
    </td>
  </tr>
))}

          <tr style={{ borderTop: line }}>
            <td style={td}></td>
            <td style={{ ...td, fontWeight: "bold", fontSize: 14 }}>
              E. &amp; O.E.
              <span style={{ float: "right", fontSize: 17 }}>Total</span>
            </td>
            <td style={td}></td><td style={td}></td><td style={td}></td>
            <td style={{ ...td, textAlign: "right", fontWeight: "bold", fontSize: 20, color: "#000" }} colSpan={2}>
              ₹ {total.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </td>
          </tr>
        </tbody>
      </table>

      {/* Amount in words */}
      <div style={{ border: line, marginTop: 8, padding: "10px 10px", fontSize: 16, fontWeight: "bold" }}>
        Amount in Words :{" "}
        <span style={{ fontWeight: "normal", fontSize: 20, marginLeft: 20, color: "#000" }}>
          {amountInWords(total)}
        </span>
      </div>

      {/* Footer */}
      <div style={{ border: line, marginTop: 8, padding: 10, display: "flex", justifyContent: "space-between", fontSize: 15 }}>
        <div style={{ lineHeight: "36px" }}>
          Material Received<br />Customer Signature
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ color: RED, fontWeight: "bold" }}>For ROBOTICS COMPUTER SERVICES</div>
          <div style={{ marginTop: 30 }}>Authorised Signatory</div>
        </div>
      </div>
    </div>
  );
});

export default BillInvoice;