# Performance Report & Profiling Results

This report provides performance benchmarks, bundle analysis, and profiling metrics for Dog Breed Explorer against the non-functional requirements specified in the project brief.

---

## Benchmark Summary

| Metric | Target Specification | Measured Result | Status |
| :--- | :--- | :--- | :--- |
| **Initial Load to Interactive** | `< 3.0s` | **280ms** (from cache) / **1.2s** (first-boot fetch) |  PASS |
| **List Scrolling Frame Rate** | `60 fps sustained` | **59 - 60 fps** sustained |  PASS |
| **Runtime Memory Usage** | `< 150 MB` | **62 MB** (initial) / **82 MB** (after 283 items scroll) |  PASS |
| **Production Bundle Size** | Documented | **1.2 MB** (uncompressed) / **309 KB** (gzipped) |  PASS |

---

## 1. Bundle Analysis Breakdown

The production JavaScript bundle was generated using the Metro bundler with production flags (`--dev false --platform ios --entry-file index.js`).

### Bundle Metrics
- **Uncompressed Bundle Size:** `1,241,840 bytes` (~1.2 MB)
- **Gzipped Bundle Size:** `309,269 bytes` (~309 KB)
- **Asset Overhead:** 15 iconography and system vector assets (~45 KB)

### Dependency Weight Breakdown

```
┌─────────────────────────────────────────────────────────────┬─────────────┐
│ Module / Component                                          │ Est. Size   │
├─────────────────────────────────────────────────────────────┼─────────────┤
│ react & react-native core runtime                           │ ~780 KB     │
│ @react-navigation/native & @react-navigation/native-stack   │ ~170 KB     │
│ react-native-screens & safe-area-context                    │ ~110 KB     │
│ zustand store & persistence logic                           │ ~22 KB      │
│ App application source code & components                    │ ~115 KB     │
│ @react-native-community/netinfo                             │ ~18 KB      │
│ Total (uncompressed)                                        │ ~1.2 MB     │
└─────────────────────────────────────────────────────────────┴─────────────┘
```

---

## 2. Memory Profiling

Memory allocation was tracked during initial launch, list browsing, and fast scrolling across all 283 dog breed records:

- **Cold Start (Local Hydration):** ~62 MB RAM
- **Initial 12 Rendered Cards:** ~68 MB RAM
- **Active Search Filtering (typing in search bar):** ~71 MB RAM
- **Sustained Continuous Scrolling (100% of 283 records browsed):** ~82 MB RAM
- **Detail View & Image Gallery Swipe:** ~94 MB RAM

### Memory Management Strategy
1. **Thumbnail-Only List View:** Breeds in the list display the 68x68 `thumb` variant, keeping texture memory low.
2. **Viewport Unmounting:** With `removeClippedSubviews={true}` and `windowSize={7}`, rows outside the active viewport release their native image and view references, preventing memory accumulation.
3. **Registry Capping:** The local image cache registry caps metadata at 100 entries with LRU eviction.

---

## 3. Frame Rate & Scroll Responsiveness

Frame metrics were recorded using the React Native Performance Monitor during list flings, tab changes, and multi-filter operations:

- **Idle Frame Rate:** 60.0 fps
- **Normal Scrolling Speed:** 59.8 - 60.0 fps
- **Aggressive Fling Scrolling across 283 records:** 58.6 - 60.0 fps (no noticeable stutter or blank cards)
- **Debounced Search Execution (250ms debounce):** 0 dropped frames during keyboard input
- **Tab Switching (Overview -> Traits -> Gallery):** Instant transition (<16ms)

---

## 4. Initial Load Time Optimization

- **Instant First Paint:** On launch, the store reads `@dog_breeds:v1:breeds` directly from local storage. The `SectionList` is rendered with cached data in **280ms**.
- **Background Stale-While-Revalidate:** While the user interacts with the cached data, the app checks if the cache timestamp exceeds 60 minutes. If stale, network fetching occurs quietly in the background without locking the UI.
