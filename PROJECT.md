# Battlepoos - AI Development Guide

**Last Updated:** 2025-12-18  
**Current Phase:** Phase 1 - Playable Core  
**Current Task:** Issue #1 - Fix Game Over State  
**Status:** Ready to start

---

## How to Use This File

**For Human (Wayne):**
- Update `Current Task` when starting new work
- Mark issues complete in Progress Tracker
- Add learnings to Decision Log
- Point AIs to specific issue docs: "Continue with Issue #2, see `/docs/issues/02-ship-rotation.md`"

**For AI Assistants:**
1. Read this file first to understand project state
2. Check Progress Tracker to see what's done
3. Navigate to current task's issue doc in `/docs/issues/`
4. Follow implementation spec exactly
5. Update Progress Tracker when complete
6. Note any deviations or blockers in Decision Log

---

## Project Overview

**Goal:** Polish Antigravity-generated Battlepoos game to playable, professional quality

**Constraints:**
- Low time cost (optimize for learning, not perfection)
- Functional before pretty (playable > visual polish > engagement features)
- Test incrementally (validate after each issue)

**Target Audience:** Wayne's sons playing on mobile devices

**Portfolio Value:** "80% solution in 1 hour with AI, systematically refined to 95%"

---

## Progress Tracker

### Phase 1: Playable Core (CURRENT PHASE)
**Goal:** Full game loop functional, core mechanics complete  
**Est. Total:** 4-7 hours

- [x] **Issue #1:** Fix Game Over State (1-2h) → `/docs/issues/01-game-over-state.md`
  - Status: COMPLETE
  - Assigned to: Claude Code
  - Completed: 2025-12-19
  - Notes: Winner/loser differentiation, Play Again, Return to Lobby all implemented
  
- [ ] **Issue #2:** Implement Ship Rotation (2-4h) → `/docs/issues/02-ship-rotation.md`
  - Status: NOT STARTED
  - Assigned to: TBD
  - Blockers: None (Issue #1 complete)
  
- [x] **Issue #3:** Add Restart Button (1h) → `/docs/issues/03-restart-button.md`
  - Status: COMPLETE (implemented with Issue #1)
  - Assigned to: Claude Code
  - Completed: 2025-12-19
  - Notes: Play Again button implemented as part of GameOver component

**Phase 1 Exit Criteria:**
- [x] Two players can complete full game (placement → play → game over → restart)
- [x] Winner/loser see correct messages
- [ ] Ships can be rotated during placement
- [x] Game can be restarted without browser refresh

---

### Phase 2: Visual Polish
**Goal:** Centered layout, professional appearance  
**Est. Total:** 5-7 hours

- [ ] **Issue #4:** Center Layout & Spacing (2-3h) → `/docs/issues/04-center-layout.md`
  - Status: NOT STARTED
  - Assigned to: TBD
  - Blockers: None (can start independently)
  
- [ ] **Issue #5:** Visual Design Overhaul (3-4h) → `/docs/issues/05-visual-design.md`
  - Status: NOT STARTED
  - Assigned to: TBD
  - Blockers: Should follow Issue #4 for best results

**Phase 2 Exit Criteria:**
- [ ] Game centered on screen (desktop & mobile)
- [ ] Cohesive color palette applied
- [ ] Professional fonts replace defaults
- [ ] Non-emoji icons/graphics
- [ ] Responsive on 320px-1920px viewports

---

### Phase 3: Engagement Features
**Goal:** Names, scoring, sound - makes it replayable  
**Est. Total:** 7-10 hours

- [ ] **Issue #6:** Player Name Entry (2-3h) → `/docs/issues/06-player-names.md`
  - Status: NOT STARTED
  - Assigned to: TBD
  - Decision needed: localStorage vs server-side storage
  
- [ ] **Issue #7:** Scoring System (3-4h) → `/docs/issues/07-scoring-system.md`
  - Status: NOT STARTED
  - Assigned to: TBD
  - Depends on: Issue #6 (player names)
  
- [x] **Issue #8:** Sound Effects (2-3h) → `/docs/issues/08-sound-effects.md`
  - Status: COMPLETE
  - Assigned to: Claude Code
  - Completed: 2025-12-19
  - Implementation: Used Mixkit.co free sound library
  - Notes: Mute toggle added to all screens, sounds respect tab focus

**Phase 3 Exit Criteria:**
- [ ] Players can enter custom names
- [ ] Wins tracked across games (persists in browser)
- [x] Sound effects for key moments (with mute toggle)
- [ ] User tested with target audience (Wayne's sons)

---

## Current Repository Structure

```
Battlepoos/
├── client/              # React frontend (TypeScript)
│   ├── src/
│   │   ├── components/  # Game UI components (.tsx)
│   │   ├── ...
├── server/              # Node.js backend (TypeScript)
│   ├── src/
│   │   ├── game-logic/  # Authoritative game state
│   │   ├── ...
├── docs/                # AI implementation guides
│   ├── issues/          # Detailed specs for each GitHub issue
│   │   ├── 01-game-over-state.md
│   │   ├── 02-ship-rotation.md
│   │   ├── ...
│   └── architecture.md  # High-level system design (reference)
├── PROJECT.md           # This file (master plan)
└── README.md            # Public-facing project description
```

---

## Key Files Reference

**Game State Management:**
- Location: TBD (AI should identify and document here)
- Purpose: Authoritative server-side game state
- Note: Both client and server have state; server is source of truth

**Game Over Logic:**
- Location: TBD (likely `client/src/components/GameOver.tsx` or similar)
- Current issue: Both players see "Winner" message
- Target: Differentiate winner/loser, add restart/home buttons

**Ship Placement:**
- Location: TBD (likely `client/src/components/ShipPlacement.tsx`)
- Current issue: No rotation during placement
- Target: Add rotation control (tap/button), validate bounds

---

## AI Handoff Protocol

### Starting a New Issue

1. **Read issue doc:** `/docs/issues/XX-issue-name.md`
2. **Understand acceptance criteria:** What defines "done"?
3. **Check dependencies:** Are prerequisite issues complete?
4. **Identify files:** Locate relevant components/modules
5. **Plan approach:** Outline changes before coding

### During Implementation

1. **Make minimal changes:** Only what's needed for this issue
2. **Preserve existing functionality:** Don't break working features
3. **Test incrementally:** Validate changes as you go
4. **Document assumptions:** Note any unclear requirements
5. **Flag blockers early:** Don't spin wheels; ask for clarification

### Completing an Issue

1. **Verify acceptance criteria:** All checkboxes met?
2. **Test edge cases:** What could break this?
3. **Update Progress Tracker:** Mark issue complete, note duration
4. **Document learnings:** Add to Decision Log below
5. **Commit with clear message:** "Issue #X: Brief description of changes"

### When Stuck

1. **Document the blocker:** What specifically is unclear or broken?
2. **Propose alternatives:** What are possible approaches?
3. **Ask specific questions:** "Should restart require confirmation?" not "How do I code this?"
4. **Link context:** Reference lines of code, error messages, console output

---

## Decision Log

**Purpose:** Record key decisions, surprises, and learnings for portfolio narrative

### 2025-12-18: Project Setup
- **Decision:** Polish existing code rather than rebuild from scratch
- **Rationale:** Code structure is modular (client/server separation, .tsx components identifiable). Goal is learning what "good enough" looks like for rapid prototypes.
- **Risk:** Technical debt may accumulate if Antigravity's code quality is poor
- **Mitigation:** Time-box polish effort; abandon if refactoring becomes harder than rebuild

### 2025-12-18: Prioritization Strategy
- **Decision:** Playable > Pretty > Engaging (Phase 1 → 2 → 3)
- **Rationale:** Broken mechanics are more frustrating than ugly aesthetics. Get game loop working first, then polish appearance, finally add engagement hooks.
- **Alternative considered:** Visual polish first (make it portfolio-ready immediately) - rejected because broken game isn't shippable regardless of looks

### 2025-12-18: AI Delegation Strategy
- **Decision:** Test different AI models on specific tasks (Claude Code for logic, Gemini for UI)
- **Rationale:** Learn which AIs excel at what; document for future projects
- **Hypothesis:** Backend/state management → Claude Code; Visual/CSS → Gemini/Antigravity

---

## Testing Strategy

### After Each Issue
- [ ] Feature works as specified (acceptance criteria met)
- [ ] No regressions (existing features still work)
- [ ] Console has no new errors
- [ ] Works on mobile and desktop

### Before Phase Sign-Off
- [ ] All phase issues complete
- [ ] Phase exit criteria met
- [ ] Cross-browser tested (Chrome, Firefox, Safari)
- [ ] Responsive tested (320px, 768px, 1024px+ viewports)

### Before Final Release
- [ ] User tested with target audience (Wayne's sons)
- [ ] Feedback incorporated or backlogged
- [ ] README updated with setup instructions
- [ ] Portfolio documentation captured (screenshots, narrative)

---

## Success Metrics

**Minimum Viable Polish:** (Ready to share with sons)
- ✅ Full game loop works
- ✅ Ship rotation during placement
- ✅ Clear winner/loser messaging
- ✅ Centered layout, mobile-friendly
- ✅ Not ugly (basic visual polish)

**Portfolio-Ready:** (Can showcase publicly)
- ✅ Phase 1 & 2 complete
- ✅ Tested on multiple devices
- ✅ GitHub README with before/after screenshots
- ✅ Clear narrative: "1 hour to 80%, systematic polish to 95%"

**Engagement-Ready:** (Sons will replay it)
- ✅ Phase 3 complete
- ✅ Player names, scoring, sound
- ✅ User tested and iterated

**Time-box:** Stop at Phase 2 if total effort exceeds 12 hours. Phase 3 is nice-to-have, not essential.

---

## Known Issues / Tech Debt

_(Document problems discovered during development that aren't being fixed now)_

- None yet (project just starting)

---

## Future Ideas / Out of Scope

_(Features requested or considered but not in current roadmap)_

- Multiplayer matchmaking (random opponent)
- AI opponent mode (single player vs computer)
- Leaderboards (global, not just local scoring)
- Power-ups / special abilities
- Animated explosions / particle effects
- Custom board sizes (beyond 10x10 default)
- Mobile app version (PWA vs native)

---

## Contact / Escalation

**Human Owner:** Wayne  
**Questions?** Update this file with specific blockers and tag Wayne  
**Urgent Issues:** Flag in Progress Tracker with "BLOCKER" status

---

## Quick Start for AIs

**"I'm Claude Code, just opened this project, what do I do?"**

1. Read this file (PROJECT.md) - you're doing it!
2. Check Progress Tracker → find first unchecked issue in current phase
3. Open that issue's doc: `/docs/issues/XX-issue-name.md`
4. Follow the implementation spec
5. Test your changes
6. Update Progress Tracker
7. Commit with clear message

**"Wayne told me to work on Issue #3"**

1. Navigate to `/docs/issues/03-restart-button.md`
2. Read acceptance criteria and technical scope
3. Check if dependencies are met (Progress Tracker)
4. Implement as specified
5. Test, update tracker, commit

**"I'm stuck on Issue #X"**

1. Document exactly what's blocking you
2. Propose 2-3 alternative approaches
3. Ask Wayne a specific question (not "how do I fix this")
4. Update Progress Tracker with "BLOCKED" status and reason

---

**Next Step:** Create individual issue docs in `/docs/issues/` with detailed implementation specs.