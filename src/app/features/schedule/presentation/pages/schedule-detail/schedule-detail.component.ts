import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

import { GetScheduleUseCase } from '../../../domain/use-cases/get-schedule.use-case';
import { Schedule } from '../../../domain/entities/schedule.entity';
import { TranslatePipe } from '../../../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-schedule-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslatePipe],
  templateUrl: './schedule-detail.component.html',
})
export class ScheduleDetailComponent implements OnInit {
  id = '';
  item?: Schedule;
  loading = true;
  notFound = false;

  readonly dayFields: Array<{ key: 'sunday'|'monday'|'tuesday'|'wednesday'|'thursday'|'friday'|'saturday'; label: string }> = [
    { key: 'sunday', label: 'schedule.create.sunday' },
    { key: 'monday', label: 'schedule.create.monday' },
    { key: 'tuesday', label: 'schedule.create.tuesday' },
    { key: 'wednesday', label: 'schedule.create.wednesday' },
    { key: 'thursday', label: 'schedule.create.thursday' },
    { key: 'friday', label: 'schedule.create.friday' },
    { key: 'saturday', label: 'schedule.create.saturday' },
  ];

  readonly monthOptions: number[] = Array.from({ length: 12 }, (_, i) => i + 1);
  readonly dateOptions: number[] = Array.from({ length: 31 }, (_, i) => i + 1);

  constructor(
    private route: ActivatedRoute,
    private getUseCase: GetScheduleUseCase,
    private translate: TranslateService,
  ) {}

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id') || '';
    this.loadItem();
  }

  loadItem(): void {
    this.loading = true;
    this.getUseCase.execute(this.id).subscribe({
      next: (item) => {
        this.item = item;
        this.loading = false;
      },
      error: () => { this.loading = false; this.notFound = true; },
    });
  }

  hasSelectedDay(): boolean {
    const it = this.item;
    if (!it) return false;
    return !!(it.sunday || it.monday || it.tuesday || it.wednesday || it.thursday || it.friday || it.saturday);
  }

  isDayOn(day: string): boolean {
    const it = this.item;
    return it ? !!((it as any)[day]) : false;
  }

  isMonthSelected(value: number): boolean {
    return !!this.item?.months?.includes(value);
  }

  isDateSelected(value: number): boolean {
    return !!this.item?.dates?.includes(value);
  }
}
