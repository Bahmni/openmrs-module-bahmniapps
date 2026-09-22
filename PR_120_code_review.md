# Code Review: PR #120

**PR**: Manual 'Save as Draft' Trigger
**URL**: https://github.com/cureinternational/openmrs-module-bahmniapps/pull/120
**Author**: PoojaSastry-TW
**Branch**: feature-110920-integrate-manual-save-draft → Bahmni-IPD-master
**Reviewed**: 2026-04-20
**HIVE**: HIVE-110920

---

## Summary

This PR implements the manual "Save as Draft" feature for consultation forms with backend integration and dirty-state tracking. All 4 acceptance criteria are met with working API integration and success messages. However, there are **4 CRITICAL issues** that must be addressed:

1. **Race condition** on double-click saves (no debouncing/locking)
2. **Unsafe JSON.parse** without try-catch for template preferences
3. **Null pointer dereference** accessing $rootScope.currentProvider.uuid
4. **Missing HTTP DELETE mock** in tests for discardDraft()

Additionally, 8 MAJOR issues and code quality concerns require changes before merge.

| Severity | Count |
|----------|-------|
| 🚫 BLOCKER | 0 |
| 🔴 CRITICAL | 4 |
| 🟠 MAJOR | 8 |
| 🟡 MINOR | 2 |
| 🔵 INFO | 2 |

**Recommendation**: REQUEST CHANGES

---

## 🔴 CRITICAL Issues

### 1. Race Condition: Double-Click Save Without Debouncing

**Category**: Bugs
**File**: ui/app/clinical/consultation/controllers/conceptSetPageController.js
**Lines**: 479-507

**Issue**:
The `saveFormDraft()` function has no protection against multiple simultaneous save requests. If a user double-clicks the "Save as Draft" button or clicks it while a save is in-flight, multiple POST requests will be sent to the server. This can cause:
- Duplicate draft entries
- Race conditions in backend state
- Confused user state if requests complete out-of-order

**Evidence**:
Lines 479-507 show `saveFormDraft()` directly calls `formDraftService.saveDraft()` without:
- A `isSaving` flag to disable button during save
- Request debouncing
- Request cancellation token
- Check if save is already in-flight

**Suggested Fix**:
Add request locking:
```javascript
var saveFormDraft = function () {
    if (dirtyTrackingState.isSaving) {
        return;  // prevent concurrent saves
    }
    dirtyTrackingState.isSaving = true;
    // ... rest of function
    // In finally block: dirtyTrackingState.isSaving = false;
};
```

**Code Link**:
https://github.com/cureinternational/openmrs-module-bahmniapps/blob/feature-110920-integrate-manual-save-draft/ui/app/clinical/consultation/controllers/conceptSetPageController.js#L479-L507

---

### 2. Unsafe JSON.parse Without Try-Catch

**Category**: Bugs
**File**: ui/app/clinical/consultation/controllers/conceptSetPageController.js
**Lines**: 71

**Issue**:
```javascript
var templatePreference = JSON.parse(localStorage.getItem("templatePreference"));
```
This line calls `JSON.parse()` on untrusted localStorage data without error handling. If:
- localStorage is corrupted
- Data format changed
- User manually edited localStorage

...the app will throw an uncaught exception and crash the consultation page.

**Evidence**:
Line 71 in `addTemplatesInSavedOrder()` has no try-catch wrapper. The string data from `localStorage.getItem()` could be invalid JSON (e.g., `"undefined"`, truncated data, manually edited).

**Suggested Fix**:
```javascript
var templatePreference = null;
try {
    var stored = localStorage.getItem("templatePreference");
    if (stored) {
        templatePreference = JSON.parse(stored);
    }
} catch (e) {
    // localStorage corrupted; fallback to default order
    templatePreference = null;
}
if (templatePreference && templatePreference.patientUuid === $scope.patient.uuid && ...) {
    // proceed with saved order
}
```

**Code Link**:
https://github.com/cureinternational/openmrs-module-bahmniapps/blob/feature-110920-integrate-manual-save-draft/ui/app/clinical/consultation/controllers/conceptSetPageController.js#L71

---

### 3. Null Pointer Dereference: $rootScope.currentProvider.uuid

**Category**: Bugs
**File**: ui/app/clinical/consultation/controllers/conceptSetPageController.js
**Lines**: 73

**Issue**:
```javascript
!_.isEmpty(templatePreference.templates) && $rootScope.currentProvider.uuid === templatePreference.providerUuid
```
Line 73 accesses `$rootScope.currentProvider.uuid` without null/undefined checks. If `$rootScope.currentProvider` is null or undefined (e.g., during logout or initialization), this will throw a TypeError and crash.

**Evidence**:
Line 73 assumes `$rootScope.currentProvider` always exists and has a `uuid` property. No null checks are present.

**Suggested Fix**:
```javascript
var currentProviderUuid = $rootScope.currentProvider && $rootScope.currentProvider.uuid;
if (templatePreference && templatePreference.patientUuid === $scope.patient.uuid &&
    !_.isEmpty(templatePreference.templates) && currentProviderUuid === templatePreference.providerUuid) {
    insertInSavedOrder(templatePreference);
}
```

**Code Link**:
https://github.com/cureinternational/openmrs-module-bahmniapps/blob/feature-110920-integrate-manual-save-draft/ui/app/clinical/consultation/controllers/conceptSetPageController.js#L70-L78

---

### 4. Missing HTTP DELETE Mock in Tests

**Category**: Framework (Testing)
**File**: ui/test/unit/common/services/formDraftService.spec.js
**Lines**: 5

**Issue**:
The test mockHttp spy is created with only `['get', 'post', 'patch']` methods:
```javascript
var mockHttp = jasmine.createSpyObj('$http', ['get', 'post', 'patch']);
```

The `discardDraft()` function in formDraftService.js (line 25) calls `$http.delete()`, but this method is not mocked. This means:
- Tests never actually exercise the DELETE code path
- The DELETE call will fail at runtime
- A critical feature (discard draft) is untested

**Evidence**:
- formDraftService.js line 25-28: `$http.delete(url, ...)` is called in `discardDraft()`
- formDraftService.spec.js line 5: mockHttp spy missing 'delete' method
- No test for `discardDraft()` function exists in the spec file

**Suggested Fix**:
Update line 5 in test file:
```javascript
var mockHttp = jasmine.createSpyObj('$http', ['get', 'post', 'patch', 'delete']);
```

And add test:
```javascript
it('should DELETE formdraft endpoint with correct params on discardDraft', function () {
    var patientUuid = 'patient-uuid-123';
    var providerUuid = 'provider-uuid-456';
    var mockResponse = {data: {success: true}};
    mockHttp.delete.and.returnValue(specUtil.respondWith(mockResponse));

    formDraftService.discardDraft(patientUuid, providerUuid);

    expect(mockHttp.delete).toHaveBeenCalledWith(
        '/openmrs/ws/rest/v1/bahmnicore/formdraft?patientUuid=' + patientUuid + '&providerUuid=' + providerUuid,
        {suppressError: true}
    );
});
```

**Code Link**:
https://github.com/cureinternational/openmrs-module-bahmniapps/blob/feature-110920-integrate-manual-save-draft/ui/test/unit/common/services/formDraftService.spec.js#L5

---

## 🟠 MAJOR Issues

### 5. Controller Bloat: Entangled Concerns in ConceptSetPageController

**Category**: Architecture
**File**: ui/app/clinical/consultation/controllers/conceptSetPageController.js
**Lines**: 1-686

**Issue**:
The ConceptSetPageController now spans 686 lines with multiple entangled concerns:
- Template/observation management (original)
- Dirty state tracking state machine (new, ~150 lines)
- Form2 React component synchronization (~50 lines)
- Draft lifecycle management (~80 lines)

This violates single responsibility principle and makes the controller difficult to:
- Test in isolation
- Maintain (touching one concern may break another)
- Reason about (mixing business logic across ~9 functions)

**Evidence**:
- Lines 280-300: dirtyTrackingState object initialization
- Lines 312-360: Dirty tracking helper functions
- Lines 378-412: Form2 sync listeners
- Lines 479-507: Draft save logic
- Lines 513-547: Draft check/resume logic

**Suggested Fix**:
Extract dirty tracking into a dedicated service (`dirtyStateService`) with:
- State machine management
- Watch registration/deregistration
- Suppression window handling
- Clean/dirty comparison logic

Extract draft management into enhanced `formDraftService` with:
- UI state management (isDirty, hasDrafts, etc.)
- Success/error message handling
- Date formatting

This reduces controller to ~400-450 lines focused on template management.

**Code Link**:
https://github.com/cureinternational/openmrs-module-bahmniapps/blob/feature-110920-integrate-manual-save-draft/ui/app/clinical/consultation/controllers/conceptSetPageController.js#L1-L686

---

### 6. Inconsistent HTTP Parameter Patterns in formDraftService

**Category**: Framework (Consistency)
**File**: ui/app/common/services/formDraftService.js
**Lines**: 15-33

**Issue**:
The formDraftService mixes two incompatible URL parameter patterns:
- `getDraft()` (line 15-23): Uses `params` object → `/endpoint?patientUuid=X&providerUuid=Y`
- `markDraftAsSaved()` (line 30-33): Uses string concatenation → `endpoint + '?patientUuid=' + X`
- `discardDraft()` (line 25-28): Uses string concatenation

This inconsistency:
- Makes code harder to read and maintain
- Can lead to bugs if developers copy-paste the wrong pattern
- Doesn't leverage Angular's automatic parameter encoding/escaping

**Evidence**:
```javascript
// getDraft: params object
$http.get(formDraftUrl, {
    params: {
        patientUuid: patientUuid,
        providerUuid: providerUuid
    }
});

// markDraftAsSaved: string concatenation
var url = formDraftUrl + '?patientUuid=' + patientUuid + '&providerUuid=' + providerUuid;
return $http.patch(url, {}, {suppressError: true});
```

**Suggested Fix**:
Standardize on `params` object pattern for all methods:
```javascript
var markDraftAsSaved = function (patientUuid, providerUuid) {
    return $http.patch(formDraftUrl, {}, {
        params: {
            patientUuid: patientUuid,
            providerUuid: providerUuid
        },
        suppressError: true
    });
};

var discardDraft = function (patientUuid, providerUuid) {
    return $http.delete(formDraftUrl, {
        params: {
            patientUuid: patientUuid,
            providerUuid: providerUuid
        },
        suppressError: true
    });
};
```

**Code Link**:
https://github.com/cureinternational/openmrs-module-bahmniapps/blob/feature-110920-integrate-manual-save-draft/ui/app/common/services/formDraftService.js#L15-L33

---

### 7. Unhandled Promise Rejection: markDraftAsSaved() Call

**Category**: Code Quality (Error Handling)
**File**: ui/app/clinical/consultation/controllers/consultationController.js

**Issue**:
The consultationController calls `formDraftService.markDraftAsSaved()` without error handling:
```javascript
formDraftService.markDraftAsSaved(patientUuid, providerUuid);
```

If the backend call fails, the promise rejection is unhandled, which will:
- Log errors to console (noise)
- Potentially trigger unhandled rejection handlers
- Leave draft marked as unsaved when it should be marked

**Evidence**:
The PR diff shows the call added to consultationController without `.then()` or `.catch()` blocks, and no error UI feedback mechanism for this specific operation.

**Suggested Fix**:
```javascript
formDraftService.markDraftAsSaved(patientUuid, providerUuid)
    .then(function () {
        // Draft marked as saved successfully
    }, function () {
        // Log error but don't block main save flow
        // (backend still saved the form successfully)
    });
```

**Code Link**:
See PR diff for consultationController.js changes

---

### 8. Event Listener Memory Leak: Form2 Sync Listeners Not Fully Cleaned

**Category**: Code Quality (Memory Management)
**File**: ui/app/clinical/consultation/controllers/conceptSetPageController.js
**Lines**: 380-412

**Issue**:
The `registerForm2SyncListeners()` function adds global document event listeners (line 397):
```javascript
doc.addEventListener(eventName, syncOnForm2Interaction, true);
```

These listeners are stored in `dirtyTrackingState.form2InputListener` and `form2ChangeListener`, but:
- The same listener reference is reused for ALL event types (input, change, keyup, click)
- The cleanup code (line 406) tries to remove with `dirtyTrackingState.form2InputListener`, not the original reference
- This creates a mismatch: the listener registered for ALL events cannot be fully unregistered

Result: Memory leak on controller cleanup (listeners remain attached to document).

**Evidence**:
Lines 394-398:
```javascript
dirtyTrackingState.form2InputListener = syncOnForm2Interaction;  // stored ONCE
dirtyTrackingState.form2ChangeListener = syncOnForm2Interaction; // same reference
_.each(form2SyncEvents, function (eventName) {
    doc.addEventListener(eventName, syncOnForm2Interaction, true); // registered for EACH event
});
```

Lines 405-406:
```javascript
_.each(form2SyncEvents, function (eventName) {
    doc.removeEventListener(eventName, dirtyTrackingState.form2InputListener, true); // WRONG reference structure
});
```

**Suggested Fix**:
Store listener references per event type:
```javascript
dirtyTrackingState.form2SyncListeners = {};  // object to store refs per event
var syncOnForm2Interaction = function () {
    $scope.$evalAsync(syncForm2Observations);
};

_.each(form2SyncEvents, function (eventName) {
    dirtyTrackingState.form2SyncListeners[eventName] = syncOnForm2Interaction;
    doc.addEventListener(eventName, syncOnForm2Interaction, true);
});

// Cleanup:
_.each(form2SyncEvents, function (eventName) {
    doc.removeEventListener(eventName, dirtyTrackingState.form2SyncListeners[eventName], true);
});
dirtyTrackingState.form2SyncListeners = {};
```

**Code Link**:
https://github.com/cureinternational/openmrs-module-bahmniapps/blob/feature-110920-integrate-manual-save-draft/ui/app/clinical/consultation/controllers/conceptSetPageController.js#L380-L412

---

### 9. Unsafe URL Construction in formDraftService

**Category**: Code Quality (Security)
**File**: ui/app/common/services/formDraftService.js
**Lines**: 26, 31

**Issue**:
Lines 26 and 31 construct URLs with string concatenation without encoding:
```javascript
var url = formDraftUrl + '?patientUuid=' + patientUuid + '&providerUuid=' + providerUuid;
```

If either patientUuid or providerUuid contains special characters (e.g., `&`, `?`, `=`, `%`), the URL will be malformed. Additionally, this bypasses Angular's built-in parameter encoding.

**Evidence**:
formDraftService.js lines 26, 31 use string concatenation instead of the `params` approach used in `getDraft()`.

**Suggested Fix**:
Use Angular's `params` option (see issue #6 above).

---

### 10. Timestamp Validation Missing in Draft Resume Logic

**Category**: Code Quality (Robustness)
**File**: ui/app/clinical/consultation/controllers/conceptSetPageController.js
**Lines**: 527-534

**Issue**:
The `checkForExistingDrafts()` function retrieves a draft timestamp from the server and formats it without validation:
```javascript
var serverTimestamp = response.data.timestamp;
if (serverTimestamp) {  // only checks existence, not validity
    var draftDate = $filter('date')(new Date(serverTimestamp), 'dd MMM yyyy');
    var draftTime = $filter('date')(new Date(serverTimestamp), 'hh:mm a');
}
```

If `serverTimestamp` is:
- An invalid format
- A non-numeric string
- An impossibly large/small number

...`new Date(serverTimestamp)` will create an Invalid Date object, and the filter will display "NaN".

**Evidence**:
Lines 527-534 check `if (serverTimestamp)` but not `if (!isNaN(serverTimestamp))`.

**Suggested Fix**:
```javascript
var serverTimestamp = response.data.timestamp;
if (serverTimestamp && !isNaN(new Date(serverTimestamp).getTime())) {
    var draftDate = $filter('date')(new Date(serverTimestamp), 'dd MMM yyyy');
    var draftTime = $filter('date')(new Date(serverTimestamp), 'hh:mm a');
} else {
    // fallback: timestamp is invalid
}
```

**Code Link**:
https://github.com/cureinternational/openmrs-module-bahmniapps/blob/feature-110920-integrate-manual-save-draft/ui/app/clinical/consultation/controllers/conceptSetPageController.js#L526-L534

---

### 11. Unused Variable: draftResumeWatchDeregister

**Category**: Code Quality (Cleanliness)
**File**: ui/app/clinical/consultation/controllers/conceptSetPageController.js or patientDashboardController.js

**Issue**:
The variable `draftResumeWatchDeregister` is declared but never assigned or used. This is likely:
- A leftover from incomplete draft resume implementation
- Dead code that should be removed
- An incomplete feature

**Evidence**:
Variable declared but not referenced in subsequent code.

**Suggested Fix**:
Remove the unused variable declaration.

---

## 🟡 MINOR Issues

### 12. Scope Pollution: Draft Properties Added to Scope

**Category**: Framework (Best Practice)
**File**: ui/app/clinical/consultation/controllers/conceptSetPageController.js

**Issue**:
Multiple draft properties are added directly to `$scope`:
- `$scope.formDraft`
- `$scope.enableFormDraftFeature`
- `$scope.saveAsDraft()`

While this works, it pollutes the scope namespace and makes it harder to track which properties are related to drafts vs. other concerns. Modern AngularJS practice groups related state together.

**Evidence**:
Draft-related properties are scattered across scope without a cohesive grouping strategy.

**Suggested Fix**:
This is a MINOR issue. Can be addressed when extracting dirty tracking to service (see issue #5). No immediate fix required.

---

### 13. Missing Comment: Dirty Suppression Window Purpose

**Category**: Code Quality (Maintainability)
**File**: ui/app/clinical/consultation/controllers/conceptSetPageController.js
**Lines**: 442-447

**Issue**:
The `suppressDirtyTrackingDuringSaveRefresh()` function uses a 500ms suppression window (`suppressionWindowMs: 500`), but the purpose is not documented. Future developers may not understand:
- Why 500ms specifically
- What "save/refresh" means
- What "suppression" does

**Evidence**:
Line 442-447 has no comment explaining the timing or purpose.

**Suggested Fix**:
Add comment:
```javascript
var suppressDirtyTrackingDuringSaveRefresh = function () {
    // After save/refresh, suppress dirty tracking for 500ms to allow the backend
    // response to update the form without triggering false "dirty" state.
    // During suppression, form changes update the clean state baseline.
    dirtyTrackingState.suppressTracking = true;
    // ... rest of function
};
```

---

## 🔵 INFO

### 14. Incomplete Draft Resume Feature

**Category**: Requirements (Scope)
**File**: ui/app/clinical/dashboard/controllers/patientDashboardController.js

**Issue**:
The `resumeDraft()` function is commented out in the patientDashboardController, indicating that the draft resume/restore feature was planned but not completed. This may confuse:
- Future reviewers wondering why it's commented
- QA testing the draft feature
- Users expecting to restore drafted data

**Evidence**:
PR diff shows commented-out code in patientDashboardController.

**Suggested Fix**:
If draft resume is part of this PR's AC, uncomment and implement. If it's future work, add a TODO comment explaining why it's deferred. If it's out-of-scope, remove entirely to reduce noise.

---

### 15. Draft Tests Missing Resume Scenarios

**Category**: Testing (Coverage)
**File**: ui/test/unit/clinical/consultation/controllers/conceptSetPageController.spec.js

**Issue**:
The test suite for ConceptSetPageController should include scenarios for:
- Resuming a draft (loading draft data into form)
- Discarding a draft via UI
- Multiple save attempts and deduplication

These scenarios are either missing or partially covered.

**Evidence**:
Review of test file shows basic dirty tracking and save tests, but resume/discard scenarios are not fully exercised.

**Suggested Fix**:
Add tests for draft resume and discard flows. This is INFO-level because the core save feature is tested; resume is likely future scope based on commented code.

---

## Acceptance Criteria Check

| Criterion | Status | Notes |
|-----------|--------|-------|
| Backend API integration for form draft saves | ✅ | formDraftService correctly POST/GET/PATCH/DELETE to backend API |
| Dirty state tracking for form fields | ✅ | collectObsValues() and watch mechanism properly detect changes |
| Success messages with server timestamps | ✅ | saveFormDraft() displays "SAVED_AS_DRAFT_KEY" with formatted date/time |
| Error handling for failed saves | ✅ | .catch() block sets statusError and displays "CHANGES_NOT_SAVED_KEY" |

**Summary**: All 4 acceptance criteria are MET. However, the 4 CRITICAL issues must be fixed before these features can be safely released to production.

---

## Additional Notes

### What's Done Well

1. **Comprehensive dirty tracking**: The multi-level observation tree traversal in `collectObsValues()` correctly handles multi-select fields, group members, and nested observations — good attention to form complexity.

2. **Form2 integration**: Added event listeners to sync React component state with AngularJS scope, enabling draft tracking across hybrid AngularJS/React architecture. Thoughtful bridge between the two frameworks.

3. **Clear separation of concerns (mostly)**: Draft state is isolated in `dirtyTrackingState` object, making it somewhat encapsulated despite controller bloat.

4. **Test coverage for happy path**: Tests cover successful saves, dirty tracking on field changes, and error handling with messages. Good foundation for the feature.

5. **Proper use of $filter**: Correctly uses AngularJS `$filter('date')` for locale-aware timestamp formatting rather than manual date construction.

### Scope Beyond AC (if applicable)

The PR includes several enhancements beyond the minimum acceptance criteria:

1. **Draft UI Banner**: Added visual feedback in dashboard and consultation views showing draft status and timestamps — improves UX.

2. **Dirty Suppression Window**: Implemented a 500ms suppression period after save to prevent false "dirty" detections during server response — shows thoughtful UX considerations.

3. **Multi-provider Support**: formDraftService includes provider UUID in all draft operations, enabling multi-user scenarios where different providers can have independent drafts for same patient.

4. **localStorage Integration**: Added template preference caching in `addTemplatesInSavedOrder()` — optimizes template re-opening by remembering last used templates (though this added JSON.parse vulnerability).

These enhancements show initiative beyond scope but should not delay fixing CRITICAL issues.

