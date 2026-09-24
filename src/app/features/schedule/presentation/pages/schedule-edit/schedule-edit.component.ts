import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import Swal from 'sweetalert2';
import { TranslateService } from '@ngx-translate/core';

import { GetScheduleUseCase } from '../../../domain/use-cases/get-schedule.use-case';
import { UpdateScheduleUseCase } from '../../../domain/use-cases/update-schedule.use-case';
import { TranslatePipe } from '../../../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-schedule-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TranslatePipe],
  templateUrl: './schedule-edit.component.html',
})
export class ScheduleEditComponent implements OnInit {
  id = '';
  name = '';
  mode: 'weekly' | 'full' | 'batch' = 'weekly';
  timeStart = '00:00';
  eventAction: 'ON' | 'OFF' = 'ON';
  sunday = 0;
  monday = 0;
  tuesday = 0;
  wednesday = 0;
  thursday = 0;
  friday = 0;
  saturday = 0;
  months: number[] = [];
  dates: number[] = [];
  cronExpr = '';
  status = 1;
  loading = true;
  notFound = false;
  daysTouched = false;

  readonly dayFields: Array<{ key: 'sunday'|'monday'|'tuesday'|'wednesday'|'thursday'|'friday'|'saturday'; label: string }> = [
    { key: 'sunday', label: 'schedule.edit.sunday' },
    { key: 'monday', label: 'schedule.edit.monday' },
    { key: 'tuesday', label: 'schedule.edit.tuesday' },
    { key: 'wednesday', label: 'schedule.edit.wednesday' },
    { key: 'thursday', label: 'schedule.edit.thursday' },
    { key: 'friday', label: 'schedule.edit.friday' },
    { key: 'saturday', label: 'schedule.edit.saturday' },
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private getUseCase: GetScheduleUseCase,
    private updateUseCase: UpdateScheduleUseCase,
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
        this.name = item.name;
        this.mode = item.mode === 'normal' ? 'weekly' : item.mode;
        this.timeStart = item.timeStart;
        this.eventAction = (item.eventAction === 'OFF' ? 'OFF' : 'ON');
        this.sunday = item.sunday;
        this.monday = item.monday;
        this.tuesday = item.tuesday;
        this.wednesday = item.wednesday;
        this.thursday = item.thursday;
        this.friday = item.friday;
        this.saturday = item.saturday;
        this.months = item.months || [];
        this.dates = item.dates || [];
        this.cronExpr = item.cronExpr || '';
        this.status = item.status;
        this.loading = false;
      },
      error: () => { this.loading = false; this.notFound = true; },
    });
  }

  hasSelectedDay(): boolean {
    return !!(this.sunday || this.monday || this.tuesday || this.wednesday || this.thursday || this.friday || this.saturday);
  }

  onMonthToggle(value: number, checked: boolean): void {
    if (checked) {
      if (!this.months.includes(value)) this.months.push(value);
    } else {
      this.months = this.months.filter(m => m !== value);
    }
  }

  onDateToggle(value: number, checked: boolean): void {
    if (checked) {
      if (!this.dates.includes(value)) this.dates.push(value);
    } else {
      this.dates = this.dates.filter(d => d !== value);
    }
  }

  isMonthSelected(value: number): boolean {
    return this.months.includes(value);
  }

  isDateSelected(value: number): boolean {
    return this.dates.includes(value);
  }

  onSubmit(): void {
    this.daysTouched = true;
    if (!this.validate()) return;

    this.updateUseCase.execute(this.id, {
      name: this.name.trim(),
      mode: this.mode,
      timeStart: this.timeStart,
      eventAction: this.eventAction,
      event: this.eventAction === 'ON' ? 1 : 0,
      sunday: this.sunday,
      monday: this.monday,
      tuesday: this.tuesday,
      wednesday: this.wednesday,
      thursday: this.thursday,
      friday: this.friday,
      saturday: this.saturday,
      months: this.mode === 'full' ? this.months : [],
      dates: this.mode === 'full' ? this.dates : [],
      cronExpr: this.mode === 'batch' && this.cronExpr ? this.cronExpr : undefined,
      status: this.status,
    }).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: this.translate.instant('schedule.edit.swalUpdated'),
          text: this.translate.instant('schedule.edit.swalUpdatedText'),
          timer: 1000,
          timerProgressBar: true,
          showConfirmButton: false,
        }).then(() => this.router.navigate(['/schedule']));
      },
      error: (err) => {
        Swal.fire({
          icon: 'error',
          title: this.translate.instant('schedule.edit.swalUpdateFailed'),
          text: err?.error?.message || this.translate.instant('schedule.edit.swalError'),
          timer: 1500,
          showConfirmButton: false,
        });
      },
    });
  }

  private validate(): boolean {
    const msgs: string[] = [];
    if (!this.name.trim()) msgs.push(this.translate.instant('schedule.edit.errorNameRequired'));
    if (!this.timeStart) msgs.push(this.translate.instant('schedule.edit.errorTimeRequired'));
    if (this.mode === 'weekly' && !this.hasSelectedDay()) msgs.push(this.translate.instant('schedule.edit.errorDayRequired'));
    if (this.mode === 'batch' && !this.cronExpr.trim()) msgs.push(this.translate.instant('schedule.edit.errorCronRequired'));

    if (msgs.length) {
      Swal.fire({ icon: 'warning', title: this.translate.instant('schedule.edit.errorInvalidInput'), html: msgs.join('<br>'), timer: 2000, showConfirmButton: false });
      return false;
    }
    return true;
  }
}
