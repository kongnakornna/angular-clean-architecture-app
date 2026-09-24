import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import Swal from 'sweetalert2';
import { TranslateService } from '@ngx-translate/core';
import { TranslatePipe } from '../../../../../shared/pipes/translate.pipe';
import { ScheduleApiDataSource } from '../../../data/datasources/schedule.api.datasource';

@Component({
  selector: 'app-zone-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TranslatePipe],
  templateUrl: './zone-edit.component.html',
})
export class ZoneEditComponent implements OnInit {
  id = '';
  name = '';
  description = '';
  sortOrder = 0;
  groupId = '';
  groups: any[] = [];
  loading = true;
  notFound = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dataSource: ScheduleApiDataSource,
    private translate: TranslateService,
  ) {}

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id') || '';
    this.dataSource.listGroups({ page: 1, pageSize: 500 }).subscribe({
      next: (res: any) => {
        const body = res?.payload || res;
        this.groups = Array.isArray(body) ? body : (body?.data || []);
      },
    });
    this.dataSource.listZones(undefined, { page: 1, pageSize: 500 }).subscribe({
      next: (res: any) => {
        const body = res?.payload || res;
        const items = Array.isArray(body) ? body : (body?.data || []);
        const zone = items.find((z: any) => String(z.id) === this.id);
        if (zone) {
          this.name = zone.name;
          this.description = zone.description || '';
          this.sortOrder = zone.sort_id || 0;
          this.groupId = zone.group_id || '';
        } else {
          this.notFound = true;
        }
        this.loading = false;
      },
      error: () => { this.loading = false; this.notFound = true; },
    });
  }

  onSubmit(): void {
    const msgs: string[] = [];
    if (!this.name.trim()) msgs.push(this.translate.instant('schedule.zones.errorNameRequired'));
    if (!this.groupId) msgs.push(this.translate.instant('schedule.zones.errorGroupRequired'));
    if (msgs.length) {
      Swal.fire({ icon: 'warning', title: this.translate.instant('schedule.zones.errorInvalidInput'), html: msgs.join('<br>'), timer: 1500, showConfirmButton: false });
      return;
    }
    this.dataSource.updateZone(this.id, {
      name: this.name.trim(),
      description: this.description,
      sort_id: Number(this.sortOrder) || 0,
      group_id: this.groupId,
    }).subscribe({
      next: () => {
        Swal.fire({ icon: 'success', title: this.translate.instant('schedule.zones.swalUpdated'), timer: 1000, showConfirmButton: false })
          .then(() => this.router.navigate(['/schedule/zones']));
      },
      error: (err) => Swal.fire({ icon: 'error', title: this.translate.instant('schedule.zones.swalUpdateFailed'), text: err?.error?.message || '', timer: 1500, showConfirmButton: false }),
    });
  }
}
