import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import Swal from 'sweetalert2';
import { TranslateService } from '@ngx-translate/core';
import { TranslatePipe } from '../../../../../shared/pipes/translate.pipe';
import { ScheduleApiDataSource } from '../../../data/datasources/schedule.api.datasource';

@Component({
  selector: 'app-zone-create',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TranslatePipe],
  templateUrl: './zone-create.component.html',
})
export class ZoneCreateComponent implements OnInit {
  name = '';
  description = '';
  sortOrder = 0;
  groupId = '';
  groups: any[] = [];

  constructor(
    private dataSource: ScheduleApiDataSource,
    private router: Router,
    private translate: TranslateService,
  ) {}

  ngOnInit(): void {
    this.dataSource.listGroups({ page: 1, pageSize: 500 }).subscribe({
      next: (res: any) => {
        const body = res?.payload || res;
        this.groups = Array.isArray(body) ? body : (body?.data || []);
      },
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
    this.dataSource.createZone({
      name: this.name.trim(),
      description: this.description,
      sort_id: Number(this.sortOrder) || 0,
      group_id: this.groupId,
    }).subscribe({
      next: () => {
        Swal.fire({ icon: 'success', title: this.translate.instant('schedule.zones.swalCreated'), timer: 1000, showConfirmButton: false })
          .then(() => this.router.navigate(['/schedule/zones']));
      },
      error: (err) => Swal.fire({ icon: 'error', title: this.translate.instant('schedule.zones.swalCreateFailed'), text: err?.error?.message || '', timer: 1500, showConfirmButton: false }),
    });
  }
}
