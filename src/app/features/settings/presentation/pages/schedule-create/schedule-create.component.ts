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
  startTime = '00:00';
  event = 1;
  sunday = 0;
  monday = 0;
  tuesday = 0;
  wednesday = 0;
  thursday = 0;
  friday = 0;
  saturday = 0;
  status = 1;
  daysTouched = false;

  constructor(
    private createUseCase: CreateScheduleUseCase,
    private router: Router,
    private translate: TranslateService,
  ) {}

  hasSelectedDay(): boolean {
    return !!(this.sunday || this.monday || this.tuesday || this.wednesday || this.thursday || this.friday || this.saturday);
  }

  onSubmit(): void {
    this.daysTouched = true;
    if (!this.validate()) return;

    this.createUseCase.execute({
      name: this.name.trim(),
      startTime: this.startTime,
      event: this.event,
      sunday: this.sunday,
      monday: this.monday,
      tuesday: this.tuesday,
      wednesday: this.wednesday,
      thursday: this.thursday,
      friday: this.friday,
      saturday: this.saturday,
      status: this.status,
    }).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: this.translate.instant('settings.schedule.swalCreated'),
          text: this.translate.instant('settings.schedule.swalCreatedText'),
          timer: 1000,
          timerProgressBar: true,
          showConfirmButton: false,
        }).then(() => this.router.navigate(['/settings/schedule']));
      },
      error: (err) => {
        Swal.fire({
          icon: 'error',
          title: this.translate.instant('settings.schedule.swalCreateFailed'),
          text: err?.error?.message || this.translate.instant('settings.schedule.swalError'),
          timer: 1500,
          showConfirmButton: false,
        });
      },
    });
  }

  private validate(): boolean {
    const msgs: string[] = [];
    if (!this.name.trim()) msgs.push(this.translate.instant('settings.schedule.errorNameRequired'));
    if (!this.startTime) msgs.push(this.translate.instant('settings.schedule.errorTimeRequired'));
    if (!this.hasSelectedDay()) msgs.push(this.translate.instant('settings.schedule.errorDayRequired'));

    if (msgs.length) {
      Swal.fire({ icon: 'warning', title: this.translate.instant('settings.schedule.errorInvalidInput'), html: msgs.join('<br>'), timer: 2000, showConfirmButton: false });
      return false;
    }
    return true;
  }
}
