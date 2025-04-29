import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, of, throwError } from 'rxjs';
import { FormationDto } from '../model/FormationDto.model';
import { PosteAvecDatesDTO } from '../../employe/model/PosteAvecDatesDTO';
import { FormationDto_Resultat } from '../model/FormationDto_Resultat';
import { ApiResponse } from '../model/ApiResponse';

@Injectable({
  providedIn: 'root'
})
export class FormationService {
  private apiUrl = 'http://localhost:9090/formations';
  private apiUrll = 'http://localhost:9090/api/employes';
  constructor(private http: HttpClient) { }

 // Modifier le type de retour pour Observable<number>
 creerFormation(formData: FormData): Observable<number> {
  return this.http.post<number>(`${this.apiUrl}`, formData);
}
  getFormationsParRH(rhId: number): Observable<FormationDto[]> {
    return this.http.get<FormationDto[]>(`${this.apiUrl}/${rhId}`);
  }

  getFormationsParResponsable(responsableId: number): Observable<FormationDto[]> {
    return this.http.get<FormationDto[]>(`${this.apiUrl}/responsable/${responsableId}`);
  }
  modifierDocumentEmployeFormation(formationId: number, employeId: number, fichierPdf: File): Observable<string> {
    const formData = new FormData();
    formData.append('fichierPdf', fichierPdf);
  
    const url = `${this.apiUrl}/${formationId}/employes/${employeId}/document`;
  
    return this.http.put(url, formData, { responseType: 'text' });
  }

  validerFormation(formationId: number): Observable<{ success: boolean, message: string }> {
    const url = `${this.apiUrl}/${formationId}/valider`;
    return this.http.put(url, {}, { responseType: 'text' }).pipe(
      map((response: string) => {
        // Convertir la réponse en un objet JSON
        return {
          success: true, // Supposons que la réponse est toujours un succès si elle arrive ici
          message: response // Utiliser la réponse du serveur comme message
        };
      }),
      catchError(this.handleError) // Gestion des erreurs
    );
  }

  modifierFormation(id: number, formData: FormData): Observable<string> {
    return this.http.put(`${this.apiUrl}/${id}`, formData, {
      responseType: 'text'
    });
  }
  
  
  

  // Gestion des erreurs HTTP
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Une erreur inattendue s\'est produite.';
    if (error.status === 404) {
      errorMessage = error.error || 'Formation non trouvée.';
    } else if (error.status === 400) {
      errorMessage = error.error || 'Requête invalide.';
    } else if (error.error instanceof ErrorEvent) {
      // Erreur côté client
      errorMessage = `Erreur : ${error.error.message}`;
    } else {
      // Erreur côté serveur
      errorMessage = `Code d'erreur : ${error.status}\nMessage : ${error.error}`;
    }
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }

  ajouterResultatFormation(formationId: number, employeId: number, resultat: string): Observable<string> {
    const url = `${this.apiUrl}/${formationId}/employes/${employeId}/resultat`;
  
    // Ajouter le paramètre `resultat` à l'URL
    const params = new HttpParams().set('resultat', resultat);
  
    return this.http.put(url, null, { params, responseType: 'text' }).pipe(
      catchError(this.handleError)
    );
  }
  getResultatFormation(formationId: number, employeId: number): Observable<{ resultat: string, res: boolean }> {
    const url = `${this.apiUrl}/${formationId}/employes/${employeId}/resultat`;
    return this.http.get<{ resultat: string, res: boolean }>(url).pipe(
        catchError((error) => {
            console.error('Erreur lors de la récupération du résultat :', error);
            // Retourne un objet par défaut en cas d'erreur
            return of({ resultat: 'Aucun résultat disponible', res: false });
        })
    );
}
changerPosteEmploye(
  employeId: number,
  nouveauPosteId: number,
  directionId: number,
  siteId: number
): Observable<PosteAvecDatesDTO> {
  const params = new HttpParams()
    .set('employeId', employeId.toString())
    .set('nouveauPosteId', nouveauPosteId.toString())
    .set('directionId', directionId.toString())
    .set('siteId', siteId.toString());

  return this.http.post<PosteAvecDatesDTO>(
    `${this.apiUrll}/changer-poste`,
    null, // No body
    { params }
  ).pipe(
    catchError(error => {
      console.error('Error:', error);
      return throwError(error);
    })
  );
}



creerFormationAvecResultat(formationDto: FormationDto_Resultat, rhId: number): Observable<FormationDto> {
  const url = `${this.apiUrl}/${rhId}/creerAvecResultat`;
  
  return this.http.post<FormationDto>(url, formationDto).pipe(
    catchError(this.handleError)
  );
}

// Dans votre FormationService

modifierFormationAvecResultat(
  formationDto: FormationDto_Resultat,
  rhId: number,
  formationId: number
): Observable<FormationDto> {
  const url = `${this.apiUrl}/${rhId}/modifierAvecResultat/${formationId}`;
  
  return this.http.put<FormationDto>(url, formationDto).pipe(
    catchError(this.handleError)
  );
}


getFormationsWithDetailsByEmploye(employeId: number): Observable<ApiResponse[]> {
  return this.http.get<ApiResponse[]>(`${this.apiUrl}/employe/${employeId}/details`).pipe(
    catchError(this.handleError)
  );
}



ajouterDateRappel(formationId: number, dateRappel: string): Observable<string> {
  // Notez le double 'formations/formations' dans l'URL
  const url = `${this.apiUrl}/formations/${formationId}/date-rappel`;
  
  return this.http.post(url, `"${dateRappel}"`, { 
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    }),
    responseType: 'text'
  }).pipe(
    catchError(this.handleError)
  );
}
modifierDateRappel(formationId: number, dateRappel: string): Observable<string> {
  if (!formationId) {
    return throwError(() => new Error('ID de formation requis'));
  }

  if (!dateRappel || !/^\d{4}-\d{2}-\d{2}$/.test(dateRappel)) {
    return throwError(() => new Error('Format de date invalide. Utilisez YYYY-MM-DD'));
  }

  const url = `${this.apiUrl}/formations/${formationId}/date-rappel`;
  
  // Important: le corps doit être la date entre guillemets (JSON string)
  const body = JSON.stringify(dateRappel); // Donnera ""2025-04-07"" dans la requête

  const headers = new HttpHeaders({
    'Content-Type': 'application/json'
  });

  return this.http.put(url, body, {
    headers: headers,
    responseType: 'text'
  }).pipe(
    catchError(this.handleErrorr)
  );
}

private handleErrorr(error: HttpErrorResponse) {
  let errorMessage = 'Erreur inconnue';
  if (error.error instanceof ErrorEvent) {
    // Erreur côté client
    errorMessage = `Erreur: ${error.error.message}`;
  } else {
    // Erreur côté serveur
    errorMessage = `Code: ${error.status}\nMessage: ${error.message}`;
    if (error.error) {
      try {
        const errorObj = JSON.parse(error.error);
        errorMessage += `\nDétails: ${errorObj.message || error.error}`;
      } catch (e) {
        errorMessage += `\nDétails: ${error.error}`;
      }
    }
  }
  console.error(errorMessage);
  return throwError(() => new Error(errorMessage));
}

getDateRappel(formationId: number): Observable<string | null> {
  if (!formationId || isNaN(formationId)) {
    return throwError(() => new Error('ID de formation invalide'));
  }

  const url = `${this.apiUrl}/formations/${formationId}/date-rappel`;
  
  return this.http.get(url, {
    responseType: 'text',
    headers: new HttpHeaders({
      'Accept': 'application/json'
    })
  }).pipe(
    map(response => {
      // Supprime les guillemets autour de la date si présents
      const date = response.replace(/^"|"$/g, '');
      return this.validateDate(date) ? date : null;
    }),
    catchError(this.handleErrorr)
  );
}
private validateDate(date: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(date);
}

signalerProbleme(formationId: number, commentaire: string): Observable<any> {
  const url = `${this.apiUrl}/${formationId}/probleme`;

  // Le backend attend un `String` pur, donc on l'envoie comme JSON string
  const body = JSON.stringify(commentaire);

  const headers = new HttpHeaders({
    'Content-Type': 'application/json'
  });
  return this.http.put(url, body, {
    headers,
    responseType: 'json'
  }).pipe(
    catchError(this.handleError)
  );
}







annulerFormation(id: number): Observable<FormationDto> {
  return this.http.put<FormationDto>(
    `${this.apiUrl}/${id}/annuler`, 
    {}  // body vide
  );
}

/** Réactive la formation (met annuler = false + supprime dateAnnulation) */
reactiverFormation(id: number): Observable<FormationDto> {
  return this.http.put<FormationDto>(
    `${this.apiUrl}/${id}/reactiver`,
    {}
  );
}




}

