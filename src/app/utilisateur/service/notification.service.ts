import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private apiUrl = 'http://localhost:9090/notifications';

  constructor(private http: HttpClient) {}

  getNotifications(userId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/utilisateur/${userId}`);
  }

  markAsRead(userId: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/utilisateur/${userId}/lire`, {});
  }
}
