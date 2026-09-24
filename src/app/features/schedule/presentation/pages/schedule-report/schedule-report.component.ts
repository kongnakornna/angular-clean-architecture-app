import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '../../../../../shared/pipes/translate.pipe';
import { ScheduleApiDataSource } from '../../../data/datasources/schedule.api.datasource';
import { ListSchedulesUseCase } from '../../../domain/use-cases/list-schedules.use-case';

@Component({
  selector: 'app-schedule-report',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './schedule-report.component.html',
})
export class ScheduleReportComponent implements OnInit {
  items: any[] = [];
  loading = false;
  scheduleFilter = '';
  schedules: any[] = [];
  fromDate = '';
  toDate = '';

  constructor(
    private dataSource: ScheduleApiDataSource,
    private listUseCase: ListSchedulesUseCase,
  ) {}

  ngOnInit(): void {
    this.loadFilterOptions();
    this.loadItems();
  }

  loadFilterOptions(): void {
    this.listUseCase.execute({ pageSize: 500 }).subscribe({
      next: (res) => { this.schedules = res.data; },
    });
  }

  loadItems(): void {
    this.loading = true;
    const params: any = {};
    if (this.scheduleFilter) params.scheduleId = this.scheduleFilter;
    if (this.fromDate) params.from = this.fromDate;
    if (this.toDate) params.to = this.toDate;
    this.dataSource.getReport(params).subscribe({
      next: (res: any) => {
        const body = res?.payload || res;
        this.items = body?.data || (Array.isArray(body) ? body : []);
        this.loading = false;
      },
      error: () => { this.loading = false; },
    });
  }

  search(): void { this.loadItems(); }
  reset(): void { this.scheduleFilter = ''; this.fromDate = ''; this.toDate = ''; this.loadItems(); }

  rate(item: any): number {
    const rate = Number(item.success_rate ?? 0);
    return Math.round(rate * 100) / 100;
  }
}
