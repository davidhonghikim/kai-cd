# Test Report

## Overview

This report contains the results of running the test suite for the ChatDemon application. The test suite includes both Jest tests for TypeScript/JavaScript code and shell script tests for the backup functionality.

## Test Summary

- Total Tests: {{totalTests}}
- Passed: {{passedTests}}
- Failed: {{failedTests}}
- Skipped: {{skippedTests}}
- Coverage: {{coverage}}%

## Jest Tests

### Coverage Report

The detailed coverage report is available at: `reports/coverage/index.html`

#### Summary

- Statements: {{statementsCoverage}}%
- Branches: {{branchesCoverage}}%
- Functions: {{functionsCoverage}}%
- Lines: {{linesCoverage}}%

### Test Suites

{{#each testSuites}}
#### {{name}}

- Total Tests: {{totalTests}}
- Passed: {{passedTests}}
- Failed: {{failedTests}}
- Duration: {{duration}}ms

{{#if failedTests}}
##### Failed Tests

{{#each failedTests}}
- {{name}}
  - Error: {{error}}
  - Stack: {{stack}}
{{/each}}
{{/if}}
{{/each}}

## Shell Script Tests

### Backup Script Tests

- Total Tests: {{backupScriptTests.total}}
- Passed: {{backupScriptTests.passed}}
- Failed: {{backupScriptTests.failed}}

{{#if backupScriptTests.failed}}
#### Failed Tests

{{#each backupScriptTests.failedTests}}
- {{name}}
  - Error: {{error}}
{{/each}}
{{/if}}

## Performance Metrics

- Total Test Duration: {{totalDuration}}ms
- Average Test Duration: {{averageDuration}}ms
- Slowest Test: {{slowestTest.name}} ({{slowestTest.duration}}ms)

## Environment

- Node.js Version: {{nodeVersion}}
- npm Version: {{npmVersion}}
- Operating System: {{os}}
- Test Date: {{testDate}}

## Recommendations

{{#if failedTests}}
### Failed Tests

The following areas need attention:

{{#each failedTests}}
1. {{name}}
   - Issue: {{issue}}
   - Recommendation: {{recommendation}}
{{/each}}
{{/if}}

### Coverage Improvements

The following areas could benefit from additional test coverage:

{{#each coverageImprovements}}
1. {{name}}
   - Current Coverage: {{currentCoverage}}%
   - Target Coverage: {{targetCoverage}}%
   - Recommendation: {{recommendation}}
{{/each}}

## Next Steps

1. Address failed tests
2. Improve test coverage in identified areas
3. Review and update test cases
4. Consider adding more edge cases
5. Optimize test performance

## Appendix

### Test Configuration

```json
{{testConfig}}
```

### Test Environment Variables

```bash
{{testEnvVars}}
```

### Test Dependencies

```json
{{testDependencies}}
``` 