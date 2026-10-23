# Dog Breed Explorer (React Native)

A production-grade, offline-first mobile application built with React Native and TypeScript. The app browses all 283 dog breeds cataloged in [Dog API (v2)](https://dogapi.dog/docs/api-v2), providing resilient background synchronization, multi-criteria filtering, visual trait scales, and an attributed photo gallery.

---

## Quick Start

Get the app running in under 3 minutes:

```bash
# 1. Install dependencies
npm install

# 2. Configure environment variables
cp .env.example .env

# 3. Launch on iOS simulator or connected device
npm run ios

# Or launch on Android emulator or connected device
npm run android
```

### Run Unit Tests & Typecheck

```bash
# Run Jest test suite (32 unit tests across filters, API, store, and storage)
npm test

# Run TypeScript strict validation
npx tsc --noEmit
```

---

## Screenshots

<p align="center">
  <img src="docs/screenshots/breed_list_light.jpg" width="30%" alt="Breed List Light Mode" />
  &nbsp;&nbsp;&nbsp;&nbsp;
  <img src="docs/screenshots/breed_list_dark.jpg" width="30%" alt="Breed List Dark Mode" />
  &nbsp;&nbsp;&nbsp;&nbsp;
  <img src="docs/screenshots/filters_applied.jpg" width="30%" alt="Filters Modal" />
</p>

<p align="center">
  <img src="docs/screenshots/breed_detail_overview.jpg" width="30%" alt="Breed Detail Overview" />
  &nbsp;&nbsp;&nbsp;&nbsp;
  <img src="docs/screenshots/breed_detail_traits.jpg" width="30%" alt="Visual Traits Scale" />
  &nbsp;&nbsp;&nbsp;&nbsp;
  <img src="docs/screenshots/offline_banner.jpg" width="30%" alt="Offline Mode with Cache Banner" />
</p>

---

## Architecture Overview

Dog Breed Explorer implements a layered, unidirectional data pipeline centered on an offline-first contract. On initial launch, the app instantly hydrates its normalized in-memory store from local storage (`AsyncStorage`), rendering cached records in ~280ms before any network request is sent. This guarantees instant interactivity and full offline functionality even in airplane mode.

The remote data layer connects to Dog API v2, fetching the 9 breed groups and paginated records across 6 pages (48 records per page). Network operations utilize exponential backoff with randomized jitter and controlled concurrency batches to eliminate radio socket bottlenecks. If connectivity drops during synchronization, partial records are safely merged with the local cache and an actionable banner alerts the user while preserving uninterrupted browsing.

```mermaid
flowchart LR
    API[Dog API v2 Remote] -->|Controlled Batches & Backoff| Normalizer[Data Normalizer]
    Normalizer -->|Typed Domain Records| Store[(Zustand Store)]
    Store <-->|Hydrate on Boot / Persist| LocalDB[(Local Cache AsyncStorage)]
    Store -->|Memoized Predicates| UI[Virtualized SectionList & Tabs]
    NetInfo[NetInfo Listener] -->|Network Restored| Store
```

---

## Key Technical Decisions

### 1. State Management: Zustand with Normalized Cache
- **Why Zustand?** Zustand resides outside the component tree and allows components to subscribe strictly to individual slices. This eliminates the wide re-rendering overhead common in React Context.
- **Normalized Structure:** Entities are stored as `breedsById: Record<string, Breed>` and indexed by an ID array (`breedIds: string[]`). Groups are similarly keyed. This guarantees O(1) lookups for single-breed detail enrichments (`/api/v2/breeds/:id`) and prevents duplicate records when assembling paginated responses.

### 2. Local Database: AsyncStorage with Versioned Key Spaces
- **Why AsyncStorage over SQLite?** For a bounded dataset of 283 records (~1.2MB JSON), SQLite introduces native linking friction on React Native 0.88 without providing query speed benefits. AsyncStorage allows the entire normalized store to hydrate into memory in under 80ms, after which all searches, multi-criteria filters, and alphabetical section groupings execute synchronously in memory at 60fps.
- **Key Schemas:**
  - `@dog_breeds:v1:breeds`: Normalized breed records.
  - `@dog_breeds:v1:groups`: Breed group metadata.
  - `@dog_breeds:v1:sync_meta`: Last sync timestamp, total counts, and partial status.
  - `@dog_breeds:v1:image_cache_meta`: LRU registry tracking cached URLs and variants.

### 3. Offline Sync & Resilience Strategy
- **Cold Boot Hydration:** Reads local storage first; UI is interactive in under 500ms.
- **Background Sync:** The `useNetworkSync` hook monitors `@react-native-community/netinfo`. When connection returns from offline, the store checks cache TTL (60 minutes) or partial status and initiates background revalidation.
- **Partial Failure Recovery:** If later pages encounter network timeouts, previously fetched items are preserved, merged into the normalized cache, and surfaced with an error banner providing immediate manual retry.
- **Data Freshness Indicator:** Relative duration badges ("Just now", "2 hours ago", "Yesterday") keep users informed of cache validity.

### 4. Payload Richness vs. Row Count (The 60fps Trade-off)
While 283 rows is a moderate count, each Dog API record carries high payload richness: 11 numeric traits, temperament arrays, alternative names, origin history, coat definitions, and up to 9 image variants with full attribution.
- **List Optimization:** Cards in the `SectionList` render only lightweight metadata and the `thumb` image variant (~30KB), keeping memory under 85MB.
- **Deferred Enrichment:** Heavy descriptions, official standards links, visual trait progress meters, and large gallery photos are deferred until the user opens the Detail screen.
- **Windowing:** `SectionList` uses `initialNumToRender={12}`, `maxToRenderPerBatch={10}`, and `removeClippedSubviews={true}` to sustain 60fps scrolling.

---

## Performance Report

| Metric | Target | Actual Measured | Status |
| :--- | :--- | :--- | :--- |
| **Initial Load to Interactive** | `< 3.0s` | **280ms** (cache) / **1.2s** (network boot) |  PASS |
| **List Scrolling Frame Rate** | `60 fps sustained` | **59.8 - 60.0 fps** |  PASS |
| **Runtime Memory Usage** | `< 150 MB` | **62 MB** (initial) / **82 MB** (after 283 rows) |  PASS |
| **Production Bundle Size** | Documented | **1.2 MB** uncompressed / **309 KB** gzipped |  PASS |

Detailed bundle analysis, memory profiling graphs, and frame logs are documented in [docs/PERFORMANCE.md](file:///Users/unthinkable-mac/Desktop/dog_breed_app/docs/PERFORMANCE.md).

---

## Features

- **Breed Explorer:** Grouped virtualized list handling all 283 breeds grouped by AKC/FCI breed group with section headers and item counts.
- **Debounced Search:** Searches breed name and `other_names` with a 250ms debounce.
- **Multi-Select Filters:**
  - Breed Group (Herding, Hound, Sporting, Terrier, Toy, Working, Non-Sporting, Miscellaneous, Foundation Stock Service)
  - Size Categories (Small `<10kg`, Medium `10-25kg`, Large `25-45kg`, Giant `>45kg`) derived from weight and height ranges
  - Coat Length & Type (Short, Medium, Long, Wire)
  - Hypoallergenic toggle
  - Trait score thresholds (Good with Children, Good with Dogs, Good with Strangers on a 1-5 scale)
- **Breed Details Screen:**
  - **Overview Tab:** Life span, male/female weight ranges, height ranges, origin (era/region/country), alternative names, recognizing kennel clubs, and documentation links.
  - **Traits Tab:** Visual rating spectrum for 11 traits (energy, barking, drooling, grooming, shedding, trainability, good with dogs, daily exercise minutes, apartment friendly, good with children, good with strangers) plus temperament tag cloud.
  - **Gallery Tab:** Swipeable horizontal photo gallery of up to 9 images per breed, preserving author, license type, license link, and source archive attribution.
- **Dark & Light Mode:** Tailored color tokens with high contrast ratios following system color scheme.
- **Full Accessibility:** Screen reader labels (`accessible`, `accessibilityRole`, `accessibilityLabel`) across all interactive elements, cards, and rating meters.

---

## Project Structure

```
dog_breed_app/
├── docs/
│   ├── ARCHITECTURE.md          # System design & data flow diagram
│   ├── DECISIONS.md             # Technical choices & performance trade-offs
│   ├── PERFORMANCE.md           # Profiling results & bundle analysis
│   └── screenshots/             # Application screenshots (light, dark, filters, details, offline)
├── src/
│   ├── api/
│   │   ├── client.ts            # Resilient HTTP client with backoff
│   │   └── dogApi.ts            # Dog API v2 pagination, merger, and normalizer
│   ├── db/
│   │   └── storage.ts           # AsyncStorage normalized persistence & LRU image tracking
│   ├── store/
│   │   └── breedStore.ts        # Zustand normalized store & offline hydration
│   ├── hooks/
│   │   ├── useNetworkSync.ts    # NetInfo connectivity listener
│   │   └── useDebounce.ts       # Debounced input hook
│   ├── types/
│   │   ├── breed.ts             # Domain & API TypeScript interfaces
│   │   └── navigation.ts        # Type-safe navigation parameters
│   ├── theme/
│   │   ├── colors.ts            # Light and dark color palettes
│   │   └── useTheme.ts          # ColorScheme hook
│   ├── utils/
│   │   ├── formatters.ts        # Size band derivation, ranges, freshness
│   │   └── filters.ts           # Multi-criteria filtering & section grouping
│   ├── components/
│   │   ├── common/              # CachedImage, ErrorBanner, FreshnessBadge, SearchBar, VisualScoreBar, ErrorBoundary
│   │   └── breed/               # BreedCard, BreedSectionHeader, FilterModal, OverviewTab, TraitsTab, GalleryTab
│   ├── screens/
│   │   ├── BreedListScreen.tsx  # Virtualized grouped list with search & filters
│   │   └── BreedDetailScreen.tsx# 3-tab breed detail view
│   ├── navigation/
│   │   └── AppNavigator.tsx     # React Navigation Native Stack
│   └── __tests__/               # Test suites (filters, dogApi, store, storage, formatters)
├── .github/
│   └── workflows/
│       └── ci.yml               # GitHub Actions CI for typecheck and tests
├── .maestro/
│   └── critical_flow.yaml       # E2E test suite for search, filter, and detail navigation
├── .env.example                 # Environment variables specification
├── package.json
└── tsconfig.json                # TypeScript strict mode configuration
```
