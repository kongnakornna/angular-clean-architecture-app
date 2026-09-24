import { Routes } from '@angular/router';

import { PermissionGuard } from '../../shared/guards/permission.guard';

export const USER_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'listdata',
    pathMatch: 'full',
  },
  {
    path: 'listdata',
    loadComponent: () =>
      import('./presentation/pages/user-list/user-list.component').then(
        (m) => m.UserListComponent
      ),
    canActivate: [PermissionGuard],
    data: { permission: 'user.view' },
  },
  {
    path: 'users',
    redirectTo: 'listdata',
    pathMatch: 'full',
  },
  {
    path: 'profile',
    loadComponent: () =>
      import('./presentation/pages/profile/profile.component').then((m) => m.ProfileComponent),
  },
  {
    path: 'create',
    loadComponent: () =>
      import('./presentation/pages/user-create/user-create.component').then(
        (m) => m.UserCreateComponent
      ),
    canActivate: [PermissionGuard],
    data: { permission: 'user.create' },
  },
  {
    path: 'edit/:id',
    loadComponent: () =>
      import('./presentation/pages/user-edit/user-edit.component').then(
        (m) => m.UserEditComponent
      ),
  },
  {
    path: 'roles',
    loadComponent: () =>
      import('./presentation/pages/role-list/role-list.component').then(
        (m) => m.RoleListComponent
      ),
    canActivate: [PermissionGuard],
    data: { permission: 'role.view' },
  },
];
