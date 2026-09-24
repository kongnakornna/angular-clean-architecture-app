import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { TranslateService } from '@ngx-translate/core';

import { BehaviorSubject } from 'rxjs';

import Swal from 'sweetalert2';

import { ScheduleApiDataSource } from '../../../data/datasources/schedule.api.datasource';
import { Schedule } from '../../../domain/entities/schedule.entity';
import { DeleteScheduleUseCase } from '../../../domain/use-cases/delete-schedule.use-case';
import { ListSchedulesUseCase } from '../../../domain/use-cases/list-schedules.use-case';
import { TranslatePipe } from '../../../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-schedule-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, TranslatePipe],
  templateUrl: './schedule-list.component.html',
  styleUrls: ['./schedule-list.component.scss'],
})
export class ScheduleListComponent implements OnInit {
  private itemsSubject = new BehaviorSubject<Schedule[]>([]);
  items$ = this.itemsSubject.asObservable();
  private filteredSubject = new BehaviorSubject<Schedule[]>([]);
  filteredItems$ = this.filteredSubject.asObservable();
  private loadingSubject = new BehaviorSubject<boolean>(true);
  loading$ = this.loadingSubject.asObservable();
  searchTerm = '';
  eventActionFilter = '';
  statusFilter = '';
  modeFilter = '';
  groupId = '';
  zoneId = '';
  areaId = '';
  groups: any[] = [];
  zones: any[] = [];
  areas: any[] = [];
  monthFilter = 0;
  dateFilter = 0;
  monthOptions = Array.from({ length: 12 }, (_, i) => i + 1);
  dateOptions = Array.from({ length: 31 }, (_, i) => i + 1);
  timeFrom = '00:00';
  timeTo = '23:59';
  page = 1;
  pageSize = 10;
  total = 0;

  constructor(
    private listUseCase: ListSchedulesUseCase,
    private deleteUseCase: DeleteScheduleUseCase,
    private dataSource: ScheduleApiDataSource,
    private translate: TranslateService,
  ) {}

  ngOnInit(): void {
    this.loadGroups();
    this.loadZones();
    this.loadAreas();
    this.loadItems();
  }

  private applyMonthDateFilter(): void {
    const all = this.itemsSubject.value;
    let list = all;
    if (this.monthFilter) list = list.filter(s => Array.isArray(s.months) && s.months.includes(this.monthFilter));
    if (this.dateFilter) list = list.filter(s => Array.isArray(s.dates) && s.dates.includes(this.dateFilter));
    const from = this.norm(this.timeFrom);
    const to = this.norm(this.timeTo);
    list = list.filter(s => {
      const t = this.norm(s.timeStart);
      return t >= from && t <= to;
    });
    this.filteredSubject.next(list);
  }

  private norm(value: string | undefined | null): string {
    const v = value?.trim() || '00:00';
    const m = v.match(/^(\d{1,2}):(\d{2})/);
    if (!m) return '00:00';
    const h = String(Number(m[1])).padStart(2, '0');
    return `${h}:${m[2]}`;
  }

  loadGroups(): void {
    this.dataSource.listGroups({ page: 1, pageSize: 5000000 }).subscribe({
      next: (res: any) => {
        const body = res?.payload || res;
        this.groups = Array.isArray(body) ? body : (Array.isArray(body?.groups) ? body.groups : (body?.data || []));
      },
    });
  }

  onGroupChange(): void {
    this.zoneId = '';
    this.areaId = '';
    this.zones = [];
    this.areas = [];
    if (this.groupId) {
      this.dataSource.listZones(this.groupId, { page: 1, pageSize: 5000000 }).subscribe({
        next: (res: any) => {
          const body = res?.payload || res;
          this.zones = Array.isArray(body) ? body : (Array.isArray(body?.zones) ? body.zones : (body?.data || []));
        },
      });
    }
    this.search();
  }

  onZoneChange(): void {
    this.areaId = '';
    this.areas = [];
    if (this.zoneId) {
      this.dataSource.listAreas(this.zoneId, { page: 1, pageSize: 5000000 }).subscribe({
        next: (res: any) => {
          const body = res?.payload || res;
          this.areas = Array.isArray(body) ? body : (Array.isArray(body?.areas) ? body.areas : (body?.data || []));
        },
      });
    }
    this.search();
  }

  loadZones(): void {
    this.dataSource.listZones(undefined, { page: 1, pageSize: 5000000 }).subscribe({
      next: (res: any) => {
        const body = res?.payload || res;
        this.zones = Array.isArray(body) ? body : (Array.isArray(body?.zones) ? body.zones : (body?.data || []));
      },
    });
  }

  loadAreas(): void {
    this.dataSource.listAreas(undefined, { page: 1, pageSize: 5000000 }).subscribe({
      next: (res: any) => {
        const body = res?.payload || res;
        this.areas = Array.isArray(body) ? body : (Array.isArray(body?.areas) ? body.areas : (body?.data || []));
      },
    });
  }

  loadItems(): void {
    this.loadingSubject.next(true);
    const params: any = {
      page: this.page,
      pageSize: this.pageSize,
    };
    if (this.searchTerm) params.keyword = this.searchTerm;
    if (this.eventActionFilter) params.eventAction = this.eventActionFilter;
    if (this.statusFilter !== '') params.status = this.statusFilter;
    if (this.modeFilter) params.mode = this.modeFilter;
    if (this.groupId) params.groupId = this.groupId;
    if (this.zoneId) params.zoneId = this.zoneId;
    if (this.areaId) params.areaId = this.areaId;
    this.listUseCase.execute(params).subscribe({
      next: (res) => {
        this.itemsSubject.next(res.data);
        this.applyMonthDateFilter();
        this.total = res.total;
        this.loadingSubject.next(false);
      },
      error: () => this.loadingSubject.next(false),
    });
  }

  onMonthDateChange(): void {
    this.applyMonthDateFilter();
  }

  search(): void { this.page = 1; this.loadItems(); }
  reset(): void {
    this.searchTerm = '';
    this.eventActionFilter = '';
    this.statusFilter = '';
    this.modeFilter = '';
    this.groupId = '';
    this.zoneId = '';
    this.areaId = '';
    this.zones = [];
    this.areas = [];
    this.monthFilter = 0;
    this.dateFilter = 0;
    this.timeFrom = '00:00';
    this.timeTo = '23:59';
    this.page = 1;
    this.loadItems();
  }
  goToPage(p: number): void { if (p >= 1 && p <= this.totalPages && p !== this.page) { this.page = p; this.loadItems(); } }
  prevPage(): void { if (this.page > 1) { this.page--; this.loadItems(); } }
  nextPage(): void { if (this.page < this.totalPages) { this.page++; this.loadItems(); } }
  changePageSize(size: number): void { this.pageSize = size; this.page = 1; this.loadItems(); }
  get totalPages(): number { return Math.ceil(this.total / this.pageSize); }
  get pages(): number[] { return Array.from({ length: this.totalPages }, (_, i) => i + 1); }

  deleteItem(id: string, name: string): void {
    Swal.fire({
      title: this.translate.instant('schedule.swalDeleteTitle'),
      text: `${this.translate.instant('schedule.swalDeleteText')} "${name}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: this.translate.instant('schedule.swalDelete'),
      cancelButtonText: this.translate.instant('schedule.cancel'),
    }).then((result) => {
      if (result.isConfirmed) {
        this.deleteUseCase.execute(id).subscribe({
          next: () => {
            Swal.fire({ icon: 'success', title: this.translate.instant('schedule.swalDeleted'), timer: 1000, showConfirmButton: false });
            this.loadItems();
          },
        });
      }
    });
  }

  toggleDayStatus(scheduleId: string, field: string, currentValue: number): void {
    const newValue = currentValue ? 0 : 1;
    this.dataSource.updateDayStatus(scheduleId, field, newValue).subscribe({
      next: () => {
        const items = this.itemsSubject.value.map(item => {
          if (item.id === scheduleId) {
            return { ...item, [field]: newValue } as Schedule;
          }
          return item;
        });
        this.itemsSubject.next(items);
        this.applyMonthDateFilter();
        Swal.fire({ icon: 'success', title: this.translate.instant('schedule.swalUpdated'), timer: 1000, showConfirmButton: false });
      },
      error: () => {
        this.loadItems();
        Swal.fire({ icon: 'error', title: this.translate.instant('schedule.swalError') });
      },
    });
  }

  toggleStatus(scheduleId: string, currentValue: number): void {
    const newValue = currentValue ? 0 : 1;
    this.dataSource.updateStatus(scheduleId, newValue).subscribe({
      next: () => {
        const items = this.itemsSubject.value.map(item => {
          if (item.id === scheduleId) {
            return { ...item, status: newValue } as Schedule;
          }
          return item;
        });
        this.itemsSubject.next(items);
        this.applyMonthDateFilter();
        Swal.fire({ icon: 'success', title: this.translate.instant('schedule.swalUpdated'), timer: 1000, showConfirmButton: false });
      },
      error: () => {
        this.loadItems();
        Swal.fire({ icon: 'error', title: this.translate.instant('schedule.swalError') });
      },
    });
  }

  toggleAllStatus(field: string, checkAll: boolean): void {
    const items = this.itemsSubject.value;
    if (!items.length) return;
    const value = checkAll ? 1 : 0;

    Swal.fire({
      title: this.translate.instant('schedule.swalCheckAll'),
      text: `${items.length} ${this.translate.instant('schedule.swalItems')}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: this.translate.instant('schedule.swalCheckAll'),
      cancelButtonText: this.translate.instant('schedule.cancel'),
    }).then((result) => {
      if (result.isConfirmed) {
        this.executeUpdateAll(items, field, value);
      }
    });
  }

  private async executeUpdateAll(items: Schedule[], field: string, value: number): Promise<void> {
    Swal.fire({ title: this.translate.instant('schedule.swalProcessing'), allowOutsideClick: false, didOpen: () => Swal.showLoading() });
    let successCount = 0;
    for (const item of items) {
      try {
        const apiCall = field === 'status'
          ? this.dataSource.updateStatus(item.id, value)
          : this.dataSource.updateDayStatus(item.id, field, value);
        const res: any = await apiCall.toPromise();
        if (res?.code === 200 || res?.success) successCount++;
        else successCount++;
      } catch { /* skip */ }
    }
    Swal.close();
    Swal.fire({
      icon: successCount === items.length ? 'success' : 'warning',
      title: this.translate.instant('schedule.swalCompleted'),
      text: `${this.translate.instant('schedule.swalSuccessUpdate')} ${successCount}/${items.length} ${this.translate.instant('schedule.swalItems')}`,
      timer: 1500,
      showConfirmButton: false,
    });
    this.loadItems();
  }

  monthSummary(item: Schedule): string {
    const months = Array.isArray(item.months) ? item.months.filter(m => m) : [];
    if (!months.length) return '-';
    return months.map(m => `${m}`).join(', ');
  }

  dateSummary(item: Schedule): string {
    const dates = Array.isArray(item.dates) ? item.dates.filter(d => d) : [];
    if (!dates.length) return '-';
    return dates.map(d => `${d}`).join(', ');
  }

  hasSelectedDay(item: Schedule): boolean {
    return !!(item.sunday || item.monday || item.tuesday || item.wednesday || item.thursday || item.friday || item.saturday);
  }
}
