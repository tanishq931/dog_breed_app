# Technical Decisions & Rationale

This document details the architectural choices, trade-offs, and design rationale adopted in Dog Breed Explorer.

---

## 1. State Management: Why Zustand?

### Alternatives Evaluated
- **Redux Toolkit (RTK):** Robust but introduces extensive boilerplate (slices, dispatchers, action creators) and noticeable overhead for a focused 283-record domain model.
- **React Context + useReducer:** Triggers broad sub-tree re-renders whenever any part of the context changes unless divided into multiple fine-grained providers, which complicates consumers and degrades 60fps scroll performance.
- **Jotai:** Atom-based model is versatile but adds cognitive overhead when managing normalized entity collections with relational links (breeds belonging to groups).

### Chosen Approach: Zustand
- **Minimal Boilerplate & High Performance:** Zustand stores live outside the React render tree. Components subscribe strictly to selected slices (e.g. `const isSyncing = useBreedStore(s => s.isSyncing)`), preventing unnecessary re-renders.
- **Normalized Entity Store:** Breeds are stored in a dictionary (`breedsById: Record<string, Breed>`) alongside an ID index (`breedIds: string[]`). Groups are similarly indexed (`groupsById`). This provides O(1) lookups and simplifies updates when refreshing a single breed (`enrichBreed`).
- **Framework-Agnostic & Easy to Test:** Actions and selectors can be invoked or tested independently without needing to wrap components in providers during unit tests.

---

## 2. Data Persistence: Why AsyncStorage with Versioned Schema?

### Alternatives Evaluated
- **SQLite / WatermelonDB:** Powerful for relational queries across tens of thousands of rows. However, for a bounded dataset of 283 dog breeds (~1.2MB JSON payload), SQLite adds native compilation complexity, native link requirements, and native migration overhead on React Native 0.88 New Architecture without providing tangible speed gains over in-memory lookups.

### Chosen Approach: AsyncStorage with Versioned Key Spaces
- **Instant Boot & Low Overhead:** On application startup, `@dog_breeds:v1:breeds` and `@dog_breeds:v1:groups` are read in parallel via `Promise.all`. The entire dataset hydrates into the Zustand in-memory store in ~80ms.
- **Zero Query Latency:** All filtering, sorting, and section grouping occur in memory with pre-compiled predicates. This avoids asynchronous SQLite bridge roundtrips while scrolling through the list.
- **Schema Design & Namespacing:**
  - `@dog_breeds:v1:breeds`: Serialized JSON array of normalized `Breed` objects.
  - `@dog_breeds:v1:groups`: Array of `BreedGroup` entities.
  - `@dog_breeds:v1:sync_meta`: Object tracking `lastSyncedAt`, `totalRecords`, `isPartial`, and `lastError`.
  - `@dog_breeds:v1:image_cache_meta`: Registry tracking cached image URLs and access timestamps.
- **Migration Path:** If the schema evolves in future releases, incrementing the key version to `v2` ensures backward compatibility without crashing existing installations.

---

## 3. Row Payload Richness vs. Sheer Row Count: The 60fps Trade-off

### The Challenge
A dataset of 283 records might seem small compared to infinite-scroll feeds with tens of thousands of items. However, each breed record from Dog API v2 is **exceptionally heavy**:
- 11 numeric trait scores (energy, trainability, barking, exercise minutes, etc.)
- Arrays of temperament descriptors, alternative names, and recognized kennel clubs
- Nested origin metadata (era, region, country)
- Coat definitions (length, type, color variations)
- Up to 9 image variants with full attribution and licensing metadata

If all 283 items were rendered with unmemoized components or full-resolution media, the React Native shadow tree and JS thread would bog down, resulting in dropped frames during fast flings.

### Performance Optimizations Implemented
1. **Separation of List vs. Detail Payloads:**
   - The list card (`BreedCard`) consumes only the fields required for browsing: `name`, `groupName`, `sizeBand`, `hypoallergenic`, the top 2 temperament chips, and the `thumb` image variant.
   - Heavy descriptions, full trait scales, official standard links, and multi-image galleries are deferred until the user opens `BreedDetailScreen`.
2. **Component Memoization (`React.memo`):**
   - `BreedCard` is wrapped in `React.memo` with stable callbacks (`useCallback`) to avoid re-rendering off-screen cards when typing in the search bar.
3. **Virtualized Windowing Parameters:**
   - `SectionList` is tuned with `initialNumToRender={12}`, `maxToRenderPerBatch={10}`, `windowSize={7}`, and `removeClippedSubviews={true}`.
   - This keeps only ~20-30 row views mounted in the native view hierarchy at any given time, maintaining memory consumption under 85MB even after continuous fast scrolling.

---

## 4. Image Caching Strategy & Size Limits

### Multi-Tier Resolution Model
Each breed record in the API provides up to 9 photos with 3 distinct variants: `thumb`, `medium`, and `large`.
- **List Cards:** Use `thumb` variant (~30-50KB each). Downloading 283 thumbnails consumes less than 12MB total network payload and minimal GPU texture memory.
- **Detail Overview:** Loads the `medium` variant (~150-250KB) for the featured hero card.
- **Gallery Tab:** Loads `large` (~400-800KB) on demand as the user swipes through images, with fallback to `medium` or `url`.

### Size Limits & Eviction
- The app maintains an image cache registry in local storage (`@dog_breeds:v1:image_cache_meta`) capping stored image references at 100 entries.
- When the registry reaches the entry ceiling, an LRU (least recently used) pruning routine removes older entries based on `lastAccessedAt`.
- Native image caching in React Native uses NSURLCache on iOS and OkHttp DiskLruCache on Android, bounded by system cache limits.

---

## 5. API Layer & Resilient Pagination Merging

### Paginating 6 Pages into 1 Unified Dataset
- Dog API v2 exposes 283 records split into 6 pages at 48 items/page.
- Page 1 discovery: The first request discovers `meta.pagination.last` (6) and `meta.pagination.records` (283).
- Controlled Concurrency: Pages 2 through 6 are retrieved in batches of 2 requests using `Promise.allSettled`. This avoids socket exhaustion and minimizes mobile radio timeout issues.
- Partial Failure Resilience: If any page fails after retries, successful records are merged with the current cache. The app flags `isPartial: true` and displays an informative banner with an immediate retry button.
- Exponential Backoff: Transient network errors trigger up to 3 automatic retries with exponential backoff (`backoff * 2^attempt`) and randomized jitter.
