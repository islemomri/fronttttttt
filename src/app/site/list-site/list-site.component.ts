import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit, ViewChild } from '@angular/core';
import { Table, TableModule } from 'primeng/table';

import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { Site } from '../model/site';
import { SiteService } from '../service/site.service';
import { MenuItem } from 'primeng/api';
import { SpeedDialModule } from 'primeng/speeddial';
import { DialogModule } from 'primeng/dialog';
import { DirectionService } from '../../direction/service/direction.service';
import { Direction } from '../../direction/model/Direction';
import { PickListModule } from 'primeng/picklist';
import { MultiSelectModule } from 'primeng/multiselect';

import { Poste } from '../../poste/model/poste';


@Component({
  selector: 'app-list-site',
  imports: [
    TableModule,
    DialogModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    CommonModule,
    SpeedDialModule,
    PickListModule,
    MultiSelectModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './list-site.component.html',
  styleUrl: './list-site.component.css'
})
export class ListSiteComponent implements OnInit {
  sites: Site[] = [];
  selectedSites: Site[] = [];
  visible: boolean = false;
  showDialog: boolean = false;  
  selectedSite: Site = { id: 0, nom_site: '', archive: false };
  directions: Direction[] = [];
  newSite: Site = { id: 0, nom_site: '' , archive: false};  
  selectedDirections: Direction[] = [];
  postes: Poste[] = [];
  selectedPostes: Poste[] = [];
  searchText: string = '';
  @ViewChild('dt') dt!: Table;
  mapHeight: string = '300px'; // Valeur initiale de la carte

  constructor(private siteService: SiteService, private directionservice: DirectionService) {}

  ngOnInit(): void {
    this.getSites();
    
  }
  onDirectionsListShow() {
    this.mapHeight = '500px'; // Augmenter la taille de la carte lorsque la liste des directions est ouverte
  }

  // Fonction appelée lorsque la liste des directions est fermée
  onDirectionsListHide() {
    this.mapHeight = '300px'; // Rétablir la taille initiale de la carte lorsque la liste des directions est fermée
  }

 


  openEditDialog(site: Site): void {
    this.selectedSite = { ...site };  // Cloner l'objet pour éviter les modifications directes
    this.visible = true;
  
    // Vérifier si selectedSite.id est un nombre valide
    const siteId = this.selectedSite.id;
  
    
       
  }
  
  
  



  getSites(): void {
    this.siteService.getAllSites().subscribe((data: Site[]) => {
      this.sites = data;
      console.log('Sites chargés:', this.sites);
    });
  }

  getItems(site: Site): MenuItem[] {
    return [
      {
        label: 'Delete',
        icon: 'pi pi-trash',
        command: () => this.archiveSite(site) // Passer l'objet complet
      },
      {
        label: 'Edit',
        icon: 'pi pi-pencil',
        command: () => this.openEditDialog(site)
      }
    ];
  }


  archiveSite(site: Site): void {
    if (site.id !== undefined) {
      if (confirm(`Voulez-vous vraiment archiver le site ${site.nom_site} ?`)) {
        // Appel de la méthode du service pour archiver le site
        this.siteService.archiverSite(site.id).subscribe({
          next: (response) => {
            // Une fois archivé, mettre à jour localement la propriété 'archive'
            site.archive = true;  // Mise à jour du site localement
            console.log('Site archivé avec succès', response);
            this.getSites(); 
          },
          error: (err) => {
            console.error('Erreur lors de l\'archivage du site', err);
          }
        });
      }
    } else {
      console.error('L\'ID du site est indéfini');
    }
  }
  


// Méthode pour éditer un site
editSite(site: Site): void {
  this.openEditDialog(site);
}


  // Afficher la boîte de dialogue pour ajouter un site
  showAddSiteDialog(): void {
    this.showDialog = true; // Ouvrir la boîte de dialogue d'ajout
    this.newSite = { id: 0, nom_site: '', archive: false }; // Réinitialiser le modèle
    this.selectedDirections = [];
  }
// Dans list-site.component.ts
updateSiteName(): void {
  if (this.selectedSite.id && this.selectedSite.nom_site.trim() !== '') {
    this.siteService.updateSiteName(this.selectedSite.id, this.selectedSite.nom_site)
      .subscribe({
        next: (updatedSite) => {
          // Met à jour la liste des sites avec le nom modifié
          const index = this.sites.findIndex(site => site.id === updatedSite.id);
          if (index !== -1) {
            this.sites[index] = updatedSite;  // Remplace le site avec l'ID correspondant
          }
          console.log('Nom du site mis à jour avec succès', updatedSite);
          this.visible = false; // Ferme le dialogue d'édition
        },
        error: (err) => {
          console.error('Erreur lors de la mise à jour du nom du site', err);
        }
      });
  } else {
    alert('Le nom du site ne peut pas être vide.');
  }
}

  

  

 
  addSite(): void {
    if (this.newSite.nom_site.trim() !== '') {
      // Créer l'objet site avec uniquement les IDs des directions et des postes sélectionnés
      const siteSansId = { 
        nom_site: this.newSite.nom_site, 
        archive: false,
        directionIds: this.selectedDirections.map(direction => direction.id), // Extraire uniquement les IDs des directions
        postesIds: this.selectedPostes.map(poste => poste.id) // Extraire uniquement les IDs des postes
      };
  
      // Affichage de l'objet site dans la console avant l'envoi au backend
      console.log('Objet site envoyé au backend (avec les IDs des directions et postes seulement):', siteSansId);
  
      // Appel du service pour ajouter le site
      this.siteService.ajouterSite(siteSansId).subscribe({
        next: (siteAjoute) => {
          this.sites.push(siteAjoute); // Ajouter le site à la liste locale
          console.log('Site ajouté avec succès:', siteAjoute);
          this.showDialog = false; // Fermer la boîte de dialogue après l'ajout
          this.newSite = { id: 0, nom_site: '', archive: false }; // Réinitialiser le formulaire
          this.selectedDirections = []; // Réinitialiser la sélection des directions
          this.selectedPostes = []; // Réinitialiser la sélection des postes
        },
        error: (err) => console.error('Erreur lors de l\'ajout du site:', err)
      });
    } else {
      alert('Le nom du site ne peut pas être vide.');
    }
  }
  
  
  
  exportSites(): void {
    if (this.selectedSites.length > 0) {
      const csvData = this.convertToCSV(this.selectedSites); // Utiliser les éléments sélectionnés
      this.downloadCSV(csvData);
    } else {
    const csvData = this.convertToCSV(this.sites); // Sites peut être ton tableau de données
    this.downloadCSV(csvData);}
  }
  
  convertToCSV(data: any[]): string {
    const headers = Object.keys(data[0]); // Prendre les noms de propriétés des objets
    const rows = data.map(row =>
      headers.map(header => row[header]).join(',')
    );
    
    return [headers.join(','), ...rows].join('\n');
  }
  
  downloadCSV(csvData: string): void {
    const blob = new Blob([csvData], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'sites.csv'; // Nom du fichier exporté
    link.click();
  }
  
  
  
  
  
}