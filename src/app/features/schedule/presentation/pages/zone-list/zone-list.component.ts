import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import Swal from 'sweetalert2';
import { TranslateService } from '@ngx-translate/core';
import { TranslatePipe } from '../../../../../shared/pipes/translate.pipe';
import { ScheduleApiDataSource } from '../../../data/datasources/schedule.api.datasource';

@Component({
  selector: 'app-zone-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TranslatePipe],
  templateUrl: './zone-list.component.html',
})
export class ZoneListComponent implements OnInit {
  items: any[] = [];
  loading = false;
  groupFilter = '';
  groups: any[] = [];

  constructor(
    private dataSource: ScheduleApiDataSource,
    private translate: TranslateService,
  ) {}

  ngOnInit(): void {
    this.loadGroups();
    this.loadItems();
  }

  loadGroups(): void {
    this.dataSource.listGroups({ page: 1, pageSize: 500 }).subscribe({
      next: (res: any) => {
        const body = res?.payload || res;
        this.groups = Array.isArray(body) ? body : (body?.data || []);
      },
    });
  }

  loadItems(): void {
    this.loading = true;
    this.dataSource.listZones(this.groupFilter || undefined, { page: 1, pageSize: 500 }).subscribe({
      next: (res: any) => {
        const body = res?.payload || res;
        this.items = Array.isArray(body) ? body : (body?.data || []);
        this.loading = false;
      },
      error: () => { this.loading = false; },
    });
  }

  onFilterChange(): void { this.loadItems(); }

  deleteItem(item: any): void {
    Swal.fire({
      title: this.translate.instant('schedule.zones.swalDeleteTitle'),
      text: `${this.translate.instant('schedule.zones.swalDeleteText')} "${item.name}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: this.translate.instant('schedule.zones.swalDelete'),
      cancelButtonText: this.translate.instant('schedule.zones.swalCancel'),
    }).then((result) => {
      if (result.isConfirmed) {
        this.dataSource.deleteZone(item.id).subscribe({
          next: () => {
            Swal.fire({ icon: 'success', title: this.translate.instant('schedule.zones.swalDeleted'), timer: 1000, showConfirmButton: false });
            this.loadItems();
          },
          error: (err) => Swal.fire({ icon: 'error', title: this.translate.instant('schedule.zones.swalError'), text: err?.error?.message || '', timer: 1500, showConfirmButton: false }),
        });
      }
    });
  }
}
