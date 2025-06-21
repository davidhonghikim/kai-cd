# Agent Prompt: Documentation Migration & Quality Assurance Project

## Mission Overview
You are taking over a comprehensive documentation migration project for the Kai-CD system. Your primary mission is to ensure the documentation system becomes the **ultimate source of truth** for all humans and agents working on this project.

## Critical Context
The previous agent has completed some of the documentation migration from `documentation/brainstorm/kOS/` to a structured documentation system. However, you must assume there are **inconsistencies, missing information, and structural issues** that need identification and correction.

## Your Immediate Tasks

### 1. **Comprehensive Source Analysis**
Read and analyze ALL markdown files in these directories:
- `documentation/brainstorm/kOS/` (111 files - source material)
- `documentation/current/` (existing Kai-CD implementation docs)
- `documentation/future/` (kOS vision architecture docs)
- `documentation/bridge/` (evolution strategy docs)
- `documentation/reference/` (quick lookup resources)
- `documentation/agents/` (agent-specific documentation)

### 2. **Quality Assurance Review**
Identify and document:
- **Structural inconsistencies** in directory organization
- **Naming convention violations** (should be `##_Title_Case_With_Underscores.md`)
- **Missing frontmatter** or incomplete YAML metadata
- **Absent Agent Context blocks** in documents
- **Incomplete technical specifications** or oversimplified content
- **Broken cross-references** between documents
- **Missing implementation details** that should be preserved

### 3. **Content Completeness Audit**
Ensure ALL documentation includes:
- **Comprehensive TypeScript implementation examples**
- **Detailed API specifications**
- **Complete architectural diagrams and explanations**
- **Full protocol specifications**
- **Low-level implementation details**
- **Code references to actual implementation**

### 4. **Standards Compliance Verification**
Every document MUST have:
- **Frontmatter**: YAML metadata with title, description, type, status, etc.
- **Agent Context**: Specific guidance blocks for AI agents
- **Implementation Status**: Clear indicators (current/future/theoretical)
- **Cross-References**: Links to related documents
- **Technical Depth**: ALL low-level details preserved

## Critical User Requirements

### **Absolute Mandate**
"we need all the low level details! this is the source of truth for all different agents and people to work on at various times. we need everyone aligned no matter what and not creating their own processes"

### **Non-Negotiable Requirements**:
1. **ALL low-level implementation details must be preserved**
2. **Comprehensive TypeScript examples required in every technical document**
3. **Documentation serves as source of truth for multiple development teams**
4. **NO simplification allowed - maintain full technical complexity**
5. **Agent alignment critical for consistent development approach**

## Documentation System Standards

### **Directory Structure**:
```
documentation/
├── current/        # Existing Kai-CD implementation
│   ├── architecture/
│   ├── components/
│   ├── deployment/
│   ├── governance/
│   ├── implementation/
│   ├── security/
│   └── services/
├── future/         # kOS vision architecture
│   ├── agents/
│   ├── architecture/
│   ├── protocols/
│   ├── services/
│   └── [other dirs]
├── bridge/         # Evolution strategy
└── reference/      # Quick lookup
```

### **Naming Convention**:
- Format: `##_Title_Case_With_Underscores.md`
- Keep acronyms ALL CAPS (KLP, API, UI, kOS)
- Sequential numbering within directories
- Descriptive but concise titles

### **Required Frontmatter Template**:
```yaml
---
title: "Document Title"
description: "Brief description"
type: "architecture|implementation|guide|reference"
status: "current|future|bridge"
priority: "high|medium|low"
last_updated: "YYYY-MM-DD"
related_docs: ["path/to/related.md"]
implementation_status: "implemented|planned|theoretical"
---
```

## Mandatory Workflow Protocol

### **Two-Edit Rule**:
After making 1-2 significant changes, you **MUST STOP** and perform a mid-progress review:
1. Read entire files you've modified
2. Trace logic flow and check for errors
3. Verify technical completeness
4. Fix any identified issues
5. Document findings in your execution plan

### **Build Verification**:
Run `npm run build` after each logical unit of work to ensure no regressions.

### **Documentation Requirements**:
- Update `documentation/agents/03_Execution_Plan.md` with detailed progress
- Follow standards in `documentation/00_DOCUMENTATION_SYSTEM.md`
- Maintain agent-first design principles

## Your Deliverables

### **Phase 1: Analysis & Recommendations**
1. **Comprehensive audit report** of current documentation state
2. **Gap analysis** identifying missing or incomplete content
3. **Structural recommendations** for fixes and improvements
4. **Priority matrix** for addressing identified issues
5. **Detailed implementation plan** for corrections

### **Phase 2: Implementation Planning**
1. **Step-by-step plan** for addressing all identified issues
2. **Resource requirements** and time estimates
3. **Risk assessment** and mitigation strategies
4. **Quality assurance checkpoints**

## Success Criteria

Your work is successful when:
- [ ] ALL 111+ brainstorm documents have been properly migrated or accounted for
- [ ] Directory structure follows established conventions perfectly
- [ ] Every document has complete frontmatter and Agent Context blocks
- [ ] ALL technical specifications include comprehensive TypeScript examples
- [ ] Cross-reference system is complete and accurate
- [ ] Build stability maintained throughout process
- [ ] Documentation serves as definitive source of truth

## Critical Warnings

### **What NOT to Do**:
- ❌ Do not simplify or remove technical details
- ❌ Do not create files outside documentation directories
- ❌ Do not skip frontmatter or Agent Context blocks
- ❌ Do not break existing cross-references
- ❌ Do not assume previous work is correct without verification

### **What TO Do**:
- ✅ Preserve ALL implementation details
- ✅ Maintain comprehensive TypeScript examples
- ✅ Follow established naming conventions exactly
- ✅ Verify every document meets quality standards
- ✅ Update execution plan with detailed progress logs

## Starting Point

Begin by reading:
1. `documentation/00_DOCUMENTATION_SYSTEM.md` - System standards
2. `documentation/01_AGENT_GUIDE.md` - Agent-specific guidance
3. `documentation/agents/03_Execution_Plan.md` - Previous work log
4. `documentation/agents/06_Handoff_Note.md` - Critical context

Then perform your comprehensive analysis of all source and destination directories.

**Remember**: This documentation will be used by multiple development teams and AI agents. It must be absolutely comprehensive, technically accurate, and serve as the definitive source of truth for the entire project.

---

**Your first action should be to acknowledge this mission and begin your comprehensive analysis. Do not proceed with any changes until you have completed your full audit and presented your findings and recommendations.** 