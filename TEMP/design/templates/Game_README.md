# Ataccama Knowledge Quest - Game.md

## 🎮 Overview

An **interactive multi-level space-themed quiz game** that loads questions from GIFT format files. Players navigate through a grid by answering questions correctly to reach the goal across multiple levels. Features **automatic level discovery**, **SCORM integration**, and **verifiable completion codes** for assessment tracking.

---

## 📁 Files Required

### Core Files
- **`Game.md`** - Main Marp markdown file with the game
- **`game_config.json`** - Configuration for levels and question counts
- **`gift_manifest.txt`** - List of available GIFT files
- **`*.gift` files** - GIFT format files containing quiz questions (one per level)

### SCORM & Verification Files
- **`verify_metrics_code.js`** - Node.js verification tool for instructors
- **`SCORM_METRICS_DOCUMENTATION.md`** - Complete technical documentation
- **`VERIFICATION_QUICK_GUIDE.md`** - Quick reference for instructors
- **`test_metrics_generator.html`** - Browser-based testing tool

All files should be in the **same folder** for auto-discovery to work.

---

## 🚀 Quick Start for Authors

### 1. Create Your GIFT Files

Create one GIFT file per level. Recommended naming convention:
```
162DG01-Business_Glossary.gift
162DG01-Catalog_Items.gift
162DG01-Data_Catalog.gift
```

**GIFT Format Requirements:**
- Multiple choice questions with **exactly ONE correct answer**
- Standard GIFT syntax with `=` for correct and `~` for incorrect
- Minimum 10 questions per file recommended

**Example GIFT File:**

```gift
::Q1 (Data Catalog)::What is a data catalog? {
    =A) A centralized inventory of data assets
    ~B) A programming language
    ~C) A type of database
    ~D) A reporting tool
    ####[Feedback] A data catalog is a centralized inventory that helps organizations discover, understand, and manage their data assets.
}

::Q2 (Metadata)::Which of these is metadata? {
    ~A) The actual data values
    =B) Column names and descriptions
    ~C) Database hardware
    ~D) User passwords
    ####[Feedback] Metadata is "data about data" - information that describes the characteristics of data assets like column names, types, and descriptions.
}
```

### 2. Create gift_manifest.txt

List all your GIFT files (one per line):

```txt
162DG01-Business_Glossary.gift
162DG01-Catalog_Items.gift
162DG01-Data_Catalog.gift
162DG01-Data_Discovery&Profiling.gift
162DG01-Data_Observability.gift
162DG01-ONE_Web_Application.gift
162DG01-Reports.gift
```

**Tips:**
- Lines starting with `#` are ignored (comments)
- Blank lines are ignored
- Order matters - first file = Level 1

### 3. Configure game_config.json

Control how many questions appear per level:

```json
{
  "levels": [
    {
      "giftFile": "162DG01-Business_Glossary.gift",
      "questionCount": 10
    },
    {
      "giftFile": "162DG01-Catalog_Items.gift",
      "questionCount": 8
    },
    {
      "giftFile": "162DG01-Data_Catalog.gift",
      "questionCount": 12
    }
  ]
}
```

**How it works:**
- If a GIFT file has 20 questions and you set `questionCount: 10`, the game **randomly selects 10** each time
- This creates **replayability** - students get different questions on retries
- If you omit `questionCount`, **all questions** from the file are used

### 4. Test Locally

```bash
# Start Marp server
marp --server --theme-set ../css --allow-local-files --html .

# Open in browser
http://localhost:8080/Game.html
```

The game will:
1. ✅ Load `game_config.json` (or fall back to `gift_manifest.txt`)
2. ✅ Parse all GIFT files
3. ✅ Create levels with auto-generated names
4. ✅ Show level tracker on right side
5. ✅ Use mock SCORM data (student-demo-12345)

---

## 🎯 Game Features

### Multi-Level System
- **7 levels** by default (configurable)
- **30 unique space backgrounds** that cycle through levels
- **Level names** auto-generated from filenames
  - `162DG01-Business_Glossary.gift` → "Business Glossary"
  - `162DG02-Collaboration.gift` → "Collaboration"
- **Progress tracker** shows all levels and current progress
- **Level completion screens** with statistics

### Game Mechanics
- **Grid:** 7 rows × 5 columns = 35 cells
- **Player start:** Bottom left area (cell 30)
- **Goal:** Top area (cell 2)
- **Movement:** 8 directions (including diagonals)
- **Adjacent cells highlighted** in cyan
- **Goal planet** highlighted in green

**Rules:**
- ✅ **Correct answer:** Move to selected cell, cell turns green with ✓
- ❌ **Wrong answer:** 3 attempts allowed per cell
- 💥 **3 wrong answers:** Cell becomes blocked with space junk
- 🎯 **Win condition:** Reach the goal planet
- 🚧 **Fail condition:** Path completely blocked OR all questions answered without reaching goal

**Special:** The **goal planet can never be blocked** - you can retry it unlimited times!

### Visual & Audio
- 🎨 **30 space backgrounds** with radial gradients
- 🎵 **Audio system** (muted by default)
  - Mute/unmute toggle
  - Volume slider
  - Sound effects for correct/incorrect
  - Victory fanfare
- 🎉 **Confetti celebration** on level completion
- 🎨 **Ataccama color palette**
  - Electric Pink: #f10094
  - Electric Purple: #6a2cf5
  - Navy: #1a0c42
  - Cyan: #00f5c8

### Question Display
- **Modal overlay** for questions
- **Visual attempts tracker** with circles:
  - ⭕ Empty circle = unused attempt
  - ✓ Green circle = correct answer
  - ✗ Red circle = wrong answer
  - ∞ Orange circle = unlimited attempts (goal planet)
- **Feedback display** after each answer
- **Multiple submission prevention** - can't click other answers after correct

---

## 🔐 SCORM Integration & Verification Codes

### For Authors: What You Need to Know

When students complete **all levels**, they receive a **unique verification code** that proves:
- ✅ They completed all levels
- ✅ Their performance metrics (time, attempts, success rate)
- ✅ Authenticity (cryptographically signed)

**The code looks like this:**
```
W3sibGV2ZWwiOjEsImxldmVsTmFtZSI6IkJ1c2luZXNzIEdsb3NzYXJ5IiwidGltZVRha2VuIjoiMDozNyIsInRvdGFsQXR0ZW1wdHMiOjYsImNvcnJlY3RBbnN3ZXJzIjo2LCJzZWN0b3JzRXhwbG9yZWQiOjUsInNwYWNlSnVua0NyZWF0ZWQiOjAsInN1Y2Nlc3NSYXRlIjoiMTAwJSIsInRpbWVzdGFtcCI6IjIwMjUtMTAtMDlUMTQ6MjQ6NTQuMzAwWiJ9XQ==.48cbb315
```

### How It Works

1. **During gameplay:** Metrics are collected for each level
   - Time taken
   - Attempts made
   - Correct answers
   - Sectors explored
   - Space junk created
   - Success rate
   - Timestamp

2. **On final victory:** Code is generated
   - All metrics encoded in Base64
   - Cryptographic signature added
   - Bound to student's LMS ID

3. **Student submits code:** Via LMS assignment or email

4. **Instructor verifies:** Using Node.js tool
   ```bash
   node verify_metrics_code.js "<CODE>" "<STUDENT_ID>"
   ```

### SCORM Compatibility

The game **auto-detects** the LMS environment:

**In LMS (SCORM mode):**
- Reads student ID from `cmi.core.student_id`
- Reads student name from `cmi.core.student_name`
- Code bound to actual student

**Local testing (Mock mode):**
- Uses demo student ID: `student-demo-12345`
- Full functionality for development
- No LMS required

### For Instructors

Provide these files to your grading team:
- ✅ `verify_metrics_code.js` - Verification script
- ✅ `VERIFICATION_QUICK_GUIDE.md` - How to use it
- ✅ `SCORM_METRICS_DOCUMENTATION.md` - Technical details

**Verification command:**
```bash
node verify_metrics_code.js "<STUDENT_CODE>" "<STUDENT_LMS_ID>"
```

**Output shows:**
- All level statistics
- Timestamps
- Aggregate metrics
- Validation status

---

## 📊 Level Statistics Displayed

### During Gameplay
- Current level name
- Questions remaining
- Adjacent cell highlighting
- Level progress in tracker

### On Level Completion (Intermediate Levels)
**Two-column layout:**

**Left Column:**
- Level name
- Encouragement message
- **➡️ Next Level** button
- Preview of next level

**Right Column:**
- Time taken
- Total attempts
- Correct answers
- Sectors explored
- Space junk created
- Success rate
- Progress indicator

### On Final Victory (All Levels Complete)
- Final level statistics
- **🔐 Completion Code** in cyan box
- **📋 Copy Code** button
- Total levels completed
- Congratulations message

### On Failure
**Path Blocked:**
- Current statistics
- Restart button
- Attempt counter

**Lost in Space:**
- All questions answered but goal not reached
- Current statistics
- Restart button

---

## 🛠️ Customization Guide

### Change Number of Levels

**Option 1: Edit game_config.json**
```json
{
  "levels": [
    { "giftFile": "level1.gift", "questionCount": 10 },
    { "giftFile": "level2.gift", "questionCount": 10 },
    { "giftFile": "level3.gift", "questionCount": 10 }
  ]
}
```

**Option 2: Edit gift_manifest.txt**
```txt
level1.gift
level2.gift
level3.gift
```

### Change Questions Per Level

In `game_config.json`, adjust `questionCount`:
```json
{ "giftFile": "hard_level.gift", "questionCount": 15 }
```

**Tips:**
- 6-10 questions = Easy level
- 10-15 questions = Medium level
- 15-20 questions = Hard level
- More questions = more board cells needed

### Change Grid Size

In `Game.md`, find and modify:
```javascript
const numRows = 7;
const numCols = 5;
```

**Warning:** Total cells = `numRows × numCols` must be >= number of questions per level!

### Change Start/Goal Positions

```javascript
let playerPosition = 30; // Starting cell (0-based index)
let goalPosition = 2;    // Goal cell (0-based index)
```

**Grid layout (7×5 = 35 cells):**
```
 0   1   2   3   4
 5   6   7   8   9
10  11  12  13  14
15  16  17  18  19
20  21  22  23  24
25  26  27  28  29
30  31  32  33  34
```

### Change Course Pepper (Security)

**Important:** This binds verification codes to your course!

In **three files**, find and change:
1. `Game.md`: `const COURSE_PEPPER = 'scorm-ataccama-space-game-2025-q4';`
2. `verify_metrics_code.js`: `const COURSE_PEPPER = 'scorm-ataccama-space-game-2025-q4';`
3. `test_metrics_generator.html`: `const COURSE_PEPPER = 'scorm-ataccama-space-game-2025-q4';`

**All three must match exactly!**

**Recommendation:** Change per semester/cohort:
```javascript
const COURSE_PEPPER = 'ataccama-161-2025-fall-dg01';
```

---

## 🧪 Testing Your Game

### 1. Local Browser Test

```bash
# Start server
cd C:\Ataccama\PSGL\curriculum\design\templates
marp --server --theme-set ../css --allow-local-files --html .

# Open browser
http://localhost:8080/Game.html
```

**What to check:**
- ✅ All levels load
- ✅ Level names display correctly
- ✅ Questions appear in modal
- ✅ Correct/incorrect feedback works
- ✅ Level progression works
- ✅ Final victory screen shows code
- ✅ Copy button works

### 2. Test Code Generation

**Option A: Play through game**
1. Complete all levels
2. Copy the code
3. Verify it:
   ```bash
   node verify_metrics_code.js "<CODE>" "student-demo-12345"
   ```

**Option B: Use test generator**
1. Open `test_metrics_generator.html` in browser
2. Generate sample metrics
3. Generate code
4. Copy verification command
5. Run in terminal

### 3. Test in LMS (SCORM)

**Package for SCORM:**
1. Export Game.md to HTML
2. Create SCORM manifest (imsmanifest.xml)
3. Package as .zip
4. Upload to LMS

**Test with real student account:**
1. Enroll test student
2. Complete game
3. Get student's LMS ID from LMS admin panel
4. Verify code using actual LMS ID

---

## 🐛 Troubleshooting

### Questions Not Loading

**Symptoms:** Blank screen, no levels appear

**Solutions:**
1. Check browser console (F12) for errors
2. Verify all GIFT files exist in same folder as Game.md
3. Check `gift_manifest.txt` or `game_config.json` paths
4. Ensure `--allow-local-files` flag is used with Marp
5. Validate GIFT file syntax (see below)

### GIFT Format Errors

**Common issues:**

❌ **Missing blank lines between questions**
```gift
::Q1::Question 1? { =A) Correct ~B) Wrong }
::Q2::Question 2? { =A) Correct ~B) Wrong }
```

✅ **Correct format:**
```gift
::Q1::Question 1? { =A) Correct ~B) Wrong }

::Q2::Question 2? { =A) Correct ~B) Wrong }
```

❌ **No correct answer marked**
```gift
::Q1::Question? { ~A) Wrong ~B) Wrong ~C) Wrong }
```

✅ **Must have one `=` for correct**
```gift
::Q1::Question? { =A) Correct ~B) Wrong ~C) Wrong }
```

### Level Names Not Displaying

**Problem:** Levels show as "Level 1", "Level 2" instead of descriptive names

**Solution:** Check GIFT filename format
- ✅ Good: `162DG01-Business_Glossary.gift` → "Business Glossary"
- ✅ Good: `DQ02-ONE_Desktop.gift` → "ONE Desktop"
- ❌ Poor: `level1.gift` → "level1"

### Verification Code Issues

**"Signature mismatch" error:**
- Student ID doesn't match between game and verification
- Check LMS student ID exactly
- Verify COURSE_PEPPER matches in all files

**"Invalid code format" error:**
- Code was truncated during copy/paste
- Extra spaces or line breaks in code
- Ask student to use Copy button again

**Code won't copy:**
- Browser clipboard permission denied
- Use manual select-and-copy (Ctrl+C)
- Check browser console for errors

### Game Won't Start

**Black screen / No game board:**
1. Check console for JavaScript errors
2. Verify `game_config.json` is valid JSON
3. Ensure at least one GIFT file has valid questions
4. Try without config file (manifest only)

**"Maximum call stack exceeded":**
- Check for circular references in config
- Verify GIFT files don't have parsing errors
- Try with smaller number of questions

---

## 📦 Deployment Checklist

### Before Deploying to LMS

- [ ] Test all levels locally
- [ ] Verify all GIFT files load correctly
- [ ] Test level progression
- [ ] Complete full game and verify code generation
- [ ] Test code verification with demo ID
- [ ] Check responsive design (different screen sizes)
- [ ] Verify audio is muted by default
- [ ] Test on different browsers (Chrome, Edge, Firefox)

### SCORM Package Checklist

- [ ] Include all GIFT files
- [ ] Include game_config.json
- [ ] Include gift_manifest.txt
- [ ] Create proper imsmanifest.xml
- [ ] Test in SCORM test suite
- [ ] Upload to staging LMS
- [ ] Test with real student account
- [ ] Verify LMS student ID retrieval works

### Instructor Setup

- [ ] Provide verify_metrics_code.js to instructors
- [ ] Share VERIFICATION_QUICK_GUIDE.md
- [ ] Confirm Node.js installed on grading machines
- [ ] Test verification with sample code
- [ ] Create grading rubric based on metrics
- [ ] Document submission process for students

---

## 📚 Additional Resources

### Documentation Files

| File | Purpose | Audience |
|------|---------|----------|
| `Game_README.md` | This file - game authoring guide | Content authors |
| `SCORM_METRICS_DOCUMENTATION.md` | Complete technical docs | Developers, admins |
| `VERIFICATION_QUICK_GUIDE.md` | How to verify codes | Instructors |
| `IMPLEMENTATION_SUMMARY.md` | Feature overview | All stakeholders |

### Testing Tools

| File | Purpose | Usage |
|------|---------|-------|
| `test_metrics_generator.html` | Generate test codes | Open in browser |
| `verify_metrics_code.js` | Verify student codes | Node.js command line |
| `verify.ps1` | Windows PowerShell wrapper | PowerShell command line |

### Example Files

Check the `templates` folder for examples:
- Sample GIFT files
- Sample game_config.json
- Sample gift_manifest.txt

---

## 🎨 Ataccama Branding

Official color palette (automatically applied):
- **Electric Pink:** #f10094
- **Electric Purple:** #6a2cf5
- **Navy:** #1a0c42
- **Cyan:** #00f5c8

Typography:
- Font family: system default sans-serif
- Headers: Bold, larger sizes
- Body: Regular weight

---

## 🔄 Version History

### v2.0 (October 2025)
- ✨ Multi-level system with auto-discovery
- ✨ SCORM integration with metrics tracking
- ✨ Verifiable completion codes
- ✨ Mock SCORM API for local testing
- ✨ Level progress tracker
- ✨ 30 unique space backgrounds
- ✨ Two-column victory screens
- ✨ Visual attempts tracker
- ✨ Question randomization
- ✨ Configuration system (game_config.json)

### v1.0 (2025)
- Initial release with single-level gameplay
- GIFT file loading support
- Basic audio and visual effects

---

## 💡 Best Practices

### For Content Authors

1. **Question Quality**
   - Write clear, unambiguous questions
   - Provide detailed feedback explanations
   - Use realistic answer choices (plausible distractors)
   - Test all questions for accuracy

2. **Level Design**
   - Start easy, increase difficulty
   - 6-10 questions for introductory levels
   - 10-15 questions for advanced levels
   - Balance coverage vs. length

3. **File Organization**
   - Use descriptive filenames
   - Follow naming convention: `COURSE-TOPIC.gift`
   - Keep backup copies of all GIFT files
   - Document any custom configurations

### For Instructors

1. **Code Verification**
   - Verify codes promptly after submission
   - Keep verification logs for records
   - Cross-reference with LMS activity data
   - Watch for suspiciously similar metrics

2. **Grading Criteria**
   - Consider success rate (primary metric)
   - Look at time taken (efficiency)
   - Review attempt patterns (strategy)
   - Check all levels completed

3. **Student Support**
   - Provide clear submission instructions
   - Test code generation yourself first
   - Have backup submission method ready
   - Document common issues and solutions

---

## 🆘 Support

### For Technical Issues

1. Check browser console (F12) for error messages
2. Review this README's troubleshooting section
3. Consult SCORM_METRICS_DOCUMENTATION.md
4. Contact Learning Experience team

### For Content Issues

1. Validate GIFT file syntax
2. Test with smaller question set
3. Check gift_manifest.txt entries
4. Review game_config.json structure

### For SCORM/LMS Issues

1. Test locally first (mock mode)
2. Verify SCORM package structure
3. Check LMS SCORM compatibility
4. Review LMS error logs

---

## 📞 Contact

**Learning Experience Team**
- For content authoring questions
- For GIFT file assistance
- For game configuration help

**Technical Support**
- For code verification issues
- For SCORM integration problems
- For customization requests

---

**Last Updated:** October 9, 2025  
**Version:** 2.0  
**Status:** Production Ready 🚀

---

## 🎯 Quick Reference Card

### For First-Time Authors

1. **Create GIFT files** → One per level, 10+ questions each
2. **Create gift_manifest.txt** → List all GIFT files
3. **Create game_config.json** → Configure question counts
4. **Test locally** → `marp --server --allow-local-files`
5. **Deploy** → Package as SCORM or standalone HTML

### Essential Commands

```bash
# Start local server
marp --server --theme-set ../css --allow-local-files --html .

# Export to HTML
marp Game.md --html --allow-local-files -o Game.html

# Verify student code
node verify_metrics_code.js "<CODE>" "<STUDENT_ID>"

# Test code generation
# Open: test_metrics_generator.html
```

### File Checklist

```
✅ Game.md                          (main game file)
✅ game_config.json                 (level configuration)
✅ gift_manifest.txt                (list of GIFT files)
✅ *.gift                           (your question files)
✅ verify_metrics_code.js           (for instructors)
✅ VERIFICATION_QUICK_GUIDE.md      (for instructors)
```

### Key Metrics Collected

Each level tracks:
- ⏱️ Time taken
- 🎯 Total attempts
- ✅ Correct answers
- 🌟 Sectors explored
- 🪨 Space junk created
- 📈 Success rate
- 🕐 Timestamp

All compiled into **one verification code** at game completion.

---

**Need Help?** Check the troubleshooting section or contact the Learning Experience team!
- Time taken
- Total attempts
- Correct answers
- Sectors explored
- Space junk created
- Success rate

### Restart Feature
Failed attempts show a "Try Again" button that:
- Tracks attempt count
- Resets the game board
- Preserves audio settings

## Troubleshooting

### Questions not loading
1. Check browser console (F12) for errors
2. Verify GIFT file path is correct
3. Ensure GIFT file is properly formatted
4. Make sure you're using `--allow-local-files` flag

### GIFT Format Issues
- Each question must be separated by a blank line
- Must have at least one correct answer (marked with `=`)
- Choices should use `~` for incorrect, `=` for correct
- Feedback is optional but recommended

### Game Board Not Rendering
- Check that you've allowed sufficient time for questions to load
- Verify no JavaScript errors in console
- Ensure both Game.md and Game.gift are in same folder

## Customization

### Change Grid Size
In the JavaScript section, modify:
```javascript
const numRows = 7;
const numCols = 5;
```

### Change Start/Goal Positions
```javascript
let playerPosition = 30; // Starting cell (0-34)
let goalPosition = 2;    // Goal cell (0-34)
```

### Adjust Board Size
In the CSS section, find `.container` and modify:
```css
.container {
  width: 90%;
  max-width: 1000px;
  height: 65vh;
  max-height: 600px;
}
```

## Ataccama Branding
The game uses official Ataccama color palette:
- Electric Pink: #f10094
- Electric Purple: #6a2cf5
- Navy: #1a0c42
- Green: #00f5c8

## Version History
- v1.0 (2025): Initial release with GIFT file loading support

## Support
For issues or questions, contact the Learning Experience team.
