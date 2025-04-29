import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Entete } from '../model/Entete';


@Injectable({
  providedIn: 'root'
})
export class EnteteService {

  private apiUrl = 'http://localhost:9090/api/entetes'; // à adapter selon ton backend

  constructor(private http: HttpClient) {}

  getAllEntetes(): Observable<Entete[]> {
    return this.http.get<Entete[]>(this.apiUrl);
  }

  createEntete(entete: Entete): Observable<Entete> {
    return this.http.post<Entete>(this.apiUrl, entete);
  }

  updateEntete(id: number, entete: Entete): Observable<Entete> {
    return this.http.put<Entete>(`${this.apiUrl}/${id}`, entete);
  }

  deleteEntete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }





}
