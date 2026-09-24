---
name: iot-angular-module
description: >-
  Build or extend the Angular IoT device-management feature module (Angular
  Clean Architecture / DDD: domain → data → presentation). Use when reading,
  maintaining, or implementing screens that list, register, map, chart, bucket,
  or control IoT devices from the IIoTRepository, or when wiring new endpoint
  calls, use cases, pages, or translation keys for the /iot route. Trigger:
  "iot devices", "device map", "sensor charts", "add device", "device monitor",
  "iot use case", "IIoTRepository", "device detail".
license: "Apache 2.0"
metadata:
  version: 0.0.1
  type: framework
  skills:
    - Angular
    - TypeScript
    - RxJS
    - Domain-Driven Design
    - Clean Architecture
  dependencies:
    - angular-tooling
    - angular-testing
    - clean-architecture
---

# IoT Device Management — Angular Feature Module

The `features/iot` module manages IoT devices through a strict Clean Architecture / DDD layering: `domain` (entities, repository contract, use cases) is the inner core, `data` (DTOs, API datasource, repository implementation) adapts external HTTP, and `presentation` (standalone pages) consumes domain models through injected repository interfaces.

## When to Use

- Add, maintain, or refactor code inside `src/app/features/iot` (or mirror its structure for a new feature).
- Add a new device API call: extend `IIoTRepository` → implement in the datasource → add the impl mapping → add a use case → wire the page.
- Fix ordering/pagination/status bugs in device list, detail, map, or monitor pages.
- Write unit tests that stub `IIoTRepository` at the domain boundary.

Don't use for:

- Backend/DB work (lives in the Go repo, `github.com/icmongolang`; the Angular module has no database).
- Non-IoT feature areas that already have their own module structure.

## Critical Patterns

### ✅ REQUIRED [CRITICAL]: Uniform use-case shape

Every one of the 25 use-case classes follows the same shape. Always copy it:

```ts
@Injectable({ providedIn: 'root' })
export class ListDevicesPaginatedUseCase {
  constructor(private repository: IIoTRepository) {}

  execute(params: ListDevicesPaginatedParams): Observable<PaginatedIoTData> {
    return this.repository.listDevicesPaginated(params);
  }
}
```

- ✅ Declared in the use-cases folder of `domain`.
- ✅ Constructor takes only `IIoTRepository` (via the token, never a concrete class).
- ✅ Exactly one public `execute()` returning `Observable<T>`.
- ❌ Multiple public methods or non-Observable (Promise/sync) returns.

### ✅ REQUIRED [CRITICAL]: Inject the repository through the DI token

Domain code must depend on the interface through the `IOT_REPOSITORY` InjectionToken, never the implementation class:

```ts
export const IOT_REPOSITORY = new InjectionToken<IIoTRepository>('IIoTRepository');
```

Provide the binder (data layer) and `@Inject(IOT_REPOSITORY)` everywhere downstream. This keeps `domain` free of `data` imports and makes tests able to substitute fakes.

- ✅ `IOT_REPOSITORY` token defined once and referenced by all consumers.
- ❌ `new IoTRepositoryImpl()` or constructor typing the concrete impl inside domain/presentation.

### ✅ REQUIRED [CRITICAL]: Never leak DTOs out of the data layer

DTO interfaces live in `data/dtos` with dates as `string`; domain entities use `Date`. The repository implementation is the ONLY place that maps them:

```ts
// data/repositories/iot.repository.impl.ts
getDeviceLocation(id: string): Observable<DeviceStatusInfo | null> {
  return this.datasource.getDeviceLocation(id).pipe(
    map((dto) => (dto ? toDeviceStatusInfo(dto) : null))
  );
}
```

- ✅ All DTO→domain mapping happens in `iot.repository.impl.ts` (helpers like `toDevice`, `toGPS`, `toDeviceGroup`).
- ✅ Domain and presentation never import from `data/dtos`.
- ❌ Optional fields collapsed to `undefined` instead of `?? {}` / explicit fallbacks (e.g. `other: d.other || {}`).

### ✅ REQUIRED: Layering and dependency direction

`domain` → `data` → `presentation` only. Inner layers never import outer layers.

- ✅ `domain` depends only on RxJS + the token; contains entities, the `IIoTRepository` interface, and use cases.
- ✅ `data` depends on `domain` + HTTP infrastructure; contains DTOs, datasource, and the repo impl.
- ✅ `presentation` depends on `domain` (via use cases) and standalone Angular primitives.
- ❌ `domain` importing `data/datasources` or presentation routines.

### ✅ REQUIRED: API routing through the datasource helper

All HTTP calls go through one datasource (`iot.api.datasource.ts`) that injects `HttpClient` + `ApiFallbackService` and prefixes routes with the active base URL:

```ts
private endpoint(path: string): string {
  return `${this.fallbackService.getActiveBaseUrl()}${path}`;
}

getDevices(): Observable<DeviceResponseDto[]> {
  return this.http.get<DeviceResponseDto[]>(this.endpoint(API_ENDPOINTS.iot.devices));
}
```

- ✅ Route constants centralised in `API_ENDPOINTS.iot.*`.
- ✅ Query params built with `HttpParams` (history, topic, pagination), never string interpolation.
- ❌ Hardcoding a base URL or concatenating query strings manually.

### ✅ REQUIRED: Device status semantics — numeric is the contract

`DeviceGroup.status` is a number (`0` offline, `1` online) and drives the list/monitor coloring; the entity-level `Device.status` is the string union `'online' | 'offline' | 'maintenance'`.

- ✅ Use `d.status === 1` / `=== 0` (numeric) for `DeviceGroup`-backed lists (see `device-list.component.ts` online/offline counts).
- ⚠ KNOWN INCONSISTENCY: `device-map` compares the string `'online'`/`'offline'`. When touching both, standardise on the numeric group contract and note the map path for follow-up.
- ❌ Mixing `=== 1` and `=== 'online'` in the same data source without a documented reason.

### ✅ REQUIRED: Stream-first presentation with BehaviorSubject + takeUntil

Pages expose state as `BehaviorSubject` streams with a single `Subject` for teardown:

```ts
private readonly destroy$ = new Subject<void>();
private readonly devicesSubject = new BehaviorSubject<DeviceGroup[]>([]);
readonly devices$ = this.devicesSubject.asObservable();

ngOnInit(): void {
  this.listUseCase.execute(this.paginationParams())
    .pipe(takeUntil(this.destroy$))
    .subscribe((paged) => {
      this.devicesSubject.next(paged.data);
      this.totalSubject.next(paged.total);
      this.loadingSubject.next(false);
    });
}

ngOnDestroy(): void {
  this.destroy$.next();
  this.destroy$.complete();
}
```

- ✅ Observable inputs always derived via `map` (e.g. `onlineCount$ = devices$.pipe(map(...))`).
- ✅ Unsubscribe with `takeUntil(this.destroy$)` and complete in `ngOnDestroy`.
- ❌ Array/imperative state mutation or leaking subscriptions.

### ✅ REQUIRED: Pagination contract

`listDevicesPaginated` returns `{ data: DeviceGroup[]; total: number; page: number }`; pages default to `pageSize = 10` starting at `page = 1` (not 0).

- ✅ Searchable fields passed through params: `bucket`, `hardwareId`, `typeId`, `keyword`, `lang`.
- ❌ Client-side total guesses when the payload already carries `total`.

### ✅ REQUIRED: Standalone, template-driven, translated UI

Pages are standalone components (`standalone: true`), each with its own external template (`templateUrl`) and styles (`styleUrls`), using `CommonModule`, `RouterLink`, `FormsModule`, and `TranslatePipe`.

- ✅ All user-visible labels come from translation keys under `iot.*` (see Appendix) — never hardcoded strings.
- ✅ Navigation uses `RouterLink` to declared `/iot` child routes (`/iot/devices`, `/iot/devices/create`).
- ❌ English/Thai literals inline in templates.

## System Overview

Feature module for IoT device management exposed under the `/iot` route. Users list devices (with grouping/bucketing, search, and pagination), register new devices, view device detail, see a map of device locations, monitor alarm status, and inspect sensor/topic charts. All data is fetched from an external IoT API (`/api/v1/iot/devices`, `/api/v1/iot/devices/{id}/location`) through a single repository contract consumed by 25 use cases and rendered by standalone pages with reactive state streams.

## Module Structure

```
src/app/features/iot/
├── README.md                         # Thai overview, folder structure, routes, API table
├── domain/
│   ├── entities/                     # device.entity.ts (Device, GPSData, SensorData, TopicData,
│   │                                 #   DeviceGroup, DeviceBucket, SensorChartData, DeviceStatusInfo,
│   │                                 #   DeviceConfig, PaginatedIoTData, DeviceStats)
│   ├── repositories/                 # iot.repository.ts  →  interface IIoTRepository (IOT_REPOSITORY token)
│   └── use-cases/                    # 25 uniform `@Injectable` use-case classes
├── data/
│   ├── dtos/                         # device-response.dto.ts  →  11 ResponseDto interfaces (dates: string)
│   ├── datasources/                  # iot.api.datasource.ts  →  HttpClient + ApiFallbackService
│   └── repositories/                 # iot.repository.impl.ts →  DTO→domain mapping
└── presentation/
    └── pages/
        ├── device-list/              # listing + pagination + search (BehaviorSubject streams)
        ├── device-detail/            # detail view (hardcoded edit link `/iot/devices/1/edit`)
        ├── device-map/               # location map (avatar bg-green/bg-red; placeholder for Google/OSM)
        ├── iot-settings/             # module settings
        └── iot-reports/              # reporting views
```

## Domain Layer

- **Entities** (`domain/entities/device.entity.ts`): `Device` (`id, name, deviceId, type, status: 'online'|'offline'|'maintenance', lastLocation?: GPSData, lastSeen?: Date, battery?, createdAt, updatedAt`), `GPSData` (`latitude, longitude, speed?, heading?, accuracy?, timestamp: Date`), `SensorData`, `TopicData` (incl. `mqttConnected, cacheEnabled, cacheHit, dataLength, fetchDurationMs`), `DeviceGroup` (numeric `status: number`; `valueData, unit, alarmTitle, statusWarning/Alert, recoveryWarning/Alert, icon, colorNormal/Warning/Alert`), `DeviceBucket`, `SensorChartData`, `DeviceStatusInfo` (incl. `location: { lat: number; lng: number }`), plus `DeviceConfig`, `PaginatedIoTData`, `DeviceStats`.
- **Repository contract** (`domain/repositories/iot.repository.ts`): `IIoTRepository` with ~24 methods — `listDevices`, `registerDevice`, `getDeviceLocation`, `getDeviceHistory`, `getSensorData`, `getTopicData`, `getTopicDeviceChart`, `getControls`, `postControl`, `getMonitorDeviceGroup`, `getMonitorDeviceChart`, `getDeviceBuckets`, `listDevicesPaginated`, `getSenserCharts`, `getDeviceSenserCharts`, and others; `IOT_REPOSITORY` InjectionToken. ⚠ Preserve the existing `getSenserCharts` spelling in new code for consistency.
- **Use cases** (`domain/use-cases/`): 25 single-purpose classes (e.g. `ListDevicesPaginatedUseCase`, `RegisterDeviceUseCase`, `GetDeviceLocationUseCase`, `GetDeviceHistoryUseCase`, `GetAlarmDeviceStatusUseCase`, `GetSenserChartsUseCase`) — each injects `IIoTRepository`, exposes one `execute()` returning `Observable<T>`.

## Application Layer

Application logic IS the use-case layer in this module (there is no separate service layer).

- Each screen maps to one or more use cases executed in `ngOnInit` (e.g. `device-list` runs `ListDevicesPaginatedUseCase` + `GetAlarmDeviceStatusUseCase`).
- Use cases do not know about the datasource, DTOs, or routing — they only orchestrate the repository contract.
- Add new application behaviors as new use cases in `domain/use-cases/`, never as methods on the datasource.

## Infrastructure Layer

- **DTOs** (`data/dtos/device-response.dto.ts`): 11 ResponseDto interfaces mirroring entities with `string` dates. Map only inside the impl.
- **Datasource** (`data/datasources/iot.api.datasource.ts`): injects `HttpClient` + `ApiFallbackService`; routes come from `API_ENDPOINTS.iot.*` prefixed by `endpoint()` (`fallbackService.getActiveBaseUrl()`); query params via `HttpParams`. Endpoints: `GET/POST /api/v1/iot/devices`, `GET /api/v1/iot/devices/{id}/location`.
- **Repository implementation** (`data/repositories/iot.repository.impl.ts`): binds the datasource to `IIoTRepository`, converts DTO→domain (`toDevice`, `toGPS`, `toDeviceGroup`), cast `string`→`Date`, applies fallbacks like `other: d.other || {}`.
- Backend/DB responsibilities belong to the Go repo (`github.com/icmongolang/internal/modules/{auth, users, customer}` — mirror its module pattern there).

## Interface Layer

`presentation/pages/` holds standalone, template-driven pages:

- **device-list** (`app-device-list`): `CommonModule`, `RouterLink`, `FormsModule`, `TranslatePipe`; state via `BehaviorSubject`s (`devices$=[], alarms$=[], loading$=true, total$=0`); derived `onlineCount$`/`offlineCount$` (`d.status === 1`/`=== 0`, `alarmCount$`); pagination `currentPage = 1`, `pageSize = 10`, `searchTerm`; teardown with `takeUntil(destroy$)`.
- **device-detail**: detail layout; edit link hardcoded `/iot/devices/1/edit`; back link `/iot/devices`.
- **device-map**: location markers with `bg-green`/`bg-red` avatars; map placeholder text "(ใช้ Google Maps หรือ OpenStreetMap API)".
- **iot-settings / iot-reports**: module settings and reporting screens.

Navigation is `RouterLink`-based over the `/iot` child routes (`/iot/devices`, `/iot/devices/create`).

## Database Migrations

The Angular IoT module owns no schema and performs no migrations. Database structure is managed entirely in the Go backend; follow `github.com/icmongolang/internal/modules/customer` (and `auth`/`users`) as the reference module layout when adding device tables, indices, or seed data. No Angular-side migration/table code exists or should be added.

## System Flow

```
[Presentation Page]                          [Domain]                        [Data]
─────────────────────                        ────────                        ──────
User action → use case.execute(params) ──►   UseCase
   (BehaviorSubject.next)                    │ execute() calls
        ▲                                    ▼
        │                          IIoTRepository (token)  ──►  IoTRepositoryImpl
        │                                  Observable<T>            │ DTO→domain map
        └───── derived streams (map)                   ◄────────────┤ Observable<Dto>
                                             datasource (.pipe/map)
                                                  HttpClient + ApiFallbackService
                                                        │
                                                        ▼
                                            GET/POST /api/v1/iot/devices
                                            GET /api/v1/iot/devices/{id}/location
```

1. Page `ngOnInit` invokes the relevant use case with `paginated/params` (page, pageSize, bucket, hardwareId, typeId, keyword, lang).
2. Use case delegates to `IIoTRepository` via `IOT_REPOSITORY`.
3. Repo impl calls the datasource, which builds the `endpoint()` URL with `HttpParams` and fires the request.
4. Response DTO flows back through the impl mapping into domain entities (dates → `Date`, fallbacks applied).
5. Use case returns `Observable<T>`; page `subscribe`s with `takeUntil(destroy$)` and pushes into `BehaviorSubject`s; template renders via `async | translate`.
6. Derived counts (`onlineCount$`, `offlineCount$`, `alarmCount$`) are computed with `map` on the base streams.

## Appendix

Translation keys used by the module (add under `iot` in i18n files; never hardcode labels):

`iot.subtitle`, `iot.title`, `iot.create`, `iot.totalDevices`, `iot.onlineDevices`, `iot.offlineDevices`, `iot.detail`, `iot.back`, `iot.edit`, `iot.deviceInfo`, `iot.deviceName`, `iot.deviceCode`, `iot.type`, `iot.mapTitle`, `iot.mapSubtitle`, `iot.mapPlaceholder`, `iot.deviceList`.

Reference backend search path for full-stack follow-ups: `C:\github\icmongolang\internal\modules\{auth, users, customer}`.
