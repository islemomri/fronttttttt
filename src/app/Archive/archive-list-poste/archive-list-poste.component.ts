import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { Poste } from '../../poste/model/poste';
import { PosteService } from '../../poste/service/poste.service';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-archive-list-poste',
  imports: [  CommonModule,
      TableModule,
      ButtonModule,
      InputTextModule,
      FormsModule,
      DialogModule,
      TagModule 
    ],
  templateUrl: './archive-list-poste.component.html',
  styleUrl: './archive-list-poste.component.css'
})
export class ArchiveListPosteComponent implements OnInit {
   postes: Poste[] = [];
    selectedPostes: Poste[] = [];
    searchText: string = '';
    visibleUpdateDialog: boolean = false;
    selectedPoste: Poste = new Poste();
    visible: boolean = false;
  
  
    constructor(private posteService: PosteService) {}
  
    ngOnInit(): void {
      this.loadPostes();
    }
    openEditDialog(poste: Poste): void {
      this.selectedPoste = { ...poste }; // Clonage pour éviter la modification directe dans la liste
      this.visibleUpdateDialog = true; // Affichage du dialogue d'édition
    }
    
  
    loadPostes(): void {
      this.posteService.getAllPostesArchives().subscribe((data: Poste[]) => {
        this.postes = data;
      });
    }
  
    deletePoste(poste: Poste): void {
      if (confirm(`Voulez-vous vraiment supprimer le poste "${poste.titre}" ?`)) {
        this.posteService.desarchiverPoste(poste.id!).subscribe(() => {
          this.postes = this.postes.filter(p => p.id !== poste.id);
        });
      }
    }
  
    exportPostes(): void {
      console.log('Exporting postes...');
    }
  
    editPoste(poste: Poste): void {
      this.selectedPoste = { ...poste };
      this.visibleUpdateDialog = true;
    }
  


}