import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import Swal from 'sweetalert2';
import { TranslateService } from '@ngx-translate/core';
import { TranslatePipe } from '../../../../../shared/pipes/translate.pipe';
import { ScheduleApiDataSource } from '../../../data/datasources/schedule.api.datasource';

@Component({
  selector: 'app-group-list',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslatePipe],
  templateUrl: './group-list.component.html',
})
export class GroupListComponent implements OnInit {
  items: any[] = [];
  loading = false;

  constructor(
    private dataSource: ScheduleApiDataSource,
    private translate: TranslateService,
  ) {}

  ngOnInit(): void { this.loadItems(); }

  loadItems(): void {
    this.loading = true;
    this.dataSource.listGroups({ page: 1, pageSize: 500 }).subscribe({
      next: (res: any) => {
        const body = res?.payload || res;
        this.items = Array.isArray(body) ? body : (body?.data || []);
        this.loading = false;
      },
      error: () => { this.loading = false; },
    });
  }

  deleteItem(item: any): void {
    Swal.fire({
      title: this.translate.instant('schedule.groups.swalDeleteTitle'),
      text: `${this.translate.instant('schedule.groups.swalDeleteText')} "${item.name}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: this.translate.instant('schedule.groups.swalDelete'),
      cancelButtonText: this.translate.instant('schedule.groups.swalCancel'),
    }).then((result) => {
      if (result.isConfirmed) {
        this.dataSource.deleteGroup(item.id).subscribe({
          next: () => {
            Swal.fire({ icon: 'success', title: this.translate.instant('schedule.groups.swalDeleted'), timer: 1000, showConfirmButton: false });
            this.loadItems();
          },
        });
      }
    });
  }
}
