"use client";

import Button from "../../../../components/ui/Button";
import { formatBaht } from "../../sampleData";
import {
  smartBudgetDisclaimer,
  type SmartBudgetReport,
} from "../../lib/smartBudget";

type Props = {
  report: SmartBudgetReport;
  workspaceName: string;
};

/**
 * Export Smart Budget as print → PDF (browser). No investment figures.
 */
export default function SmartBudgetExportButton({
  report,
  workspaceName,
}: Props) {
  function exportPdf() {
    const w = window.open("", "_blank", "noopener,noreferrer,width=800,height=900");
    if (!w) return;

    const rows = report.buckets
      .map(
        (b) => `
      <tr>
        <td>${escapeHtml(b.label)}</td>
        <td style="text-align:right">${b.count}</td>
        <td style="text-align:right">${formatBaht(b.estimated)}</td>
        <td style="text-align:right">${formatBaht(b.actual)}</td>
        <td style="text-align:right">${formatBaht(b.need)}</td>
        <td style="text-align:right">${
          b.variancePct == null ? "—" : `${b.variancePct}%`
        }</td>
      </tr>`
      )
      .join("");

    const html = `<!doctype html>
<html lang="th">
<head>
  <meta charset="utf-8" />
  <title>Smart Budget — ${escapeHtml(workspaceName)}</title>
  <style>
    body { font-family: "Noto Sans Thai", system-ui, sans-serif; padding: 24px; color: #1a1a1a; }
    h1 { font-size: 20px; margin: 0 0 4px; }
    .muted { color: #666; font-size: 12px; margin-bottom: 16px; }
    table { width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 13px; }
    th, td { border: 1px solid #ddd; padding: 8px; }
    th { background: #f3f3f0; text-align: left; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin: 16px 0; }
    .card { border: 1px solid #ddd; border-radius: 8px; padding: 10px; }
    .label { font-size: 11px; color: #666; }
    .value { font-size: 16px; font-weight: 600; margin-top: 4px; }
    @media print { body { padding: 0; } }
  </style>
</head>
<body>
  <h1>Smart Budget — ${escapeHtml(workspaceName)}</h1>
  <p class="muted">${escapeHtml(smartBudgetDisclaimer())}</p>
  <div class="grid">
    <div class="card"><div class="label">ประเมินรวม</div><div class="value">${formatBaht(report.estimatedTotal)}</div></div>
    <div class="card"><div class="label">ซื้อจริง</div><div class="value">${formatBaht(report.actualTotal)}</div></div>
    <div class="card"><div class="label">ยังต้องจัดหา</div><div class="value">${formatBaht(report.needTotal)}</div></div>
    <div class="card"><div class="label">Difference / Variance</div><div class="value">${
      report.difference > 0 ? "+" : ""
    }${formatBaht(report.difference)} · ${
      report.variancePct == null ? "—" : `${report.variancePct}%`
    }</div></div>
  </div>
  <table>
    <thead>
      <tr>
        <th>หมวด</th>
        <th>รายการ</th>
        <th>ประเมิน</th>
        <th>จริง</th>
        <th>ค้างจัดหา</th>
        <th>Variance</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>
  <p class="muted" style="margin-top:16px">สร้างจาก Checklist · ${report.itemCount} รายการ · ${new Date().toLocaleString("th-TH")}</p>
  <script>window.onload = function () { window.print(); }</script>
</body>
</html>`;

    w.document.open();
    w.document.write(html);
    w.document.close();
  }

  return (
    <Button type="button" fullWidth className="min-h-[2.75rem]" onClick={exportPdf}>
      Export PDF
    </Button>
  );
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
