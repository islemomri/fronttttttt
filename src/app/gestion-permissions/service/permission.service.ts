import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PermissionService {
  private apiUrl = 'http://localhost:9090/permissions';

  constructor(private http: HttpClient) {}

  
  createPermission(name: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/add`, { name });
  }

  
  getAllPermissions(): Observable<any> {
    return this.http.get(`${this.apiUrl}`);
  }

  
  assignPermission(userId: number, permissionName: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/assign`, { userId, permissionName });
  }

  
  removePermission(userId: number, permissionName: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/remove`, { userId, permissionName });
  }
}