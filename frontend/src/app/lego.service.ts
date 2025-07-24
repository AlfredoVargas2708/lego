import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LegoService {
  constructor(private http: HttpClient) {}

  getColumns(): Observable<any> {
    return this.http.get(`${environment.apiUrl}/nombres-columnas`);
  }

  getOptions(column: string, value: string): Observable<any> {
    return this.http.get(`${environment.apiUrl}/opciones/${column}/${value}`);
  }

  getResults(column: string, value: string, page: number, pageSize: number): Observable<any> {
    return this.http.get(`${environment.apiUrl}/resultados/${column}/${value}?page=${page}&pageSize=${pageSize}`);
  }
  editLego(legoData: any): Observable<any> {
    return this.http.put(`${environment.apiUrl}/editar/`, { legoData })
  }

  addLego(legoData: any): Observable<any> {
    return this.http.post(`${environment.apiUrl}/agregar`, { legoData });
  }

  deleteLego(id: any): Observable<any> {
    return this.http.delete(`${environment.apiUrl}/eliminar/${id}`)
  }
}
