import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '../../../../../shared/pipes/translate.pipe';
import { ScheduleApiDataSource } from '../../../data/datasources/schedule.api.datasource';
import { ListSchedulesUseCase } from '../../../domain/use-cases/list-schedules.use-case';

@Component({
  selector: 'app-schedule-logs',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './schedule-logs.component.html',
})
export class ScheduleLogsComponent implements OnInit {
  items: any[] = [];
  loading = false;
  page = 1;
  pageSize = 10;
  total = 0;
  statusFilter = '';
  scheduleFilter = '';
  schedules: any[] = [];
  allSchedules: any[] = [];
  keyword = '';
  groupId = '';
  zoneId = '';
  areaId = '';
  groups: any[] = [];
  zones: any[] = [];
  areas: any[] = [];

  constructor(
    private dataSource: ScheduleApiDataSource,
    private listUseCase: ListSchedulesUseCase,
  ) {}

  ngOnInit(): void {
    this.loadFilterOptions();
    this.loadGroups();
    this.loadItems();
  }

  loadFilterOptions(): void {
    this.listUseCase.execute({ pageSize: 500 }).subscribe({
      next: (res) => {
        this.allSchedules = res.data;
        this.applyScheduleFilter();
      },
    });
  }

  applyScheduleFilter(): void {
    let list = this.allSchedules;
    if (this.groupId) list = list.filter(s => s.groupId === this.groupId);
    if (this.zoneId) list = list.filter(s => s.zoneId === this.zoneId);
    if (this.areaId) list = list.filter(s => s.areaId === this.areaId);
    this.schedules = list;
    if (this.scheduleFilter && !list.some(s => s.id === this.scheduleFilter)) {
      this.scheduleFilter = '';
    }
  }

  loadGroups(): void {
    this.dataSource.listGroups({ page: 1, pageSize: 500 }).subscribe({
      next: (res: any) => {
        const body = res?.payload || res;
        this.groups = Array.isArray(body) ? body : (body?.data || []);
      },
    });
  }

  onGroupChange(): void {
    this.zoneId = '';
    this.areaId = '';
    this.zones = [];
    this.areas = [];
    if (this.groupId) {
      this.dataSource.listZones(this.groupId, { page: 1, pageSize: 500 }).subscribe({
        next: (res: any) => {
          const body = res?.payload || res;
          this.zones = Array.isArray(body) ? body : (body?.data || []);
        },
      });
    }
    this.applyScheduleFilter();
  }

  onZoneChange(): void {
    this.areaId = '';
    this.areas = [];
    if (this.zoneId) {
      this.dataSource.listAreas(this.zoneId, { page: 1, pageSize: 500 }).subscribe({
        next: (res: any) => {
          const body = res?.payload || res;
          this.areas = Array.isArray(body) ? body : (body?.data || []);
        },
      });
    }
    this.applyScheduleFilter();
  }

  onAreaChange(): void {
    this.applyScheduleFilter();
  }

  loadItems(): void {
    this.loading = true;
    const params: any = { page: this.page, pageSize: this.pageSize };
    if (this.statusFilter) params.status = this.statusFilter;
    if (this.scheduleFilter) params.schedule_id = this.scheduleFilter;
    if (this.keyword) params.keyword = this.keyword;

    if (this.scheduleFilter) {
      this.dataSource.getHistoryBySchedule(this.scheduleFilter, { page: this.page, pageSize: this.pageSize }).subscribe({
        next: (res: any) => {
          const body = res?.payload || res;
          this.items = body?.data || [];
          this.total = body?.total || 0;
          this.loading = false;
        },
        error: () => { this.loading = false; },
      });
    } else {
      this.dataSource.getHistoryAll({ page: this.page, pageSize: this.pageSize, status: this.statusFilter || undefined }).subscribe({
        next: (res: any) => {
          const body = res?.payload || res;
          this.items = body?.data || [];
          this.total = body?.total || 0;
          this.loading = false;
        },
        error: () => { this.loading = false; },
      });
    }
  }

  search(): void { this.page = 1; this.loadItems(); }
  reset(): void {
    this.statusFilter = '';
    this.scheduleFilter = '';
    this.keyword = '';
    this.groupId = '';
    this.zoneId = '';
    this.areaId = '';
    this.zones = [];
    this.areas = [];
    this.applyScheduleFilter();
    this.page = 1;
    this.loadItems();
  }
  prevPage(): void { if (this.page > 1) { this.page--; this.loadItems(); } }
  nextPage(): void { if (this.page < this.totalPages) { this.page++; this.loadItems(); } }
  get totalPages(): number { return Math.ceil(this.total / this.pageSize); }

  statusLabel(status: string): string {
    return status || 'processing';
  }
}
