import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Employe } from '../model/employe';
import { catchError, Observable, throwError } from 'rxjs';
import { EmployeExistant } from '../model/EmployeExistant';
import { Site } from '../../site/model/site';
import { Discipline } from '../model/Discipline';
import { ExperienceAssad } from '../model/ExperienceAssad';
import { ExperienceAnterieure } from '../model/ExperienceAnterieure';
import { Poste } from '../model/Poste';
import { EmployePoste } from '../model/EmployePoste';
import { PosteAvecDatesDTO } from '../model/PosteAvecDatesDTO';

@Injectable({
  providedIn: 'root',
})
export class EmoloyeService {
  private apiUrl = 'http://localhost:9090/api/employes';

  private apiUrl2 = 'http://localhost:9090/api/sites';
  constructor(private http: HttpClient) {}

  addEmploye(employe: Employe): Observable<Employe> {
    return this.http.post<Employe>(this.apiUrl, employe);
  }

  getAllEmployes(): Observable<EmployeExistant[]> {
    return this.http.get<EmployeExistant[]>(
      `${this.apiUrl}/employes-without-poste`
    );
  }
  getAllSites(): Observable<Site[]> {
    return this.http.get<Site[]>(this.apiUrl2);
  }

  ajouterEmploye(
    employe: Employe,
    posteId: number,
    dateDebut: string,
    dateFin: string
  ): Observable<Employe> {
    return this.http.post<Employe>(
      `${this.apiUrl}/ajouterAvecPoste?posteId=${posteId}&dateDebut=${dateDebut}&dateFin=${dateFin}`,
      employe
    );
  }

  getEmployesWithDirectionAndSite(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }
  getDisciplines(employeId: number): Observable<Discipline[]> {
    return this.http.get<Discipline[]>(
      `${this.apiUrl}/${employeId}/disciplines`
    );
  }

  getExperiencesAssad(employeId: number): Observable<ExperienceAssad[]> {
    return this.http.get<ExperienceAssad[]>(
      `${this.apiUrl}/employes/${employeId}/experiences/assad`
    );
  }

  // Appel pour obtenir les expériences antérieures d'un employé
  getExperiencesAnterieures(
    employeId: number
  ): Observable<ExperienceAnterieure[]> {
    return this.http.get<ExperienceAnterieure[]>(
      `${this.apiUrl}/employes/${employeId}/experiences/anterieures`
    );
  }
  getPostesByEmploye(employeId: number): Observable<PosteAvecDatesDTO[]> {
    return this.http.get<PosteAvecDatesDTO[]>(
      `${this.apiUrl}/postes/${employeId}`
    );
  }
  ajouterPosteAEmploye(
    employeId: number,
    posteId: number,
    directionId: number,
    siteId: number,
    dateDebut: string,
    dateFin: string
  ): Observable<PosteAvecDatesDTO> {
    console.log('employeId:', employeId);
    console.log('posteId:', posteId);
    console.log('directionId:', directionId);
    console.log('siteId:', siteId);
    console.log('dateDebut:', dateDebut);
    console.log('dateFin:', dateFin);

    const url = `${this.apiUrl}/ajouterAvecPoste`;
    const params = new HttpParams()
      .set('employeId', employeId.toString())
      .set('posteId', posteId.toString())
      .set('directionId', directionId.toString())
      .set('siteId', siteId.toString())
      .set('dateDebut', dateDebut)
      .set('dateFin', dateFin);

    return this.http.post<PosteAvecDatesDTO>(url, null, { params });
  }

  getPosteDetails(
    employeId: number,
    posteId: number
  ): Observable<EmployePoste> {
    const params = new HttpParams()
      .set('employeId', employeId.toString())
      .set('posteId', posteId.toString());

    return this.http.get<EmployePoste>(`${this.apiUrl}/details`, { params });
  }

  getPosteDetailsById(employePosteId: number): Observable<EmployePoste> {
    return this.http.get<EmployePoste>(`${this.apiUrl}/details/${employePosteId}`);
}

  supprimerPostePourEmploye(
    employeId: number,
    posteId: number
  ): Observable<any> {
    const params = new HttpParams()
      .set('employeId', employeId.toString())
      .set('posteId', posteId.toString());

    return this.http.delete(`${this.apiUrl}/delete`, { params });
  }

  ajouterEmployeAvecPoste(
    posteId: number,
    directionId: number,
    siteId: number,
    employe: any,
    dateDebut: string,
    dateFin: string
  ): Observable<any> {
    // Préparation des paramètres pour l'URL
    const params = new HttpParams()
      .set('posteId', posteId.toString())
      .set('directionId', directionId.toString())
      .set('siteId', siteId.toString())
      .set('dateDebut', dateDebut)
      .set('dateFin', dateFin);

    // Appel HTTP POST
    return this.http.post<any>(`${this.apiUrl}/ajouter`, employe, {
      params: params,
    });
  }
  modifierEmploye(
    id: number,
    posteId: number | null,
    directionId: number | null,
    siteId: number | null,
    employe: Employe,
    dateDebut: string | null,
    dateFin: string | null
  ): Observable<Employe> {
    // Créer un objet HttpParams pour les paramètres de requête
    let params = new HttpParams();

    // Ajouter les paramètres uniquement s'ils ne sont pas null ou undefined
    if (posteId !== null && posteId !== undefined) {
      params = params.set('posteId', posteId.toString());
    }
    if (directionId !== null && directionId !== undefined) {
      params = params.set('directionId', directionId.toString());
    }
    if (siteId !== null && siteId !== undefined) {
      params = params.set('siteId', siteId.toString());
    }
    if (dateDebut !== null && dateDebut !== undefined) {
      params = params.set('dateDebut', dateDebut);
    }
    if (dateFin !== null && dateFin !== undefined) {
      params = params.set('dateFin', dateFin);
    }

    // Appel HTTP PUT avec les paramètres
    return this.http.put<Employe>(`${this.apiUrl}/${id}`, employe, { params });
  }

  modifierPosteAEmployeParId(
    employePosteId: number,
    posteId: number | null,
    directionId: number,
    siteId: number,
    dateDebut: string,
    dateFin: string | null
  ): Observable<PosteAvecDatesDTO> {
      const url = `${this.apiUrl}/poste/${employePosteId}`;
      
      let params = new HttpParams()
          .set('directionId', directionId.toString())
          .set('siteId', siteId.toString())
          .set('dateDebut', dateDebut);
          if (posteId) {
            params = params.set('posteId', posteId.toString());
        }
  
      if (dateFin) {
          params = params.set('dateFin', dateFin);
      }
      
      return this.http.put<PosteAvecDatesDTO>(url, null, { 
          params,
          headers: { 
              'Content-Type': 'application/json',
              'Accept': 'application/json'
          }
      }).pipe(
          catchError(error => {
              console.error('Erreur détaillée:', error);
              return throwError(error);
          })
      );
  }

  modifierPosteComplet(
    employePosteId: number,
    posteId: number | undefined,
    directionId: number,
    siteId: number,
    dateDebut: string,
    dateFin: string | null
  ): Observable<PosteAvecDatesDTO> {
      const url = `${this.apiUrl}/poste/${employePosteId}`;
      
      let params = new HttpParams()
          .set('directionId', directionId.toString())
          .set('siteId', siteId.toString())
          .set('dateDebut', dateDebut);
  
      if (posteId) {
          params = params.set('posteId', posteId.toString());
      }
      if (dateFin) {
          params = params.set('dateFin', dateFin);
      }
      
      return this.http.put<PosteAvecDatesDTO>(url, null, { 
          params,
          headers: { 
              'Content-Type': 'application/json',
              'Accept': 'application/json'
          }
      });
  }
  private formatDateToISO(date: Date): string {
      if (!date) return '';
      return date.toISOString().split('T')[0]; // Format: YYYY-MM-DD
  }
  private isValidDate(dateString: string): boolean {
      return !isNaN(Date.parse(dateString));
  }
  

  getDocumentByEmployeIdAndFormationId(
    employeId: number,
    formationId: number
  ): Observable<Blob> {
    const url = `${this.apiUrl}/document?employeId=${employeId}&formationId=${formationId}`;
    return this.http.get(url, { responseType: 'blob' }).pipe(
      catchError((error) => {
        console.error('Erreur lors de la récupération du document', error);
        return throwError(error); // Re-throw the error for further handling
      })
    );
  }
  supprimerPosteParId(employePosteId: number): Observable<any> {
    const url = `${this.apiUrl}/poste/${employePosteId}`;
    return this.http.delete(url);
  }
}