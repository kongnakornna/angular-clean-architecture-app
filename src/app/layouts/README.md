# Layout Components
โมดูลสำหรับโครงสร้างหลักของแอปพลิเคชัน (App Shell) 
ประกอบด้วย Layout หลัก header, sidebar, และ footer

```
layouts/
  ├── app-layout/            # โครงสร้างหลักของ App Shell
  │   └── app-layout.component.ts
  ├── header/                # ส่วนหัวจอ (navbar + การนำทางแนวนอน)
  │   ├── header.component.ts
  │   ├── header.component.html
  │   └── header.icons.ts
  ├── sidebar/               # เมนูด้านข้าง
  │   ├── sidebar.component.ts
  │   └── sidebar.component.html
  ├── footer/                # ส่วนท้ายจอ
  │   └── footer.component.html
  ├── layout-settings/       # ตัวตั้งค่ารูปลักษณ์ Layout
  │   ├── layout-settings.component.ts
  │   └── layout-settings.component.html
  ├── page-header/           # พื้นที่สำหรับแสดงหัวเรื่องของหน้า
  │   └── page-header.component.ts
  ├── blank/                 # Layout เปล่าไม่มี sidebar
  │   └── README.md
  ├── classic/               # Layout มาตรฐาน
  │   └── README.md
  └── README.md
```

### AppLayoutComponent

- selector: `app-layout`
- `standalone: false`
- State ภายใน: `isSidebarCollapsed`
- `toggleSidebar()`: สลับ class `sidebar-collapsed` บน `document.body`

โครงสร้าง template:

- skip-link สำหรับผู้ใช้แป้นพิมพ์
- `<div class="page">`
- `<app-header>`
- `<ng-content select="[page-header]">` สำหรับส่วนหัวของหน้า
- `<main class="page-body" id="content">` → `.container-xl` → `<router-outlet>`
- `<app-footer>`
- `<app-layout-settings>`

CSS หลัก:

- `.app-wrapper`: ความสูงเต็มจอ `flex`
- `.page-wrapper`: `margin-left: 240px`
- `.sidebar-collapsed .page-wrapper`: `margin-left: 60px`
- ใช้ `transition: margin-left 0.3s ease`

### HeaderComponent

- `@Output() toggleSidebar`: ส่งอีเวนต์เพื่อเปิด/ปิด sidebar
- `unreadCount`: จำนวนแจ้งเตือนที่ยังไม่ได้อ่าน
- `notifications`: รายการแจ้งเตือน
- `profileMenu`: เมนูโปรไฟล์ (โปรไฟล์ / ตั้งค่า / ออกจากระบบ)
- `logout()`: ล้าง `localStorage` แล้วนำไปที่ `/login`

เมนูนำทางแนวนอน (Horizontal Menu) มีโครงสร้างแบบหลายระดับ:

| เมนู | ไอคอน | เส้นทาง |
| --- | --- | --- |
| `nav.alerting` (การแจ้งเตือน) | `nav.alarm` | `/settings/alarm` |
| `nav.storage` (ที่เก็บข้อมูล) | `nav.influxdb` | `/settings/influx` |
| `nav.device` (อุปกรณ์) | — | `/settings/device`, `/settings/location`, `/settings/hardware`, `/settings/sensor` |
| `nav.connectivity` (การเชื่อมต่อ) | — | `/settings/nodered`, `/settings/mqtt` |
| `nav.notification` (การแจ้งเตือน) | — | `/settings/email`, `/settings/line`, `/settings/sms` |
| `nav.system` (ระบบ) | — | `/settings/host`, `/settings/api` (API_ICON), `/settings/token` (KEY_ICON) |
| `nav.appearance` (หน้าตาแอป) | — | `/settings/theme` (PALETTE_ICON), `/settings/language` (LANGUAGE_ICON) |
| `nav.reports` (รายงาน) | REPORT_ICON | `/reports` |
| └ iotReports | CHART_BAR_ICON | `/reports/schedule` (CALENDAR_EVENT_ICON), `/reports/alarm` (BELL_ICON), `/reports/logs-control` (LIST_DETAILS_ICON), `/reports/device` (DEVICE_DESKTOP_ICON) |
| `nav.analytics` (วิเคราะห์ข้อมูล) | CHART_AREA_ICON | `/analytics`, `/analytics/analyst` (CHART_DOTS_2_ICON) |
| `nav.ai` (AI) | AI_ICON | `/ai-analytics` |
| `nav.operations` (ปฏิบัติการ) | ROBOT_ICON | `/ai-analytics/command-center`, `/ai-analytics/dashboard` (CHART_AREA_ICON), `/ai-analytics/logs` (LIST_DETAILS_ICON) |
| `nav.automation` (อัตโนมัติ) | WAVE_SQUARE_ICON | `/ai-analytics/workflow`, `/ai-analytics/schedule` (CALENDAR_EVENT_ICON), `/ai-analytics/alerts` (BELL_ICON) |
| `nav.reports` (รายงาน AI) | FILE_INVOICE_ICON | `/ai-analytics/reports` |
| `nav.dataAnalyst` (นักวิเคราะห์ข้อมูล) | CHART_DOTS_2_ICON | `/ai-analytics/analyst` |

พฤติกรรมอื่น ๆ ของ Header:

- `openFullscreen()`: สลับโหมดเต็มจอ โดยรองรับ `webkitRequestFullscreen`, `msRequestFullscreen`, `mozRequestFullScreen` เป็นทางเลือก
- `logout()`: เก็บค่า `tabler-*` ใน `localStorage` ไว้ก่อน แล้วจึง `localStorage.clear()` ฟื้นค่า theme ที่บันทึกไว้ และ `window.location.href = "/login"`
- `openLogoutConfirm()` / `cancelLogout()`: แสดง/ซ่อน modal ยืนยัน `showLogoutConfirm`
- `confirmLogout()`: เรียก `logoutAllUseCase.execute()` แล้ว `finalize(() => this.logout())`
- Getters: `isDarkMode`, `layoutMode`, `toggleTheme()`, `setLayout("fluid" | "boxed" | "boxed-2")`

ส่วนประกอบใน template:

- `<app-language-selector>`: เลือกภาษา
- Horizontal nav (dropdown แบบหลายระดับ): ใช้ `data-bs-toggle="dropdown"` และ `data-bs-auto-close="outside"` ระดับ 2 ใช้ `li.dropdown-submenu` + `#level2NoChildren` else-template แสดงไอคอนผ่าน `isSvgIcon` / `trustHtml` / `getIconName`
- Settings offcanvas: `data-bs-toggle="offcanvas" data-bs-target="#offcanvas-settings"` พร้อม badge และไอคอน `nav.new`
- `<app-confirm-modal>`: ใช้ keys `layout.header.signOutConfirmTitle/Message/Button`

ไฟล์ `header.icons.ts` มีค่าไอคอน Tabler ที่ import มาใช้ เช่น `CHART_DOTS_2`, `WAVE_SQUARE`, `CALENDAR_EVENT`, `BELL`, `DATABASE`, `MAP_PIN`, `THERMOMETER`, `SERVER`, `MESSAGE_CIRCLE`, `PHONE`, `KEY`, `API`, `MONITORING`, `REPORT`, `SMART_HOME`, `SMART_CITY`, `SMART_MONITOR`, และท้ายไฟล์ `INDUSTRY_ICON` (tabler-industry), `SMART_SOLAR_ICON` (tabler-sun)

### SidebarComponent

- `@Input() isCollapsed`: สถานะ sidebar ย่อ/ขยาย
- `MenuItem { label, icon, route?, children? }`

เมนูภาษาไทย:

- แดชบอร์ด
- การจัดการงาน → รายการงาน, บอร์ดงาน, สร้างงาน
- ลูกค้า → รายการลูกค้า, เพิ่มลูกค้า
- ใบเสนอราคา
- ใบสั่งซื้อ
- สินค้าคงคลัง
- การชำระเงิน
- เอกสาร
- อุปกรณ์ IoT
- คำสั่งซื้อออนไลน์
- ระบบ → ผู้ใช้งาน, บทบาท

State ภายใน: `expandedMenus: Set<string>` พร้อม `toggleSubmenu(label)` / `isExpanded(label)`

Template:

- เมนูที่มีลูก (child) ใช้ `#childHasChildren` แบบ `dropend` dropdown
- ใช้ `routerLinkActive="{exact: true}"` สำหรับไฮไลต์เมนูที่ใช้งาน
- สนับสนุน badges

### FooterComponent

- `currentYear`: ปีปัจจุบันของ footer
- ใช้ `margin-top: auto` ดันให้ footer อยู่ท้ายจอเสมอ

### LayoutSettingsComponent

- `bases = ['slate', 'gray', 'zinc', 'neutral', 'stone']`: ชุดสีพื้นฐาน
- `radii = ['0', '0.5', '1', '1.5', '2']`: รัศมีมุมโค้ง
- `update(key, value)`: อัปเดตค่า layout ผ่าน `layout.update(key, value)`
- `reset()`: เรียก `layout.reset()`

Template ประกอบด้วยการเลือกธีม, สี, ฟอนต์, theme-base, radii, ปุ่ม reset และ link บันทึก

## การใช้งาน

```ts
{
  path: '',
  component: AppLayoutComponent,
  children: [
    {
      path: 'dashboard',
      loadChildren: () => import('./features/dashboard/feature/dashboard/dashboard.feature').then((m) => m.DashboardFeature),
    },
  ],
}
```

## สีและธีม

Components ใช้ CSS variables จาก Tabler (`var(--tblr-*)`) เพื่อรองรับการเปลี่ยนธีม

## docker Cli

```bash
docker compose up
docker compose up --build
docker compose down -v
```
