# Bike History Report Card - Testing Guide

## Part 1: Sell Form - Test Scenarios

### Pre-Testing Setup
1. Navigate to `/sell` route
2. Login if not authenticated
3. Complete Step 1 (Bike Info) and Step 2 (Details)
4. Verify Step 3 (History) appears in navigation

---

## Test Case 1: Step Navigation
**Objective:** Verify step indicator and navigation works correctly

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Complete steps 1-2 and click Continue | Step 3 "History" highlighted with FileText icon |
| 2 | Check progress bar | Shows 50% (2/4 completed) |
| 3 | Click Back button | Returns to Step 2 (Details) |
| 4 | Click Continue to Step 3 again | Returns to History step with data intact |
| 5 | Click Continue on Step 3 | Advances to Step 4 (Photos) |

**Status:** [ ] Pass [ ] Fail

---

## Test Case 2: Number of Owners Field
**Objective:** Verify dropdown selection and persistence

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Check default value | Shows "1 (First owner)" |
| 2 | Open dropdown | Shows 5 options: 1, 2, 3, 4, "5 or more" |
| 3 | Select "3" | Dropdown displays "3" |
| 4 | Navigate to next step and back | Selection persists (still shows "3") |
| 5 | Submit form and check database | num_owners = 3 |

**Status:** [ ] Pass [ ] Fail

---

## Test Case 3: Accident History Toggle
**Objective:** Verify conditional textarea appears/disappears

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Check default state | Switch is OFF, textarea hidden |
| 2 | Toggle switch ON | Textarea appears with label and placeholder |
| 3 | Type text "Minor scratch on left side, repainted" | Text appears in textarea |
| 4 | Check character counter | Shows "38/300 characters" |
| 5 | Toggle switch OFF | Textarea disappears, text cleared |
| 6 | Toggle ON again | Textarea appears but is empty |

**Status:** [ ] Pass [ ] Fail

---

## Test Case 4: Accident Details Character Limit
**Objective:** Verify 300 character maximum

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Toggle accident history ON | Textarea appears |
| 2 | Paste 400 characters of text | Only first 300 characters accepted |
| 3 | Check character counter | Shows "300/300 characters" |
| 4 | Try typing more | Cannot type beyond 300 chars |
| 5 | Delete 10 characters | Counter shows "290/300" |

**Status:** [ ] Pass [ ] Fail

---

## Test Case 5: Service History Toggle
**Objective:** Verify conditional date picker

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Check default state | Switch is OFF, date picker hidden |
| 2 | Toggle switch ON | Date picker appears with label |
| 3 | Click date picker | Calendar opens |
| 4 | Try selecting future date | Cannot select (max date = today) |
| 5 | Select date 6 months ago | Date is set correctly |
| 6 | Toggle switch OFF | Date picker disappears, date cleared |

**Status:** [ ] Pass [ ] Fail

---

## Test Case 6: Registration Expiry Date
**Objective:** Verify date picker with min constraint

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Check if field is visible | Always visible (not conditional) |
| 2 | Click date picker | Calendar opens |
| 3 | Try selecting past date | Cannot select (min date = today) |
| 4 | Select date 1 year from now | Date is set correctly |
| 5 | Clear the field | Field is empty (optional) |
| 6 | Submit with empty field | Saved as null in database |

**Status:** [ ] Pass [ ] Fail

---

## Test Case 7: Insurance Valid Toggle
**Objective:** Verify simple boolean toggle

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Check default state | Switch is OFF (false) |
| 2 | Toggle switch ON | Switch displays as ON (true) |
| 3 | Navigate away and back | State persists (still ON) |
| 4 | Submit form | insurance_valid = true in database |

**Status:** [ ] Pass [ ] Fail

---

## Test Case 8: Original Parts Toggle
**Objective:** Verify conditional textarea for modifications

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Check default state | Switch is ON (true), textarea hidden |
| 2 | Toggle switch OFF | Textarea appears with placeholder |
| 3 | Type "Aftermarket exhaust, LED headlight" | Text appears in textarea |
| 4 | Check character counter | Shows correct count (e.g. "37/300") |
| 5 | Toggle switch ON | Textarea disappears, text cleared |
| 6 | Toggle OFF again | Textarea appears but is empty |

**Status:** [ ] Pass [ ] Fail

---

## Test Case 9: Modifications Character Limit
**Objective:** Verify 300 character maximum

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Toggle original parts OFF | Textarea appears |
| 2 | Paste 350 characters | Only first 300 accepted |
| 3 | Check character counter | Shows "300/300 characters" |
| 4 | Try typing more | Cannot exceed 300 chars |

**Status:** [ ] Pass [ ] Fail

---

## Test Case 10: Complete Form Submission
**Objective:** Verify all fields save correctly

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Fill all History fields with test data: <br>- Owners: 2<br>- Accident: Yes + details<br>- Service: Yes + date<br>- Registration: Future date<br>- Insurance: Yes<br>- Original parts: No + mods | All fields accept input |
| 2 | Complete remaining steps (Photos, Contact) | Navigation works smoothly |
| 3 | Click Submit | Success toast appears |
| 4 | Check database listing record | All 9 bike history fields match form input |
| 5 | Navigate to dashboard | New listing appears |

**Status:** [ ] Pass [ ] Fail

---

## Test Case 11: Minimal Data Submission
**Objective:** Verify optional fields can be empty

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Leave all toggles at default (OFF/ON defaults) | No errors |
| 2 | Leave optional fields empty: <br>- Accident details<br>- Service date<br>- Registration<br>- Modifications | Form accepts empty state |
| 3 | Submit form | Success |
| 4 | Check database | Conditional fields are null |

**Status:** [ ] Pass [ ] Fail

---

## Test Case 12: Data Persistence Between Steps
**Objective:** Verify no data loss when navigating

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Fill all History fields | Data entered |
| 2 | Click Continue to Photos step | Advances to Step 4 |
| 3 | Click Back to History | Returns to Step 3 |
| 4 | Verify all filled data | All inputs retained exactly |
| 5 | Navigate forward again | Data still intact |

**Status:** [ ] Pass [ ] Fail

---

## Test Case 13: Validation Messages
**Objective:** Verify appropriate feedback

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Toggle accident history ON, leave details empty | No error (optional) |
| 2 | Toggle service history ON, leave date empty | No error (optional) |
| 3 | Fill accident details with 301 chars | Only 300 chars accepted, counter shows 300/300 |

**Status:** [ ] Pass [ ] Fail

---

## Test Case 14: Mobile Responsiveness
**Objective:** Verify layout on mobile devices

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Open sell form on mobile viewport | Layout adapts correctly |
| 2 | Navigate to History step | All fields visible and usable |
| 3 | Open date pickers | Mobile-friendly date selection |
| 4 | Toggle switches | Touch-friendly interaction |
| 5 | Type in textareas | Virtual keyboard works properly |

**Status:** [ ] Pass [ ] Fail

---

## Database Integrity Tests

### Test DB-1: Constraint Validation
```sql
-- Try inserting invalid num_owners
INSERT INTO listings (num_owners, ...) VALUES (6, ...);
-- Expected: ERROR - violates check constraint "num_owners_range"

-- Try inserting 301-char accident_details
-- Expected: ERROR - violates check constraint "accident_details_length"
```

**Status:** [ ] Pass [ ] Fail

---

## Edge Cases

### Edge Case 1: Switch Rapid Toggling
Toggle accident history ON/OFF 5 times rapidly
- [ ] No UI glitches
- [ ] Textarea shows/hides correctly each time
- [ ] Data clears properly when toggled off

### Edge Case 2: Date Picker Edge Dates
- [ ] Today's date is selectable for last service
- [ ] Today's date is selectable for registration
- [ ] Cannot select yesterday for registration
- [ ] Cannot select tomorrow for last service

### Edge Case 3: Special Characters in Text
Enter special characters in textareas: `!@#$%^&*()`
- [ ] Characters are accepted
- [ ] Saves correctly to database
- [ ] No XSS vulnerabilities

---

## Performance Tests

- [ ] History step loads in <100ms
- [ ] Toggle interactions are instant (<50ms)
- [ ] No console errors
- [ ] No memory leaks when navigating

---

## Accessibility Tests

- [ ] All form fields have proper labels
- [ ] Tab navigation works correctly
- [ ] Screen reader announces field states
- [ ] Switch controls have ARIA labels
- [ ] Date pickers are keyboard accessible

---

## Summary

**Total Test Cases:** 14 main + 3 edge cases + DB tests
**Required Pass Rate:** 100%

**Test Date:** _____________
**Tester:** _____________
**Environment:** _____________
**Build Version:** _____________

**Overall Status:** [ ] All Pass [ ] Some Failures

**Notes:**
_______________________________________________________
_______________________________________________________
_______________________________________________________
