import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import Swal from 'sweetalert2';
import { TranslateService } from '@ngx-translate/core';

import { ScheduleApiDataSource } from '../../../data/datasources/schedule.api.datasource';
import { ListSchedulesUseCase } from '../../../domain/use-cases/list-schedules.use-case';
import { TranslatePipe } from '../../../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-schedule-device',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TranslatePipe],
  templateUrl: './schedule-device.component.html',
})
export class ScheduleDeviceComponent implements OnInit {
  scheduleId = '';
  items: any[] = [];
  loading = false;
  page = 1;
  pageSize = 10;
  total = 0;
  keyword = '';
  schedules: any[] = [];
  selectedScheduleId = '';

  constructor(
    private route: ActivatedRoute,
    private dataSource: ScheduleApiDataSource,
    private listUseCase: ListSchedulesUseCase,
    private translate: TranslateService,
  ) {}

  ngOnInit(): void {
    this.scheduleId = this.route.snapshot.paramMap.get('id') || '';
    this.selectedScheduleId = this.scheduleId;
    this.loadFilterOptions();
    this.loadItems();
  }

  loadFilterOptions(): void {
    this.listUseCase.execute({ pageSize: 500 }).subscribe({
      next: (res) => {
        this.schedules = res.data;
      },
    });
  }

  loadItems(): void {
    this.loading = true;
    const sid = this.selectedScheduleId || this.scheduleId;
    if (!sid) { this.items = []; this.total = 0; this.loading = false; return; }
    this.dataSource.getDeviceList({
      page: this.page,
      pageSize: this.pageSize,
      schedule_id: sid,
      keyword: this.keyword,
    }).subscribe({
      next: (res: any) => {
        this.items = res?.payload?.data || res?.data || [];
        this.total = res?.payload?.total || res?.total || 0;
        this.loading = false;
      },
      error: () => { this.loading = false; },
    });
  }

  toggleDeviceAssignment(item: any): void {
    const isChecked = item.schedule_status === 1 || item.schedule_status === '1';
    const sid = this.selectedScheduleId || this.scheduleId;
    const snack = () => {
      Swal.fire({ icon: 'success', title: this.translate.instant('schedule.device.swalUpdated'), timer: 1000, showConfirmButton: false });
    };
    if (isChecked) {
      this.dataSource.mapDevices(sid, [Number(item.device_id)]).pipe().subscribe({
        next: () => { this.loadItems(); snack(); },
        error: () => this.loadItems(),
      });
    } else {
      this.dataSource.mapDevices(sid, [Number(item.device_id)]).pipe().subscribe({
        next: () => { this.loadItems(); snack(); },
        error: () => this.loadItems(),
      });
    }
  }

  isAssigned(item: any): boolean {
    return item.schedule_status === 1 || item.schedule_status === '1';
  }

  search(): void { this.page = 1; this.loadItems(); }
  reset(): void { this.keyword = ''; this.page = 1; this.loadItems(); }
  onScheduleChange(): void { this.page = 1; this.loadItems(); }
  prevPage(): void { if (this.page > 1) { this.page--; this.loadItems(); } }
  nextPage(): void { if (this.page < this.totalPages) { this.page++; this.loadItems(); } }
  get totalPages(): number { return Math.ceil(this.total / this.pageSize); }
}
