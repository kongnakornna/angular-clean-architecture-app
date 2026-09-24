import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import Swal from 'sweetalert2';
import { TranslateService } from '@ngx-translate/core';
import { TranslatePipe } from '../../../../../shared/pipes/translate.pipe';
import { ScheduleApiDataSource } from '../../../data/datasources/schedule.api.datasource';

@Component({
  selector: 'app-area-create',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TranslatePipe],
  templateUrl: './area-create.component.html',
})
export class AreaCreateComponent implements OnInit {
  name = '';
  description = '';
  sortOrder = 0;
  zoneId = '';
  zones: any[] = [];

  constructor(
    private dataSource: ScheduleApiDataSource,
    private router: Router,
    private translate: TranslateService,
  ) {}

  ngOnInit(): void {
    this.dataSource.listZones(undefined, { page: 1, pageSize: 500 }).subscribe({
      next: (res: any) => {
        const body = res?.payload || res;
        this.zones = Array.isArray(body) ? body : (body?.data || []);
      },
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
    this.dataSource.createArea({
      name: this.name.trim(),
      description: this.description,
      sort_id: Number(this.sortOrder) || 0,
      zone_id: this.zoneId,
    }).subscribe({
      next: () => {
        Swal.fire({ icon: 'success', title: this.translate.instant('schedule.areas.swalCreated'), timer: 1000, showConfirmButton: false })
          .then(() => this.router.navigate(['/schedule/areas']));
      },
      error: (err) => Swal.fire({ icon: 'error', title: this.translate.instant('schedule.areas.swalCreateFailed'), text: err?.error?.message || '', timer: 1500, showConfirmButton: false }),
    });
  }
}
