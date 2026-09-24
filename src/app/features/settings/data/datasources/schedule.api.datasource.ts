import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '../../../../core/config/api.config';
import { ApiFallbackService } from '../../../../core/services/api-fallback.service';
import { ListSchedulePageResponseDto, ScheduleResponseDto } from '../dtos/schedule-response.dto';

@Injectable({ providedIn: 'root' })
export class ScheduleApiDataSource {
  private http = inject(HttpClient);
  private fallbackService = inject(ApiFallbackService);

  private endpoint(path: string): string {
    return `${this.fallbackService.getActiveBaseUrl()}${path}`;
  }

  list(params?: { search?: string; event?: string; page?: number; pageSize?: number; start?: string; status?: string }): Observable<ListSchedulePageResponseDto> {
    let httpParams = new HttpParams();
    if (params) {
      if (params.search) httpParams = httpParams.set('keyword', params.search);
      if (params.event !== undefined && params.event !== '') httpParams = httpParams.set('event', params.event);
      if (params.page) httpParams = httpParams.set('page', params.page.toString());
      if (params.pageSize) httpParams = httpParams.set('pageSize', params.pageSize.toString());
      httpParams = httpParams.set('start', params.start ?? '');
      if (params.status !== undefined && params.status !== '') httpParams = httpParams.set('status', params.status);
    }
    return this.http.get<ListSchedulePageResponseDto>(this.endpoint(API_ENDPOINTS.settings.schedules.list), { params: httpParams });
  }

  getById(id: string): Observable<ScheduleResponseDto> {
    return this.http.get<ScheduleResponseDto>(this.endpoint(API_ENDPOINTS.settings.schedules.detail(id)));
  }

  create(data: Partial<ScheduleResponseDto>): Observable<ScheduleResponseDto> {
    return this.http.post<ScheduleResponseDto>(this.endpoint(API_ENDPOINTS.settings.schedules.create), data);
  }

  update(id: string, data: Partial<ScheduleResponseDto>): Observable<ScheduleResponseDto> {
    return this.http.put<ScheduleResponseDto>(this.endpoint(API_ENDPOINTS.settings.schedules.update(id)), data);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(this.endpoint(API_ENDPOINTS.settings.schedules.delete(id)));
  }

  getDevicePage(params: any): Observable<any> {
    let httpParams = new HttpParams();
    Object.keys(params).forEach(key => {
      if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
        httpParams = httpParams.set(key, params[key].toString());
      }
    });
    return this.http.get(this.endpoint(API_ENDPOINTS.settings.schedules.devicePage), { params: httpParams });
  }

  getDeviceList(params: any): Observable<any> {
    let httpParams = new HttpParams();
    Object.keys(params).forEach(key => {
      if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
        httpParams = httpParams.set(key, params[key].toString());
      }
    });
    return this.http.get(this.endpoint(API_ENDPOINTS.settings.schedules.deviceList), { params: httpParams });
  }

  createScheduleDevice(scheduleId: string, deviceId: string): Observable<any> {
    return this.http.get(this.endpoint(`${API_ENDPOINTS.settings.schedules.deviceCreate}?schedule_id=${scheduleId}&device_id=${deviceId}`));
  }

  deleteScheduleDevice(scheduleId: string, deviceId: string): Observable<any> {
    return this.http.get(this.endpoint(`${API_ENDPOINTS.settings.schedules.deviceDelete}?schedule_id=${scheduleId}&device_id=${deviceId}`));
  }

  getLogsPaginate(params: any): Observable<any> {
    let httpParams = new HttpParams();
    Object.keys(params).forEach(key => {
      if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
        httpParams = httpParams.set(key, params[key].toString());
      }
    });
    return this.http.get(this.endpoint(API_ENDPOINTS.settings.schedules.logsPaginate), { params: httpParams });
  }

  getAllSchedules(): Observable<any> {
    return this.http.get(this.endpoint(API_ENDPOINTS.settings.schedules.allSchedules));
  }

  updateDayStatus(scheduleId: string, field: string, value: number): Observable<any> {
    return this.http.post(this.endpoint(API_ENDPOINTS.settings.schedules.updateDayStatus), {
      schedule_id: scheduleId,
      [field]: value,
    });
  }

  updateStatus(scheduleId: string, value: number): Observable<any> {
    return this.http.post(this.endpoint(API_ENDPOINTS.settings.schedules.updateStatus), {
      schedule_id: scheduleId,
      status: value,
    });
  }
}
