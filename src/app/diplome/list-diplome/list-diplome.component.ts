import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  NgForm,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { PaginatorModule } from 'primeng/paginator';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { Diplome } from '../model/diplome';
import { TypeDiplome } from '../model/type-diplome';
import { TypeDiplomeService } from '../service/type-diplome.service';
import { DiplomeService } from '../service/diplome.service';
import { DiplomeRequest } from '../model/diplome-request';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { TagModule } from 'primeng/tag';
@Component({
  selector: 'app-list-diplome',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    DropdownModule,
    PaginatorModule,
    ReactiveFormsModule,
    TagModule,
    ToastModule,
    ConfirmDialogModule,
    AutoCompleteModule,
  ],
  templateUrl: './list-diplome.component.html',
  styleUrl: './list-diplome.component.css',
  providers: [MessageService, ConfirmationService],
})
export class ListDiplomeComponent implements OnInit {
  @Input() employeId!: number;

  diplomes: Diplome[] = [];
  typeDiplomes: TypeDiplome[] = [];
  diplomeForm!: FormGroup;
  isEditing = false;
  diplomeToEdit: Diplome | null = null;
  diplomesExistants: Diplome[] = []; // Liste des diplômes en base
  filteredDiplomes: Diplome[] = [];
  editDiplomeForm: FormGroup;
  addDiplomeVisible = false;
  editDiplomeVisible = false;
  

  constructor(
    private diplomeService: DiplomeService,
    private TypeDiplomeservice: TypeDiplomeService,
    private fb: FormBuilder,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) {
    this.diplomeForm = this.fb.group({
      libelle: ['', Validators.required],
      typeDiplomeId: [null, Validators.required]
    });
    
    this.editDiplomeForm = this.fb.group({
      libelle: ['', Validators.required],
      typeDiplomeId: [null, Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadDiplomes();
    this.loadTypeDiplomes();
    this.loadAllDiplomes();
  }

  showAddDiplomeDialog(): void {
    this.diplomeForm.reset();
    this.addDiplomeVisible = true;
  }

  showEditDiplomeDialog(diplome: Diplome): void {
    this.diplomeToEdit = diplome;
    this.editDiplomeForm.patchValue({
      libelle: diplome.libelle,
      typeDiplomeId: diplome.typeDiplome?.id
    });
    this.editDiplomeVisible = true;
  }


  loadDiplomes() {
    this.diplomeService
      .getDiplomesByEmploye(this.employeId)
      .subscribe((data) => {
        console.log('Diplômes récupérés :', data);
        this.diplomes = data;
      });
  }

  loadTypeDiplomes() {
    this.TypeDiplomeservice.getAllTypeDiplomeNonArchives().subscribe((data) => {
      this.typeDiplomes = data;
      console.log('Types de diplômes récupérés :', this.typeDiplomes);
    });
  }

  // Modifiez la méthode addDiplome()
addDiplome(): void {
  if (this.diplomeForm.invalid) return;
  
  const { libelle, typeDiplomeId } = this.diplomeForm.value;
  
  this.diplomeService.addDiplomeEmploye(this.employeId, libelle, typeDiplomeId)
    .subscribe({
      next: () => {
        this.loadDiplomes();
        this.addDiplomeVisible = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: 'Diplôme ajouté avec succès',
          life: 3000
        });
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: "Erreur lors de l'ajout du diplôme",
          life: 3000
        });
      }
    });
}

// Modifiez la méthode updateDiplome()
updateDiplome(): void {
  if (this.editDiplomeForm.invalid || !this.diplomeToEdit?.id) return;
  
  const { libelle, typeDiplomeId } = this.editDiplomeForm.value;
  
  this.diplomeService.updateDiplomeEmploye(
    this.diplomeToEdit.id,
    this.employeId,
    libelle,
    typeDiplomeId
  ).subscribe({
    next: () => {
      this.loadDiplomes();
      this.editDiplomeVisible = false;
      this.messageService.add({
        severity: 'success',
        summary: 'Succès',
        detail: 'Diplôme modifié avec succès',
        life: 3000
      });
    },
    error: (err) => {
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur',
        detail: 'Erreur lors de la modification du diplôme',
        life: 3000
      });
    }
  });
}

deleteDiplomeEmploye(id: number) {
  this.diplomeService.deleteDiplomeEmploye(id, this.employeId).subscribe({
    next: () => {
      this.loadDiplomes();
      this.messageService.add({
        severity: 'success',
        summary: 'Succès',
        detail: 'Diplôme supprimé avec succès',
        life: 3000
      });
    },
    error: (err) => {
      console.error('Erreur suppression:', err);
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur',
        detail: 'Erreur lors de la suppression du diplôme',
        life: 3000
      });
    }
  });
}


confirmDelete(id: number): void {
  this.confirmationService.confirm({
    message: 'Êtes-vous sûr de vouloir supprimer ce diplôme?',
    header: 'Confirmation',
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: 'Oui',
    rejectLabel: 'Non',
    acceptButtonStyleClass: 'p-button-danger',
    rejectButtonStyleClass: 'p-button-secondary',
    acceptIcon: 'pi pi-check',
    rejectIcon: 'pi pi-times',
    accept: () => {
      this.deleteDiplomeEmploye(id);
    },
    reject: () => {
      this.messageService.add({
        severity: 'info',
        summary: 'Annulé',
        detail: 'Suppression annulée',
        life: 3000
      });
    }
  });
}

  
  
  editDiplome(diplome: Diplome) {
    this.diplomeToEdit = diplome;
    this.isEditing = true;
    this.diplomeForm.patchValue({
      libelle: diplome.libelle,
      typeDiplomeId: diplome.typeDiplome?.id,
    });
  }

  
  resetForm() {
    this.isEditing = false;
    this.diplomeToEdit = null;
    this.diplomeForm.reset();
  }

  loadAllDiplomes() {
    this.diplomeService.getAllDiplomes().subscribe((data) => {
      this.diplomesExistants = data;
    });
  }

  // Filtrer les diplômes existants
  filterDiplomes(event: any) {
    let query = event.query.toLowerCase();
    this.filteredDiplomes = this.diplomesExistants.filter((d) =>
      d.libelle.toLowerCase().includes(query)
    );
  }

  // Quand un diplôme est sélectionné, on met à jour le formulaire
  onDiplomeSelect(event: any) {
    if (event && event.value) {
      const selectedDiplome: Diplome = event.value;
      this.diplomeForm.patchValue({ libelle: selectedDiplome.libelle });
      this.diplomeForm.get('libelle')?.markAsTouched();
      this.diplomeForm.get('libelle')?.updateValueAndValidity();
    }
  }

  // Dans votre composant
  getTypeDiplomeIcon(type: string): string {
    switch (type.toLowerCase()) {
      case 'baccalauréat':
        return 'pi pi-id-card';
      case 'licence':
        return 'pi pi-certificate';
      case 'master':
        return 'pi pi-star';
      case 'doctorat':
        return 'pi pi-shield';
      default:
        return 'pi pi-book';
    }
  }

  getTypeDiplomeSeverity(
    type: string
  ): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
    switch (type.toLowerCase()) {
      case 'baccalauréat':
        return 'success';
      case 'licence':
        return 'info';
      case 'master':
        return 'warn';
      case 'doctorat':
        return 'danger';
      default:
        return 'info';
    }
  }

 
  focusOnFirstField() {
    setTimeout(() => {
      const firstField = document.getElementById('libelle');
      if (firstField) firstField.focus();
    }, 100);
  }

  
}