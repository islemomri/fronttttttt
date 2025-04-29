import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormationPosteService } from '../service/FormationPosteService.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pdf',
  standalone: true, // si Angular v14+ standalone
  imports: [CommonModule],
  templateUrl: './pdf.component.html',
  styleUrls: ['./pdf.component.css']
})
export class PdfComponent implements OnInit {
  formation: any;
  employee: any;
  poste: any;
  isLoading = true;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private formationPosteService: FormationPosteService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const encodedData = params.get('dataq');
  
      if (encodedData) {
        try {
          const pdfData = JSON.parse(atob(encodedData)); // Décoder les données base64
  
          // Affecter les données de la formation
          this.formation = pdfData.formation;
  
          // Affecter les données de l'employé
          this.employee = pdfData.employee;
  
          // Optionnel : appeler un service si tu veux récupérer des données supplémentaires
          const formationId = this.formation.id;
          this.getPosteForFormation(formationId);
  
          this.isLoading = false;
        } catch (e) {
          console.error('Erreur de décodage des données', e);
          this.error = 'Données invalides';
          this.isLoading = false;
        }
      } else {
        this.error = 'Aucune donnée fournie';
        this.isLoading = false;
      }
    });
  }
  

  getPosteForFormation(formationId: number): void {
    this.formationPosteService.getPosteByFormationId(formationId).subscribe({
      next: (poste) => {
        this.poste = poste;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur lors de la récupération du poste', err);
        this.error = 'Erreur lors du chargement des données';
        this.isLoading = false;
      }
    });
  }




}
