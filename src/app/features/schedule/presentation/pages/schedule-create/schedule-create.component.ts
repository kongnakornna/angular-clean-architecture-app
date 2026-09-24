import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { TranslateService } from '@ngx-translate/core';

import { CreateScheduleUseCase } from '../../../domain/use-cases/create-schedule.use-case';
import { TranslatePipe } from '../../../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-schedule-create',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './schedule-create.component.html',
})
export class ScheduleCreateComponent {
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
  daysTouched = false;

  readonly dayFields: Array<{ key: 'sunday'|'monday'|'tuesday'|'wednesday'|'thursday'|'friday'|'saturday'; label: string }> = [
    { key: 'sunday', label: 'schedule.create.sunday' },
    { key: 'monday', label: 'schedule.create.monday' },
    { key: 'tuesday', label: 'schedule.create.tuesday' },
    { key: 'wednesday', label: 'schedule.create.wednesday' },
    { key: 'thursday', label: 'schedule.create.thursday' },
    { key: 'friday', label: 'schedule.create.friday' },
    { key: 'saturday', label: 'schedule.create.saturday' },
  ];

  constructor(
    private createUseCase: CreateScheduleUseCase,
    private router: Router,
    private translate: TranslateService,
  ) {}

  onChangeMode(): void {
    this.daysTouched = false;
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

    this.createUseCase.execute({
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
          title: this.translate.instant('schedule.create.swalCreated'),
          text: this.translate.instant('schedule.create.swalCreatedText'),
          timer: 1000,
          timerProgressBar: true,
          showConfirmButton: false,
        }).then(() => this.router.navigate(['/schedule']));
      },
      error: (err) => {
        Swal.fire({
          icon: 'error',
          title: this.translate.instant('schedule.create.swalCreateFailed'),
          text: err?.error?.message || this.translate.instant('schedule.create.swalError'),
          timer: 1500,
          showConfirmButton: false,
        });
      },
    });
  }

  private validate(): boolean {
    const msgs: string[] = [];
    if (!this.name.trim()) msgs.push(this.translate.instant('schedule.create.errorNameRequired'));
    if (!this.timeStart) msgs.push(this.translate.instant('schedule.create.errorTimeRequired'));

    if (this.mode === 'weekly' && !this.hasSelectedDay()) {
      msgs.push(this.translate.instant('schedule.create.errorDayRequired'));
    }
    if (this.mode === 'batch' && !this.cronExpr.trim()) {
      msgs.push(this.translate.instant('schedule.create.errorCronRequired'));
    }

    if (msgs.length) {
      Swal.fire({ icon: 'warning', title: this.translate.instant('schedule.create.errorInvalidInput'), html: msgs.join('<br>'), timer: 2000, showConfirmButton: false });
      return false;
    }
    return true;
  }
}
