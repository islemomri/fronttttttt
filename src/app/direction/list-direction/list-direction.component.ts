import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { SpeedDialModule } from 'primeng/speeddial';
import { Table, TableModule } from 'primeng/table';
import { Direction } from '../model/Direction';
import { DirectionService } from '../service/direction.service';
import { MenuItem } from 'primeng/api';
import { NgModule } from '@angular/core';
import { DirectionDTO } from '../model/DirectionDTO';
import { Site } from '../../site/model/site';
import { SiteService } from '../../site/service/site.service';
import { PickListModule } from 'primeng/picklist';
import { MultiSelectModule } from 'primeng/multiselect';





@Component({
  selector: 'app-list-direction',
  imports: [ TableModule,
      DialogModule,
      FormsModule,
      ButtonModule,
      InputTextModule,
      CommonModule,
      SpeedDialModule,
      SpeedDialModule,
          PickListModule,
          MultiSelectModule
    
    ],
       schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './list-direction.component.html',
  styleUrl: './list-direction.component.css'
})
export class ListDirectionComponent implements OnInit {

  directions: Direction[] = [];
  selectedDirections: Direction[] = [];
  visible: boolean = false;
  showDialog: boolean = false;  
  selectedDirection: Direction = { id: 0, nom_direction: '', archive: false };
  newDirection: Direction = { id: 0, nom_direction: '', archive: false };
  editVisible: boolean = false;  // Ajout pour gérer la visibilité du formulaire d'édition
  editForm!: FormGroup;  // Ajout du formulaire réactif
  new: DirectionDTO = { 
    id: 0,  // Vous pouvez utiliser null ou 0 si nécessaire
    nom_direction: '', 
    siteIds: [] 
  };
  
  searchText: string = '';
  sites: any[] = []; 
  selectedSites: Site[] = []; // Pour contenir les sites sélectionnés

  @ViewChild('dt') dt!: Table;

  constructor(private directionService: DirectionService, private siteservice : SiteService) {}


 ngOnInit(): void {
  this.getDirections();
this.loadSites();
  
 }
 saveDirection() {
  // Implémente la sauvegarde des modifications
  this.visible = false;
}

 getDirections(): void {
  this.directionService.getAllDirections().subscribe((data: Direction[]) => {
    this.directions = data;
    console.log('Directions chargées:', this.directions);
  });
}







getItems(direction: Direction): MenuItem[] {
  return [
    {
      label: 'Delete',
      icon: 'pi pi-trash',
      command: () => this.archiveDirection(direction)
    },
    {
      label: 'Edit',
      icon: 'pi pi-pencil',
      command: () => this.openEditDialog(direction)
    }
  ];
}
archiveDirection(direction: Direction): void {
  if (direction.id === undefined) {
    console.error("Impossible d'archiver : l'ID de la direction est indéfini.");
    return;
  }

  if (confirm(`Voulez-vous vraiment archiver la direction ${direction.nom_direction} ?`)) {
    // Appel du service pour archiver la direction
    this.directionService.archiverDirection(direction.id).subscribe({
      next: (response) => {
        direction.archive = true;  // Met à jour l'état de l'archive
        console.log('Direction archivée avec succès', response);
        this.getDirections();
      },
      error: (err) => {
        console.error('Erreur lors de l\'archivage de la direction', err);
      }
    });
  }
}


openEditDialog(direction: Direction): void {
  if (direction.id === undefined) {
    console.error('ID de la direction est indéfini');
    return; // Ne pas continuer si l'ID est indéfini
  }

  this.selectedDirection = { ...direction };

  // Appeler l'API pour obtenir les sites associés à la direction sélectionnée
  this.directionService.getSitesByDirection(direction.id).subscribe((sites: Site[]) => {
    this.selectedSites = sites;  // Précoche les sites dans le multiselect
  });

  this.visible = true;
}


showAddDirectionDialog(): void {
  this.showDialog = true;
  this.newDirection = { id: 0, nom_direction: '', archive: false }; // Ajouter 'archive'
}

addDirection() {
  // Mettre à jour le modèle avec le nom et les sites sélectionnés
  this.new.nom_direction = this.newDirection.nom_direction; // Ajoute le nom de la direction
  this.new.siteIds = this.selectedSites
    .map(site => site.id)
    .filter(id => id !== undefined) as number[]; // On s'assure que les IDs sont valides

  // Appel du service pour ajouter la direction
  this.directionService.addDirection(this.new).subscribe(response => {
    console.log('Direction ajoutée avec succès:', response);
    // Réinitialiser après l'ajout
    this.selectedSites = []; 
    this.newDirection.nom_direction = ''; // Réinitialiser le nom de la direction
    this.showDialog = false;
  }, error => {
    console.error('Erreur lors de l\'ajout de la direction:', error);
  });
}



  
updateDirection(): void {
  if (this.selectedDirection.id) {
      // Créez un DirectionDTO avec l'ID, le nom et les sites associés
      const updatedDirectionDTO: DirectionDTO = new DirectionDTO(
          this.selectedDirection.id,  // Assurez-vous d'ajouter l'ID ici
          this.selectedDirection.nom_direction,  // Nom de la direction
          this.selectedSites
              .map(site => site.id)  // Récupère les IDs
              .filter((id): id is number => id !== undefined)  // Filtre les valeurs undefined
      );

      // Appelez la méthode updateDirection avec le DTO complet
      this.directionService.updateDirection(updatedDirectionDTO).subscribe(
          (response) => {
              console.log('Direction mise à jour:', response);
              // Mettre à jour la direction dans la liste
              this.visible = false;
              const index = this.directions.findIndex((dir) => dir.id === this.selectedDirection.id);
              if (index !== -1) {
                  this.directions[index] = response;
              }
          },
          (error) => {
              console.error('Erreur lors de la mise à jour de la direction', error);
          }
      );
  }
}



exportDirections(): void {
  if (this.selectedDirections.length > 0) {
    const csvData = this.convertToCSV(this.selectedDirections); // Utiliser le bon tableau
    this.downloadCSV(csvData);
  } else {
    const csvData = this.convertToCSV(this.directions); // Utiliser le tableau complet si aucun élément n'est sélectionné
    this.downloadCSV(csvData);
  }
}


convertToCSV(data: any[]): string {
  if (data.length === 0) return '';

  const headers = Object.keys(data[0]); 
  const rows = data.map(row => headers.map(header => row[header]).join(','));

  return [headers.join(','), ...rows].join('\n');
}

downloadCSV(csvData: string): void {
  const blob = new Blob([csvData], { type: 'text/csv' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'directions.csv';
  link.click();
}

loadSites(): void {
  this.siteservice.getAllSites().subscribe(
    (data: Site[]) => {
      this.sites = data;  // Assigne les sites récupérés à la propriété 'sites'
      console.log('Sites récupérés :', this.sites);  // Vérifie dans la console
    },
    (error: any) => {
      console.error('Erreur lors de la récupération des sites :', error);
    }
  );
}


}