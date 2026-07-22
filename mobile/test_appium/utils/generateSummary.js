const fs = require('fs');

function appendToStepSummary(testResults) {
  const summaryFile = process.env.GITHUB_STEP_SUMMARY;
  if (!summaryFile) {
    console.log('[SUMMARY] GITHUB_STEP_SUMMARY environment variable not present. Skipping GHA summary append.');
    return;
  }

  const total = testResults.length;
  const passed = testResults.filter(r => r.status === 'PASS').length;
  const failed = testResults.filter(r => r.status === 'FAIL').length;
  const passRate = total > 0 ? ((passed / total) * 100).toFixed(2) : '100.00';
  const isDeployable = failed === 0;

  const md = `
## 📱 VitalTrack Mobile Android Appium E2E Test Execution Summary

| Metric | Value |
| :--- | :--- |
| **Total Tests Executed** | **${total}** |
| **Passed Tests** | **${passed}** ✅ |
| **Failed Tests** | **${failed}** ${failed > 0 ? '❌' : ''} |
| **Overall Pass Rate** | **${passRate}%** |
| **Deployable Status** | **${isDeployable ? 'APPROVED FOR PRODUCTION DEPLOYMENT ✅' : 'BLOCKED ❌'}** |

### Category Breakdown Summary

| Category | Total Tests | Passed | Failed | Pass Rate |
| :--- | :---: | :---: | :---: | :---: |
${Array.from(new Set(testResults.map(r => r.category))).map(cat => {
  const catTests = testResults.filter(r => r.category === cat);
  const cTotal = catTests.length;
  const cPass = catTests.filter(r => r.status === 'PASS').length;
  const cFail = catTests.filter(r => r.status === 'FAIL').length;
  const cRate = cTotal > 0 ? ((cPass / cTotal) * 100).toFixed(1) : '100.0';
  return `| **${cat}** | ${cTotal} | ${cPass} | ${cFail} | ${cRate}% |`;
}).join('\n')}
`;

  try {
    fs.appendFileSync(summaryFile, md, 'utf8');
    console.log('[SUMMARY] Appended test execution summary to GITHUB_STEP_SUMMARY.');
  } catch (err) {
    console.error('[SUMMARY] Failed to write to GITHUB_STEP_SUMMARY:', err.message);
  }
}

module.exports = { appendToStepSummary };
