import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslatePipe } from '../../../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-schedule-layout',
  standalone: true,
  imports: [RouterOutlet, TranslatePipe],
  templateUrl: './schedule-layout.component.html',
  styleUrls: ['./schedule-layout.component.scss'],
})
export class ScheduleLayoutComponent {
  constructor() {}
}
