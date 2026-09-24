import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '../../../../core/config/api.config';
import { ApiFallbackService } from '../../../../core/services/api-fallback.service';
import { ListSchedulePageResponseDto, ScheduleDeviceResponseDto, ScheduleHistoryResponseDto, ScheduleResponseDto, ScheduleSettingResponseDto } from '../dtos/schedule-response.dto';

@Injectable({ providedIn: 'root' })
export class ScheduleApiDataSource {
  private http = inject(HttpClient);
  private fallbackService = inject(ApiFallbackService);

  private endpoint(path: string): string {
    return `${this.fallbackService.getActiveBaseUrl()}${path}`;
  }

  list(params?: { keyword?: string; mode?: string; status?: string; eventType?: string; eventAction?: string; groupId?: string; zoneId?: string; areaId?: string; page?: number; pageSize?: number; start?: string; sort?: string }): Observable<ListSchedulePageResponseDto> {
    let httpParams = new HttpParams();
    if (params) {
      if (params.keyword) httpParams = httpParams.set('keyword', params.keyword);
      if (params.mode) httpParams = httpParams.set('mode', params.mode);
      if (params.status !== undefined && params.status !== '') httpParams = httpParams.set('status', params.status);
      if (params.eventType) httpParams = httpParams.set('event_type', params.eventType);
      if (params.eventAction) httpParams = httpParams.set('event_action', params.eventAction);
      if (params.groupId) httpParams = httpParams.set('group_id', params.groupId);
      if (params.zoneId) httpParams = httpParams.set('zone_id', params.zoneId);
      if (params.areaId) httpParams = httpParams.set('area_id', params.areaId);
      if (params.page) httpParams = httpParams.set('page', params.page.toString());
      if (params.pageSize) httpParams = httpParams.set('pageSize', params.pageSize.toString());
      if (params.start) httpParams = httpParams.set('start', params.start);
      if (params.sort) httpParams = httpParams.set('sort', params.sort);
    }
    return this.http.get<ListSchedulePageResponseDto>(this.endpoint(API_ENDPOINTS.schedule.schedules.list), { params: httpParams });
  }

  listAll(params?: { keyword?: string; mode?: string; status?: string }): Observable<ScheduleResponseDto[]> {
    let httpParams = new HttpParams();
    if (params) {
      if (params.keyword) httpParams = httpParams.set('keyword', params.keyword);
      if (params.mode) httpParams = httpParams.set('mode', params.mode);
      if (params.status !== undefined && params.status !== '') httpParams = httpParams.set('status', params.status);
    }
    return this.http.get<ScheduleResponseDto[]>(this.endpoint(API_ENDPOINTS.schedule.schedules.listAll), { params: httpParams });
  }

  getById(id: string): Observable<ScheduleResponseDto> {
    return this.http.get<ScheduleResponseDto>(this.endpoint(API_ENDPOINTS.schedule.schedules.detail(id)));
  }

  create(data: Partial<ScheduleResponseDto>): Observable<ScheduleResponseDto> {
    return this.http.post<ScheduleResponseDto>(this.endpoint(API_ENDPOINTS.schedule.schedules.create), data);
  }

  update(id: string, data: Partial<ScheduleResponseDto>): Observable<ScheduleResponseDto> {
    return this.http.put<ScheduleResponseDto>(this.endpoint(API_ENDPOINTS.schedule.schedules.update(id)), data);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(this.endpoint(API_ENDPOINTS.schedule.schedules.delete(id)));
  }

  setStatus(id: string, status: number): Observable<ScheduleResponseDto> {
    return this.http.put<ScheduleResponseDto>(this.endpoint(API_ENDPOINTS.schedule.schedules.setStatus(id)), { status });
  }

  updateDayStatus(id: string, day: string, value: number): Observable<ScheduleResponseDto> {
    return this.http.put<ScheduleResponseDto>(this.endpoint(API_ENDPOINTS.schedule.schedules.updateDayStatus(id)), { day, value });
  }

  updateStatus(id: string, status: number): Observable<ScheduleResponseDto> {
    return this.setStatus(id, status);
  }

  trigger(id: string): Observable<ScheduleHistoryResponseDto> {
    return this.http.post<ScheduleHistoryResponseDto>(this.endpoint(API_ENDPOINTS.schedule.schedules.trigger(id)), {});
  }

  getDevicePage(params: any): Observable<any> {
    let httpParams = new HttpParams();
    Object.keys(params).forEach(key => {
      if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
        httpParams = httpParams.set(key, params[key].toString());
      }
    });
    return this.http.get(this.endpoint(API_ENDPOINTS.schedule.schedules.devicePage), { params: httpParams });
  }

  getDeviceList(params: any): Observable<any> {
    let httpParams = new HttpParams();
    Object.keys(params).forEach(key => {
      if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
        httpParams = httpParams.set(key, params[key].toString());
      }
    });
    return this.http.get(this.endpoint(API_ENDPOINTS.schedule.schedules.deviceList), { params: httpParams });
  }

  getDevices(scheduleId: string): Observable<ScheduleDeviceResponseDto[]> {
    return this.http.get<ScheduleDeviceResponseDto[]>(this.endpoint(API_ENDPOINTS.schedule.schedules.devices(scheduleId)));
  }

  mapDevices(scheduleId: string, deviceIds: number[]): Observable<any> {
    return this.http.post(this.endpoint(API_ENDPOINTS.schedule.schedules.mapDevices(scheduleId)), { device_ids: deviceIds });
  }

  getSettings(scheduleId: string): Observable<ScheduleSettingResponseDto[]> {
    return this.http.get<ScheduleSettingResponseDto[]>(this.endpoint(API_ENDPOINTS.schedule.schedules.settings(scheduleId)));
  }

  setSetting(scheduleId: string, key: string, value: any): Observable<ScheduleSettingResponseDto> {
    return this.http.put<ScheduleSettingResponseDto>(this.endpoint(API_ENDPOINTS.schedule.schedules.setSetting(scheduleId)), { key, value });
  }

  getHistoryBySchedule(scheduleId: string, params?: { page?: number; pageSize?: number }): Observable<any> {
    let httpParams = new HttpParams();
    if (params) {
      if (params.page) httpParams = httpParams.set('page', params.page.toString());
      if (params.pageSize) httpParams = httpParams.set('pageSize', params.pageSize.toString());
    }
    return this.http.get<any>(this.endpoint(API_ENDPOINTS.schedule.schedules.history(scheduleId)), { params: httpParams });
  }

  getHistoryAll(params?: { page?: number; pageSize?: number; status?: string }): Observable<any> {
    let httpParams = new HttpParams();
    if (params) {
      if (params.page) httpParams = httpParams.set('page', params.page.toString());
      if (params.pageSize) httpParams = httpParams.set('pageSize', params.pageSize.toString());
      if (params.status) httpParams = httpParams.set('status', params.status);
    }
    return this.http.get<any>(this.endpoint(API_ENDPOINTS.schedule.schedules.historyAll), { params: httpParams });
  }

  getReport(params?: { from?: string; to?: string; scheduleId?: string }): Observable<any> {
    let httpParams = new HttpParams();
    if (params) {
      if (params.from) httpParams = httpParams.set('from', params.from);
      if (params.to) httpParams = httpParams.set('to', params.to);
      if (params.scheduleId) httpParams = httpParams.set('schedule_id', params.scheduleId);
    }
    return this.http.get<any>(this.endpoint(API_ENDPOINTS.schedule.report), { params: httpParams });
  }

  count(): Observable<number> {
    return this.http.get<number>(this.endpoint(API_ENDPOINTS.schedule.schedules.count));
  }

  listGroups(params?: { page?: number; pageSize?: number }): Observable<any> {
    let httpParams = new HttpParams();
    if (params) {
      if (params.page) httpParams = httpParams.set('page', params.page.toString());
      if (params.pageSize) httpParams = httpParams.set('pageSize', params.pageSize.toString());
    }
    return this.http.get<any>(this.endpoint(API_ENDPOINTS.schedule.groups.list), { params: httpParams });
  }

  createGroup(data: any): Observable<any> {
    return this.http.post<any>(this.endpoint(API_ENDPOINTS.schedule.groups.create), data);
  }

  updateGroup(id: string, data: any): Observable<any> {
    return this.http.put<any>(this.endpoint(API_ENDPOINTS.schedule.groups.update(id)), data);
  }

  deleteGroup(id: string): Observable<any> {
    return this.http.delete<any>(this.endpoint(API_ENDPOINTS.schedule.groups.delete(id)));
  }

  listZones(groupId?: string, params?: { page?: number; pageSize?: number }): Observable<any> {
    let httpParams = new HttpParams();
    if (groupId) httpParams = httpParams.set('group_id', groupId);
    if (params) {
      if (params.page) httpParams = httpParams.set('page', params.page.toString());
      if (params.pageSize) httpParams = httpParams.set('pageSize', params.pageSize.toString());
    }
    return this.http.get<any>(this.endpoint(API_ENDPOINTS.schedule.zones.list), { params: httpParams });
  }

  createZone(data: any): Observable<any> {
    return this.http.post<any>(this.endpoint(API_ENDPOINTS.schedule.zones.create), data);
  }

  updateZone(id: string, data: any): Observable<any> {
    return this.http.put<any>(this.endpoint(API_ENDPOINTS.schedule.zones.update(id)), data);
  }

  deleteZone(id: string): Observable<any> {
    return this.http.delete<any>(this.endpoint(API_ENDPOINTS.schedule.zones.delete(id)));
  }

  listAreas(zoneId?: string, params?: { page?: number; pageSize?: number }): Observable<any> {
    let httpParams = new HttpParams();
    if (zoneId) httpParams = httpParams.set('zone_id', zoneId);
    if (params) {
      if (params.page) httpParams = httpParams.set('page', params.page.toString());
      if (params.pageSize) httpParams = httpParams.set('pageSize', params.pageSize.toString());
    }
    return this.http.get<any>(this.endpoint(API_ENDPOINTS.schedule.areas.list), { params: httpParams });
  }

  createArea(data: any): Observable<any> {
    return this.http.post<any>(this.endpoint(API_ENDPOINTS.schedule.areas.create), data);
  }

  updateArea(id: string, data: any): Observable<any> {
    return this.http.put<any>(this.endpoint(API_ENDPOINTS.schedule.areas.update(id)), data);
  }

  deleteArea(id: string): Observable<any> {
    return this.http.delete<any>(this.endpoint(API_ENDPOINTS.schedule.areas.delete(id)));
  }
}
