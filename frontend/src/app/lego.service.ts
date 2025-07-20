import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from './environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LegoService {
  constructor(private http: HttpClient) {}

  getResults(column: string, value: string, page: number, pageSize: number): Observable<any> {
    return this.http.get(`${environment.apiUrl}/search/${column}/${value}?page=${page}&?pageSize=${pageSize}`);
  }
}
