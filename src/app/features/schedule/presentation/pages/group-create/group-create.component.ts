import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import Swal from 'sweetalert2';
import { TranslateService } from '@ngx-translate/core';
import { TranslatePipe } from '../../../../../shared/pipes/translate.pipe';
import { ScheduleApiDataSource } from '../../../data/datasources/schedule.api.datasource';

@Component({
  selector: 'app-group-create',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TranslatePipe],
  templateUrl: './group-create.component.html',
})
export class GroupCreateComponent {
  name = '';
  description = '';
  sortOrder = 0;
  status = 'active';

  constructor(
    private dataSource: ScheduleApiDataSource,
    private router: Router,
    private translate: TranslateService,
  ) {}

  onSubmit(): void {
    if (!this.name.trim()) {
      Swal.fire({ icon: 'warning', title: this.translate.instant('schedule.groups.errorNameRequired'), timer: 1500, showConfirmButton: false });
      return;
    }
    this.dataSource.createGroup({
      name: this.name.trim(),
      description: this.description,
      sort_id: Number(this.sortOrder) || 0,
      status: this.status,
    }).subscribe({
      next: () => {
        Swal.fire({ icon: 'success', title: this.translate.instant('schedule.groups.swalCreated'), timer: 1000, showConfirmButton: false })
          .then(() => this.router.navigate(['/schedule/groups']));
      },
      error: (err) => Swal.fire({ icon: 'error', title: this.translate.instant('schedule.groups.swalCreateFailed'), text: err?.error?.message || '', timer: 1500, showConfirmButton: false }),
    });
  }
}
