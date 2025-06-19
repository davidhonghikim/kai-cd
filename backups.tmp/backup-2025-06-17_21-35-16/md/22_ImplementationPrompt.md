# Implementation Prompt for ChatDemon-Cursor Enhancement

## Context Loading Commands
```bash
# Load all context files
cat md/00_Index.md
cat md/01_ProjectOverview.md
cat md/02_ArchitectureTechStack.md
cat md/03_DevelopmentTesting.md
cat md/04_UserGuide.md
cat md/05_AgentProtocol.md
cat md/06_BackupMaintenance.md
cat md/07_ContributingGuide.md
cat md/08_ReleaseProcess.md
cat md/09_Troubleshooting.md
cat md/10_Shortcuts.md
cat md/11_DevelopmentResources.md
cat md/12_BestPractices.md
cat md/14_ProjectManagement.md
cat md/15_UpdateGuide.md
cat md/16_ServicesLLMs.md
cat md/17_ServicesImageGen.md
cat md/18_ServicesAutomation.md
cat md/19_ServicesVectorSearch.md
cat md/20_ProjectStructure.md
cat md/22_AgentJournal.md
cat md/23_CurrentIssues.md
cat md/24_ROADMAP.md
cat md/25_AdvancedSettings.md
cat md/26_ImplementationTasks.md
```

## Implementation Protocol

### 1. Pre-Implementation Checks
- [ ] Verify current directory is project root
- [ ] Check git status and ensure clean working directory
- [ ] Create backup of current state
- [ ] Install/update all dependencies
- [ ] Run existing tests to establish baseline

### 2. Task Processing Flow
For each task in `26_ImplementationTasks.md`:
1. Create feature branch
2. Implement changes
3. Run tests
4. Build extension
5. Update documentation
6. Create backup
7. Commit changes
8. Push to repository
9. Create pull request
10. Review and merge

### 3. Quality Assurance Steps
- Run all tests after each component completion
- Check for linting errors
- Verify documentation updates
- Ensure backups are created
- Validate code formatting
- Test performance metrics

### 4. Build and Test Commands
```bash
# Install dependencies
npm install

# Run tests
npm test

# Build extension
npm run build

# Check linting
npm run lint

# Create backup
./scripts/backup.sh

# Run performance tests
npm run test:performance
```

### 5. Documentation Update Commands
```bash
# Update API documentation
npm run docs:api

# Update component documentation
npm run docs:components

# Update architecture documentation
npm run docs:architecture
```

### 6. Error Handling Protocol
1. Log all errors
2. Attempt automatic fixes
3. If automatic fix fails, document issue
4. Create backup of current state
5. Revert to last stable state if necessary
6. Continue with next task

### 7. Progress Tracking
- Maintain checklist of completed tasks
- Document any issues encountered
- Track performance metrics
- Update implementation status

### 8. Success Criteria Verification
- All UI components match Open-WebUI quality
- Server management is fully functional
- All tests pass
- Documentation is complete
- No known bugs
- Performance meets or exceeds requirements

## Autopilot Mode Rules
1. Never stop unless:
   - All tasks are completed
   - Build is successful
   - Documentation is updated
   - Backup script has run
   - Project is error-free
   - All requirements are met
2. Show console window and monitor progress
3. Provide updates on progress
4. Keep file sizes below 150 lines
5. Break code into smaller reusable modules
6. Check for existing files/directories before creation
7. Maintain edit logs for potential rollback
8. Commit to git after error-free code
9. Create backups in /src/backup

## Implementation Order
1. UI/UX Enhancement
   - Dark theme implementation
   - Server Manager UI improvements
   - Component modernization
2. Backend Enhancements
   - Server management
   - API integration
3. Testing & Quality Assurance
   - Unit tests
   - Performance testing
4. Documentation
   - Technical documentation
   - User documentation

## Monitoring Commands
```bash
# Monitor logs
tail -f logs/*.log

# Monitor test results
npm run test:watch

# Monitor build process
npm run build:watch

# Monitor performance
npm run perf:monitor
```

## Emergency Stop Conditions
1. Unrecoverable error
2. Explicit user instruction
3. Required user input
4. System resource exhaustion
5. Security vulnerability detection

## Recovery Protocol
1. Create backup of current state
2. Document current progress
3. Log all errors
4. Attempt automatic recovery
5. If recovery fails, wait for user input 