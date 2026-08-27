import { ReportData } from "./igloo-report";

export function generateReportHtml(data: ReportData): string {
  const { range, generatedAt, sections, medication } = data;

  const sectionsHtml = sections
    .map(
      (sec) => `
    <div class="metric-card">
      <div class="metric-header" style="border-left-color: ${sec.color};">
        <h2>${sec.label}</h2>
        <span class="unit">Average: <strong>${sec.average} ${sec.unit}</strong> (Min: ${sec.min}, Max: ${sec.max})</span>
      </div>
      <p class="ref-text">Reference: ${sec.reference}</p>
      <table>
        <thead>
          <tr>
            <th>Date & Time</th>
            <th>Value</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${sec.rows
            .map(
              (r) => `
            <tr>
              <td>${r.date}, ${r.time}</td>
              <td class="bold">${r.value}</td>
              <td><span class="status-badge" style="background-color: ${r.statusColor};">${r.status}</span></td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>
    </div>
  `
    )
    .join("");

  const medHtml =
    medication.rows.length > 0
      ? `
    <div class="metric-card">
      <div class="metric-header" style="border-left-color: #186787;">
        <h2>Medication Log</h2>
        <span class="unit">Adherence: ${medication.daysLogged} / ${medication.totalDays} days</span>
      </div>
      <table>
        <thead>
          <tr>
            <th>Date & Time</th>
            <th>Medication</th>
            <th>Dose</th>
          </tr>
        </thead>
        <tbody>
          ${medication.rows
            .map(
              (m) => `
            <tr>
              <td>${m.date}, ${m.time}</td>
              <td class="bold">${m.name}</td>
              <td>${m.dose}</td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>
    </div>
  `
      : "";

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            background-color: #ffffff;
            color: #123247;
            padding: 32px;
            margin: 0;
          }
          .header {
            border-bottom: 2px solid #186787;
            padding-bottom: 16px;
            margin-bottom: 24px;
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
          }
          .title {
            font-size: 24px;
            font-weight: bold;
            color: #186787;
            margin: 0;
          }
          .subtitle {
            font-size: 14px;
            color: #5C7E8C;
            margin-top: 4px;
          }
          .meta {
            font-size: 12px;
            color: #5C7E8C;
            text-align: right;
          }
          .metric-card {
            background: #EFF7F9;
            border-radius: 12px;
            padding: 16px;
            margin-bottom: 20px;
          }
          .metric-header {
            border-left: 4px solid #186787;
            padding-left: 10px;
            margin-bottom: 8px;
          }
          .metric-header h2 {
            margin: 0;
            font-size: 18px;
            color: #123247;
          }
          .unit {
            font-size: 13px;
            color: #5C7E8C;
          }
          .ref-text {
            font-size: 11px;
            color: #5C7E8C;
            margin-bottom: 12px;
            font-style: italic;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            background: #ffffff;
            border-radius: 8px;
            overflow: hidden;
          }
          th, td {
            padding: 10px 12px;
            text-align: left;
            font-size: 13px;
            border-bottom: 1px solid #DCEAEE;
          }
          th {
            background: #E3F1F5;
            color: #186787;
            font-weight: bold;
          }
          .bold {
            font-weight: bold;
          }
          .status-badge {
            color: #ffffff;
            font-size: 10px;
            font-weight: bold;
            padding: 2px 8px;
            border-radius: 12px;
            display: inline-block;
          }
          .footer {
            margin-top: 32px;
            text-align: center;
            font-size: 11px;
            color: #5C7E8C;
            border-t: 1px solid #DCEAEE;
            padding-top: 16px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <h1 class="title">Igloo Doctor's Summary Report</h1>
            <div class="subtitle">Patient Vitals & Medication History</div>
          </div>
          <div class="meta">
            <div><strong>Period:</strong> ${range.label}</div>
            <div><strong>Generated:</strong> ${generatedAt.toLocaleDateString()}</div>
          </div>
        </div>

        ${sectionsHtml}
        ${medHtml}

        <div class="footer">
          Generated with Igloo Warm Pulse • Confidential Medical Record
        </div>
      </body>
    </html>
  `;
}
