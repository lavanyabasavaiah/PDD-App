const fs = require('fs');
const path = require('path');

function generateHtmlReport(testResults, outputPath) {
  const targetPath = outputPath || path.join(__dirname, '../reports/execution-report.html');
  const dir = path.dirname(targetPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const total = testResults.length;
  const passed = testResults.filter(r => r.status === 'PASS').length;
  const failed = testResults.filter(r => r.status === 'FAIL').length;
  const passRate = total > 0 ? ((passed / total) * 100).toFixed(2) : '100.00';

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>VitalTrack Android Appium E2E Execution Report</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #0f172a; color: #f8fafc; margin: 0; padding: 24px; }
    .header { background: #1e293b; padding: 24px; border-radius: 12px; margin-bottom: 24px; border: 1px solid #334155; }
    h1 { margin: 0 0 8px 0; color: #38bdf8; font-size: 24px; }
    .kpi-container { display: flex; gap: 16px; margin-top: 20px; }
    .kpi-card { background: #1e293b; padding: 16px 24px; border-radius: 8px; border: 1px solid #334155; flex: 1; text-align: center; }
    .kpi-value { font-size: 28px; font-weight: bold; margin-top: 6px; }
    .pass-val { color: #4ade80; }
    .fail-val { color: #f87171; }
    .rate-val { color: #38bdf8; }
    table { width: 100%; border-collapse: collapse; background: #1e293b; border-radius: 8px; overflow: hidden; border: 1px solid #334155; }
    th, td { padding: 12px 16px; text-align: left; border-bottom: 1px solid #334155; }
    th { background: #0f172a; color: #94a3b8; font-size: 13px; text-transform: uppercase; }
    .badge { padding: 4px 10px; border-radius: 9999px; font-weight: bold; font-size: 12px; }
    .badge-pass { background: rgba(74,222,128,0.2); color: #4ade80; border: 1px solid #4ade80; }
    .badge-fail { background: rgba(248,113,113,0.2); color: #f87171; border: 1px solid #f87171; }
  </style>
</head>
<body>
  <div class="header">
    <h1>VitalTrack Mobile Android - Appium E2E Execution Report</h1>
    <p style="color: #94a3b8; margin: 0;">Automated Test Suite Execution • Generated on ${new Date().toLocaleString()}</p>
    <div class="kpi-container">
      <div class="kpi-card"><div>Total Tests</div><div class="kpi-value">${total}</div></div>
      <div class="kpi-card"><div>Passed</div><div class="kpi-value pass-val">${passed}</div></div>
      <div class="kpi-card"><div>Failed</div><div class="kpi-value fail-val">${failed}</div></div>
      <div class="kpi-card"><div>Pass Rate</div><div class="kpi-value rate-val">${passRate}%</div></div>
    </div>
  </div>

  <h2>Test Cases Execution Detail (${total} Tests)</h2>
  <table>
    <thead>
      <tr>
        <th>ID</th>
        <th>Category</th>
        <th>Test Case Title</th>
        <th>Expected Result</th>
        <th>Status</th>
        <th>Duration</th>
      </tr>
    </thead>
    <tbody>
      ${testResults.slice(0, 150).map(r => `
        <tr>
          <td>${r.id}</td>
          <td>${r.category}</td>
          <td>${r.title}</td>
          <td>${r.expected}</td>
          <td><span class="badge badge-${r.status.toLowerCase()}">${r.status}</span></td>
          <td>${r.duration} ms</td>
        </tr>
      `).join('')}
    </tbody>
  </table>
  ${total > 150 ? `<p style="color: #94a3b8; text-align: center; margin-top: 16px;">Displaying first 150 of ${total} test cases. Full dataset available in Excel report.</p>` : ''}
</body>
</html>`;

  fs.writeFileSync(targetPath, html, 'utf8');
  console.log(`[HTML REPORTER] Dark styled report generated at: ${targetPath}`);
  return targetPath;
}

module.exports = { generateHtmlReport };
