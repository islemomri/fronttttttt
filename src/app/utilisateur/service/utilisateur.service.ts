import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Utilisateur } from '../model/utilisateur';
import { map, Observable } from 'rxjs';
import { AuthService } from '../../auth/service/auth.service';

@Injectable({
  providedIn: 'root'
})
export class UtilisateurService {

  private apiUrl = 'http://localhost:9090/utilisateurs';
  
  headers : any;
  constructor(private http: HttpClient, private authservice: AuthService) {
    this.headers = this.authservice.createAuthorizationHeader();
  }

  getUtilisateurs(): Observable<Utilisateur[]> {
    return this.http.get<any[]>(this.apiUrl, { headers: this.headers }).pipe(
      map(users =>
        users.map(user => ({
          ...user,
          lastLogin: user.lastLogin ? new Date(user.lastLogin) : null 
        }))
      ) 
    );
  }
  

  deleteUtilisateur(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, {headers : this.headers});
  }

  updateUtilisateur(id: number, utilisateur: Utilisateur): Observable<Utilisateur> {
    return this.http.put<Utilisateur>(`${this.apiUrl}/${id}`, utilisateur, {headers : this.headers});
  }

  resetPassword(userId: number): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${userId}/reset-password`, {}, {headers : this.headers});
  }
  getResponsables(): Observable<Utilisateur[]> {
    return this.http.get<Utilisateur[]>(`${this.apiUrl}/responsables`);
  }

  getAllUsers(): Observable<Utilisateur[]> {
    return this.http.get<Utilisateur[]>(`${this.apiUrl}/all`);
  }
  
  
}
