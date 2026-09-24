import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import Swal from 'sweetalert2';
import { TranslateService } from '@ngx-translate/core';
import { TranslatePipe } from '../../../../../shared/pipes/translate.pipe';
import { ScheduleApiDataSource } from '../../../data/datasources/schedule.api.datasource';

@Component({
  selector: 'app-area-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TranslatePipe],
  templateUrl: './area-edit.component.html',
})
export class AreaEditComponent implements OnInit {
  id = '';
  name = '';
  description = '';
  sortOrder = 0;
  zoneId = '';
  zones: any[] = [];
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
    this.dataSource.listZones(undefined, { page: 1, pageSize: 500 }).subscribe({
      next: (res: any) => {
        const body = res?.payload || res;
        this.zones = Array.isArray(body) ? body : (body?.data || []);
      },
    });
    this.dataSource.listAreas(undefined, { page: 1, pageSize: 500 }).subscribe({
      next: (res: any) => {
        const body = res?.payload || res;
        const items = Array.isArray(body) ? body : (body?.data || []);
        const area = items.find((a: any) => String(a.id) === this.id);
        if (area) {
          this.name = area.name;
          this.description = area.description || '';
          this.sortOrder = area.sort_id || 0;
          this.zoneId = area.zone_id || '';
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
    if (!this.name.trim()) msgs.push(this.translate.instant('schedule.areas.errorNameRequired'));
    if (!this.zoneId) msgs.push(this.translate.instant('schedule.areas.errorZoneRequired'));
    if (msgs.length) {
      Swal.fire({ icon: 'warning', title: this.translate.instant('schedule.areas.errorInvalidInput'), html: msgs.join('<br>'), timer: 1500, showConfirmButton: false });
      return;
    }
    this.dataSource.updateArea(this.id, {
      name: this.name.trim(),
      description: this.description,
      sort_id: Number(this.sortOrder) || 0,
      zone_id: this.zoneId,
    }).subscribe({
      next: () => {
        Swal.fire({ icon: 'success', title: this.translate.instant('schedule.areas.swalUpdated'), timer: 1000, showConfirmButton: false })
          .then(() => this.router.navigate(['/schedule/areas']));
      },
      error: (err) => Swal.fire({ icon: 'error', title: this.translate.instant('schedule.areas.swalUpdateFailed'), text: err?.error?.message || '', timer: 1500, showConfirmButton: false }),
    });
  }
}
