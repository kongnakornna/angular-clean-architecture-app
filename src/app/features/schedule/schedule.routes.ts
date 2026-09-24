import { Routes } from '@angular/router';

export const SCHEDULE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./presentation/layouts/schedule-layout/schedule-layout.component').then(
        (m) => m.ScheduleLayoutComponent
      ),
    children: [
      { path: '', redirectTo: '', pathMatch: 'full' },
      {
        path: '',
        loadComponent: () =>
          import('./presentation/pages/schedule-list/schedule-list.component').then(
            (m) => m.ScheduleListComponent
          ),
      },
      {
        path: 'create',
        loadComponent: () =>
          import('./presentation/pages/schedule-create/schedule-create.component').then(
            (m) => m.ScheduleCreateComponent
          ),
      },
      {
        path: ':id/edit',
        loadComponent: () =>
          import('./presentation/pages/schedule-edit/schedule-edit.component').then(
            (m) => m.ScheduleEditComponent
          ),
      },
      {
        path: ':id/data',
        loadComponent: () =>
          import('./presentation/pages/schedule-detail/schedule-detail.component').then(
            (m) => m.ScheduleDetailComponent
          ),
      },
      {
        path: ':id/device',
        loadComponent: () =>
          import('./presentation/pages/schedule-device/schedule-device.component').then(
            (m) => m.ScheduleDeviceComponent
          ),
      },
      {
        path: 'groups',
        loadComponent: () =>
          import('./presentation/pages/group-list/group-list.component').then(
            (m) => m.GroupListComponent
          ),
      },
      {
        path: 'groups/create',
        loadComponent: () =>
          import('./presentation/pages/group-create/group-create.component').then(
            (m) => m.GroupCreateComponent
          ),
      },
      {
        path: 'groups/:id/edit',
        loadComponent: () =>
          import('./presentation/pages/group-edit/group-edit.component').then(
            (m) => m.GroupEditComponent
          ),
      },
      {
        path: 'zones',
        loadComponent: () =>
          import('./presentation/pages/zone-list/zone-list.component').then(
            (m) => m.ZoneListComponent
          ),
      },
      {
        path: 'zones/create',
        loadComponent: () =>
          import('./presentation/pages/zone-create/zone-create.component').then(
            (m) => m.ZoneCreateComponent
          ),
      },
      {
        path: 'zones/:id/edit',
        loadComponent: () =>
          import('./presentation/pages/zone-edit/zone-edit.component').then(
            (m) => m.ZoneEditComponent
          ),
      },
      {
        path: 'areas',
        loadComponent: () =>
          import('./presentation/pages/area-list/area-list.component').then(
            (m) => m.AreaListComponent
          ),
      },
      {
        path: 'areas/create',
        loadComponent: () =>
          import('./presentation/pages/area-create/area-create.component').then(
            (m) => m.AreaCreateComponent
          ),
      },
      {
        path: 'areas/:id/edit',
        loadComponent: () =>
          import('./presentation/pages/area-edit/area-edit.component').then(
            (m) => m.AreaEditComponent
          ),
      },
      {
        path: 'logs',
        loadComponent: () =>
          import('./presentation/pages/schedule-logs/schedule-logs.component').then(
            (m) => m.ScheduleLogsComponent
          ),
      },
      {
        path: 'report',
        loadComponent: () =>
          import('./presentation/pages/schedule-report/schedule-report.component').then(
            (m) => m.ScheduleReportComponent
          ),
      },
    ],
  },
];
