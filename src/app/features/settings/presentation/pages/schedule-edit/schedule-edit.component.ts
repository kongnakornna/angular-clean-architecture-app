import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { Schedule } from '../../../domain/entities/schedule.entity';
import { ListSchedulesUseCase } from '../../../domain/use-cases/list-schedules.use-case';
import { UpdateScheduleUseCase } from '../../../domain/use-cases/update-schedule.use-case';
import { TranslatePipe } from '../../../../../shared/pipes/translate.pipe';

declare var Swal: any;

@Component({
  selector: 'app-schedule-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './schedule-edit.component.html',
})
export class ScheduleEditComponent implements OnInit {
  id = '';
  name : any =  '';
  startTime : any = '00:00';
  event : any = 1 ? 1 : 0;
  sunday : any = 0 ? 1 : 0;
  monday : any = 0 ? 1 : 0;
  tuesday : any = 0 ? 1 : 0;
  wednesday : any = 0 ? 1 : 0;
  thursday : any = 0 ? 1 : 0;
  friday : any = 0 ? 1 : 0;
  saturday : any = 0 ? 1 : 0;
  status : any = 1 ? 1 : 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private listUseCase: ListSchedulesUseCase,
    private updateUseCase: UpdateScheduleUseCase,
  ) {}

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id') || '';
    this.loadItem();
  }

  loadItem(): void {
    this.listUseCase.execute({ search: this.id }).subscribe({
      next: (res) => {
        const item = res.data.find((s: Schedule) => s.id === this.id);
        if (item) {
          this.name = item.name;
          this.startTime = item.startTime;
          this.event = item.event ? 'on' : 'off';
          this.sunday = item.sunday;
          this.monday = item.monday;
          this.tuesday = item.tuesday;
          this.wednesday = item.wednesday;
          this.thursday = item.thursday;
          this.friday = item.friday;
          this.saturday = item.saturday;
          this.status = item.status;
        }
      },
    });
  }

  onSubmit(): void {
    if (!this.validate()) return;

    this.updateUseCase.execute(this.id, {
      name: this.name,
      startTime: this.startTime,
      event: this.event === 'on' ? 1 : 0,
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
        if (typeof Swal !== 'undefined') {
          Swal.fire({
            icon: 'success',
            title: 'Update Successful',
            text: 'Schedule has been updated',
            timer: 1000,
            timerProgressBar: true,
            showConfirmButton: false,
          }).then(() => this.router.navigate(['/settings/schedule']));
        } else {
          this.router.navigate(['/settings/schedule']);
        }
      },
      error: (err) => {
        if (typeof Swal !== 'undefined') {
          Swal.fire({
            icon: 'error',
            title: 'Update Failed',
            text: err?.error?.message || 'Unknown error',
            timer: 1500,
            showConfirmButton: false,
          });
        }
      },
    });
  }

  private validate(): boolean {
    const msgs: string[] = [];
    if (!this.name.trim()) msgs.push('Please enter schedule name');
    if (!this.startTime) msgs.push('Please enter start time');
    const days = [this.sunday, this.monday, this.tuesday, this.wednesday, this.thursday, this.friday, this.saturday];
    if (!days.some(d => d)) msgs.push('Please select at least 1 day');

    if (msgs.length) {
      if (typeof Swal !== 'undefined') {
        Swal.fire({ icon: 'warning', title: 'Invalid Input', html: msgs.join('<br>'), timer: 1500, showConfirmButton: false });
      }
      return false;
    }
    return true;
  }
}
