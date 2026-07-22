const path = require('path');
const excelReporter = require('./generateExcelReport.js');
const { generateHtmlReport } = require('./generateHtmlReport.js');
const { appendToStepSummary } = require('./generateSummary.js');

async function generateFallbackReport() {
  console.log('[FALLBACK REPORTER] Generating early termination fallback report...');

  excelReporter.startRun();
  excelReporter.recordTest({
    id: 'TC-FALLBACK-001',
    category: 'System',
    module: 'Runner',
    title: 'Verify WDIO / Appium Runner startup and execution',
    expected: 'WDIO test runner executes cleanly',
    actual: 'WDIO runner terminated early or encountered fatal environment exception',
    status: 'FAIL',
    duration: 15,
    error: 'Early exit fallback report triggered'
  });

  const reportPath = path.join(__dirname, '../reports/Mobile_Appium_E2E_Test_Report.xlsx');
  await excelReporter.generateReport(reportPath);
  generateHtmlReport(excelReporter.testResults);
  appendToStepSummary(excelReporter.testResults);
}

if (require.main === module) {
  generateFallbackReport().catch(console.error);
}

module.exports = { generateFallbackReport };
