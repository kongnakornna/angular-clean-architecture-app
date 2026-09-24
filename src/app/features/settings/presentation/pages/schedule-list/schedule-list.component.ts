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
  eventFilter = '';
  statusFilter = '';
  timeFrom = '00:00';
  timeTo = '23:59';
  page = 1;
  pageSize = 10;
  total = 0;

  readonly dayHeaders: Array<{ key: string; label: string }> = [
    { key: 'sunday', label: 'settings.schedule.sunday' },
    { key: 'monday', label: 'settings.schedule.monday' },
    { key: 'tuesday', label: 'settings.schedule.tuesday' },
    { key: 'wednesday', label: 'settings.schedule.wednesday' },
    { key: 'thursday', label: 'settings.schedule.thursday' },
    { key: 'friday', label: 'settings.schedule.friday' },
    { key: 'saturday', label: 'settings.schedule.saturday' },
  ];

  constructor(
    private listUseCase: ListSchedulesUseCase,
    private deleteUseCase: DeleteScheduleUseCase,
    private dataSource: ScheduleApiDataSource,
    private translate: TranslateService,
  ) {}

  ngOnInit(): void { this.loadItems(); }

  loadItems(): void {
    this.loadingSubject.next(true);
    const params: any = {
      page: this.page,
      pageSize: this.pageSize,
    };
    if (this.searchTerm) params.search = this.searchTerm;
    if (this.eventFilter) params.event = this.eventFilter;
    if (this.statusFilter !== '') params.status = this.statusFilter;
    this.listUseCase.execute(params).subscribe({
      next: (res) => {
        this.itemsSubject.next(res.data);
        this.applyTimeFilter();
        this.total = res.total;
        this.loadingSubject.next(false);
      },
      error: () => this.loadingSubject.next(false),
    });
  }

  private applyTimeFilter(): void {
    const all = this.itemsSubject.value;
    const from = this.norm(this.timeFrom);
    const to = this.norm(this.timeTo);
    const list = all.filter(item => {
      const t = this.norm(item.startTime);
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

  search(): void { this.page = 1; this.loadItems(); }
  reset(): void {
    this.searchTerm = '';
    this.eventFilter = '';
    this.statusFilter = '';
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
      title: this.translate.instant('settings.schedule.swalDeleteTitle'),
      text: `${this.translate.instant('settings.schedule.swalDeleteText')} "${name}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: this.translate.instant('settings.schedule.swalDelete'),
      cancelButtonText: this.translate.instant('settings.schedule.swalCancel'),
    }).then((result) => {
      if (result.isConfirmed) {
        this.deleteUseCase.execute(id).subscribe({
          next: () => {
            Swal.fire({ icon: 'success', title: this.translate.instant('settings.schedule.swalDeleted'), timer: 1000, showConfirmButton: false });
            this.loadItems();
          },
        });
      }
    });
  }

  toggleDayStatus(scheduleId: string, field: string, currentValue: number): void {
    const newValue = currentValue ? 0 : 1;
    this.dataSource.updateDayStatus(scheduleId, field, newValue).subscribe({
      next: (res: any) => {
        const items = this.itemsSubject.value.map(item => {
          if (item.id === scheduleId) {
            return { ...item, [field]: newValue } as Schedule;
          }
          return item;
        });
        this.itemsSubject.next(items);
        this.applyTimeFilter();
        Swal.fire({ icon: 'success', title: this.translate.instant('settings.schedule.swalUpdated'), timer: 1000, showConfirmButton: false });
      },
      error: (err) => {
        this.loadItems();
        Swal.fire({ icon: 'error', title: this.translate.instant('settings.schedule.swalError'), text: err?.message || this.translate.instant('settings.schedule.swalUpdateFailed') });
      },
    });
  }

  toggleStatus(scheduleId: string, currentValue: number): void {
    const newValue = currentValue ? 0 : 1;
    this.dataSource.updateStatus(scheduleId, newValue).subscribe({
      next: (res: any) => {
        const items = this.itemsSubject.value.map(item => {
          if (item.id === scheduleId) {
            return { ...item, status: newValue } as Schedule;
          }
          return item;
        });
        this.itemsSubject.next(items);
        this.applyTimeFilter();
        Swal.fire({ icon: 'success', title: this.translate.instant('settings.schedule.swalUpdated'), timer: 1000, showConfirmButton: false });
      },
      error: (err) => {
        this.loadItems();
        Swal.fire({ icon: 'error', title: this.translate.instant('settings.schedule.swalError'), text: err?.message || this.translate.instant('settings.schedule.swalUpdateFailed') });
      },
    });
  }

  toggleAllStatus(field: string, checkAll: boolean): void {
    const items = this.itemsSubject.value;
    if (!items.length) return;
    const value = checkAll ? 1 : 0;
    const titleKey = checkAll ? 'settings.schedule.swalCheckAll' : 'settings.schedule.swalUncheckAll';
    const textKey = checkAll ? 'settings.schedule.swalCheckAllConfirm' : 'settings.schedule.swalUncheckAllConfirm';

    Swal.fire({
      title: this.translate.instant(titleKey),
      text: `${this.translate.instant(textKey)} ${items.length} ${this.translate.instant('settings.schedule.swalItems')}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: this.translate.instant(titleKey),
      cancelButtonText: this.translate.instant('settings.schedule.swalCancel'),
    }).then((result) => {
      if (result.isConfirmed) {
        this.executeUpdateAll(items, field, value);
      }
    });
  }

  private async executeUpdateAll(items: Schedule[], field: string, value: number): Promise<void> {
    Swal.fire({ title: this.translate.instant('settings.schedule.swalProcessing'), allowOutsideClick: false, didOpen: () => Swal.showLoading() });
    let successCount = 0;
    for (const item of items) {
      try {
        const apiCall = field === 'status'
          ? this.dataSource.updateStatus(item.id, value)
          : this.dataSource.updateDayStatus(item.id, field, value);
        const res: any = await apiCall.toPromise();
        if (res.code === 200 || res.success) successCount++;
      } catch { /* skip */ }
    }
    Swal.close();
    Swal.fire({
      icon: successCount === items.length ? 'success' : 'warning',
      title: this.translate.instant('settings.schedule.swalCompleted'),
      text: `${this.translate.instant('settings.schedule.swalSuccessUpdate')} ${successCount}/${items.length} ${this.translate.instant('settings.schedule.swalItems')}`,
      timer: 1500,
      showConfirmButton: false,
    });
    this.loadItems();
  }
}
