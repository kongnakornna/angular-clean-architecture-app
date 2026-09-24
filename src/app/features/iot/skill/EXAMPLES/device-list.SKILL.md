---
name: device-list
description: >-
  Guidance for building or modifying the device-list component in the IoT Angular
  module. Trigger: "device list", "device table", "app-device-list", "device map
  page", "ListDevicesPaginatedUseCase", "GetAlarmDeviceStatusUseCase".
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
    - angular-tooling: ">=20"
    - angular-testing: ">=20"
    - clean-architecture: "1.0"
---

# Device List (device-list Component)

The device-list page is a standalone Angular component bounded to the IoT Clean
Architecture module. It renders a paginated, searchable device table with
online/offline/alarm stat cards and routes to Create Device via `RouterLink`.

## When to Use

Use this skill when the task involves the device-list page: adding or changing
the device table, stat cards, search/filter, pagination, or the data streams
that back `devices$`, `alarms$`, `loading$`, and `total$`.

Don't use for:

- Backend or database work in the Go repository (`github.com/icmongolang`).
- Non-IoT feature areas of the Angular app.
- Other IoT pages (device detail, create device, sensor charts) unless the
  change crosses the shared domain/data boundaries described below.

## Critical Patterns

The device-list component must follow the same conventions as every other
use-case-driven page in the IoT module.

### ✅ REQUIRED [CRITICAL]: Uniform Use-Case Shape

Data loaders are use-case classes returned through the repository interface.
Each use case has exactly one public `execute()` returning an `Observable`.

```typescript
// ✅ CORRECT — domain use case, single method, Observable return
@Injectable({ providedIn: 'root' })
export class ListDevicesPaginatedUseCase {
  constructor(private repository: IIoTRepository) {}

  execute(params: ListDeviceParamsType): Observable<Device[] | ResponseDto<Device[]>> {
    return this.repository.getDevices(params);
  }
}
```

```typescript
// ❌ WRONG — multiple public methods or non-Observable returns
@Injectable({ providedIn: 'root' })
export class ListDevicesPaginatedUseCase {
  execute(): Device[] { /* sync return */ }
  mapPage(): void { /* second behavior */ }
}
```

### ✅ REQUIRED [CRITICAL]: Inject the Repository by Token

The component must never construct or reference a concrete repository
implementation. It depends on `IIoTRepository` through the `IOT_REPOSITORY`
injection token and receives use-case instances through DI.

```typescript
// ✅ CORRECT — component depends on the token, not the impl
export const IOT_REPOSITORY = new InjectionToken<IIoTRepository>('IIoTRepository');

constructor(
  private listDevicesUseCase: ListDevicesPaginatedUseCase,
  private getAlarmStatusUseCase: GetAlarmDeviceStatusUseCase,
) {}
```

```typescript
// ❌ WRONG — presentation layer hitting the concrete implementation
constructor(private repository: IoTRepositoryImpl) {}
```

### ✅ REQUIRED [CRITICAL]: DTO Isolation and Mapping

DTOs live in `data/dtos` with string dates; domain entities use `Date`. The
repository implementation (`iot.repository.impl.ts`) is the only place that
maps DTOs to domain entities (`toDevice`, `toGPS`, `toDeviceGroup`,
`toDeviceStatusInfo`).

```typescript
// ✅ CORRECT — mapper lives in the repository impl layer
getDeviceLocation(id: number): Observable<DeviceStatusInfo | null> {
  return this.api.getDeviceLocation(id).pipe(
    map((dto) => (dto ? toDeviceStatusInfo(dto) : null)),
  );
}
```

```typescript
// ❌ WRONG — collapsing optional fields to undefined instead of explicit fallbacks
const other = dto.other; // undefined loses the empty-object default
```

Domains and presentation never import from `data/dtos`.

### ✅ REQUIRED: External Template and Styles

The component uses an external template and stylesheet, not inline ones.

```typescript
// ✅ CORRECT — standalone page with external templateUrl and styleUrls
@Component({
  selector: 'app-device-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, TranslatePipe],
  templateUrl: './device-list.component.html',
  styleUrls: ['./device-list.component.scss'],
})
```

```typescript
// ❌ WRONG — inline template/styles on a page-level component
@Component({ template: `...`, styles: [`...`] })
```

### ✅ REQUIRED [CRITICAL]: Layer Direction

Dependency order is `domain` → `data` → `presentation`. Inner layers never
import outer layers.

```typescript
// ✅ CORRECT — presentation only touches domain use cases + Angular primitives
import { ListDevicesPaginatedUseCase } from '../../../../domain/use-cases';
```

```typescript
// ❌ WRONG — domain importing the data layer
import { IoTRepositoryImpl } from '../../data/repositories/iot.repository.impl';
```

### ✅ REQUIRED: Single HTTP Datasource

All HTTP for the module flows through `iot.api.datasource.ts`, which injects
`HttpClient` and `ApiFallbackService`, builds URLs with `endpoint(path)`, and
passes query parameters with `HttpParams`.

```typescript
// ✅ CORRECT — centralized endpoint builder + HttpParams
private endpoint(path: string): string {
  return `${this.fallbackService.getActiveBaseUrl()}${path}`;
}

let params = new HttpParams();
if (searchTerm) params = params.set('search', searchTerm);
return this.http.get<ResponseDto<Device[]>>(this.endpoint(API_ENDPOINTS.iot.deviceList), { params });
```

```typescript
// ❌ WRONG — hardcoded base URL or interpolated query strings
this.http.get(`http://example.com/api/iot/devices?search=${searchTerm}`);
```

## Component Structure

State lives in BehaviorSubjects, data loads once at construction, and
subsections are driven by async pipes and count streams derived with `.pipe` /
`.map` and a single `takeUntil(destroy$)`.

```typescript
private readonly destroy$ = new Subject<void>();
devices$ = new BehaviorSubject<Device[]>([]);
alarms$ = new BehaviorSubject<AlarmDevice[]>([]);
loading$ = new BehaviorSubject<boolean>(true);
total$ = new BehaviorSubject<number>(0);

onlineCount$ = this.devices$.pipe(map((d) => d.filter((x) => x.status === 1).length));
offlineCount$ = this.devices$.pipe(map((d) => d.filter((x) => x.status === 0).length));
alarmCount$ = this.alarms$.pipe(map((a) => a.length));

currentPage = 1;
pageSize = 10;
searchTerm = '';

constructor(...) {
  this.loadDevices();
  this.loadAlarms();
}

private loadAlarms(): void {
  this.getAlarmStatusUseCase
    .execute({ page: 1, pageSize: 100 })
    .pipe(takeUntil(this.destroy$))
    .subscribe((res) => {
      this.alarms$.next(Array.isArray(res) ? res : (res?.data ?? []));
    });
}

search(): void {
  this.currentPage = 1;
  this.loadDevices();
}

resetFilters(): void {
  this.searchTerm = '';
  this.currentPage = 1;
  this.loadDevices();
}

totalPages(): number {
  return Math.ceil(this.total$.value / this.pageSize) || 1;
}
```

Note: the existing `getSenserCharts` method name is a known typo and must be
preserved during any refactor.

## Key Interface

The page template binds only streams and safe ASCII strings; every label comes
from the translation keys in the module i18n map (`iot.totalDevices`,
`iot.onlineDevices`, `iot.offlineDevices`, `iot.deviceList`, `iot.mapTitle`,
`iot.mapSubtitle`, `iot.mapPlaceholder`, `iot.create`).

Maintain this contract when touching the template:

| Concern      | Requirement                                            |
| ------------ | ------------------------------------------------------ |
| Table data   | `devices$ \| async` and `total$ \| async` via pipes    |
| Stat cards   | `onlineCount$ \| async`, `offlineCount$ \| async`      |
| Alarm card   | `alarmCount$ \| async`                                 |
| Navigation   | `routerLink="/iot/devices/create"`                     |
| Empty map    | `iot.mapPlaceholder` placeholder text                   |

## Migration Checklist

When editing a use case, repository method, or shared entity that the
device-list consumes, verify every layer is updated in order:

1. Domain entity + repository interface (`IIoTRepository`) first.
2. Data layer: DTO + `iot.api.datasource.ts` + mapper in `iot.repository.impl.ts`.
3. Use-case class (single `execute`, Observable return).
4. Presentation: update the injected use case / stream subscription.
5. i18n key additions in `iot.*` if any new label appears.