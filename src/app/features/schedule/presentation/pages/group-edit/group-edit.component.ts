import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import Swal from 'sweetalert2';
import { TranslateService } from '@ngx-translate/core';
import { TranslatePipe } from '../../../../../shared/pipes/translate.pipe';
import { ScheduleApiDataSource } from '../../../data/datasources/schedule.api.datasource';

@Component({
  selector: 'app-group-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TranslatePipe],
  templateUrl: './group-edit.component.html',
})
export class GroupEditComponent implements OnInit {
  id = '';
  name = '';
  description = '';
  sortOrder = 0;
  status = 'active';
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
    this.dataSource.listGroups({}).subscribe({
      next: (res: any) => {
        const body = res?.payload || res;
        const items = Array.isArray(body) ? body : (body?.data || []);
        const group = items.find((g: any) => String(g.id) === this.id);
        if (group) {
          this.name = group.name;
          this.description = group.description || '';
          this.sortOrder = group.sort_id || 0;
          this.status = group.status || 'active';
        } else {
          this.notFound = true;
        }
        this.loading = false;
      },
      error: () => { this.loading = false; this.notFound = true; },
    });
  }

  onSubmit(): void {
    if (!this.name.trim()) {
      Swal.fire({ icon: 'warning', title: this.translate.instant('schedule.groups.errorNameRequired'), timer: 1500, showConfirmButton: false });
      return;
    }
    this.dataSource.updateGroup(this.id, {
      name: this.name.trim(),
      description: this.description,
      sort_id: Number(this.sortOrder) || 0,
      status: this.status,
    }).subscribe({
      next: () => {
        Swal.fire({ icon: 'success', title: this.translate.instant('schedule.groups.swalUpdated'), timer: 1000, showConfirmButton: false })
          .then(() => this.router.navigate(['/schedule/groups']));
      },
      error: (err) => Swal.fire({ icon: 'error', title: this.translate.instant('schedule.groups.swalUpdateFailed'), text: err?.error?.message || '', timer: 1500, showConfirmButton: false }),
    });
  }
}
