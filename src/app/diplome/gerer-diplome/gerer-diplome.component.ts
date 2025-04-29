import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { PaginatorModule } from 'primeng/paginator';
import { Table, TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { Diplome } from '../model/diplome';
import { TypeDiplome } from '../model/type-diplome';
import { TypeDiplomeService } from '../service/type-diplome.service';
import { DiplomeService } from '../service/diplome.service';
import { DiplomeRequest } from '../model/diplome-request';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-gerer-diplome',
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    DropdownModule,
    PaginatorModule,
    ToastModule,
    ConfirmDialogModule,
    TagModule
  ],
  templateUrl: './gerer-diplome.component.html',
  styleUrl: './gerer-diplome.component.css',
  providers: [MessageService, ConfirmationService],
})
export class GererDiplomeComponent implements OnInit {
  globalFilter: string = '';
  @ViewChild('dt') dt: Table | undefined; // dt peut être undefined
  diplomes: Diplome[] = [];
  typeDiplomes: TypeDiplome[] = [];
  visible = false;
  editVisible = false;
  selectedTypeId: number | null = null;
  libelleDiplome = '';
  editingDiplome: Diplome | null = null;
  loading = true;

  constructor(
    private diplomeService: DiplomeService,
    private typeDiplomeService: TypeDiplomeService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.getAllDiplomes();
    this.getAllTypeDiplomes();
  }
  applyFilter(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.globalFilter = input.value;
    if (this.dt) {
      this.dt.filterGlobal(this.globalFilter, 'contains');
    }
  }

  getAllDiplomes(): void {
    this.diplomeService.getAllDiplomes().subscribe((data) => {
      this.diplomes = data;
    });
  }

  getAllTypeDiplomes(): void {
    this.typeDiplomeService.getAllTypeDiplomeNonArchives().subscribe((data) => {
      this.typeDiplomes = data;
    });
  }

  showAddDialog(): void {
    this.libelleDiplome = '';
    this.selectedTypeId = null;
    this.visible = true;
  }

  onSubmit(form: NgForm): void {
    if (form.invalid || !this.selectedTypeId) return;
    const newDiplome: Diplome = {
      libelle: this.libelleDiplome,
      typeDiplome: { id: this.selectedTypeId } as TypeDiplome,
    };
    this.diplomeService.addDiplome(newDiplome).subscribe(() => {
      this.getAllDiplomes();
      this.messageService.add({
        severity: 'success',
        summary: 'Succès',
        detail: 'Diplôme ajouté avec succès',
      });
      this.visible = false;
      form.resetForm();
    });
  }

  showEditDialog(diplome: Diplome): void {
    this.editingDiplome = { ...diplome };
    this.selectedTypeId = diplome.typeDiplome?.id || null;
    this.editVisible = true;
  }

  onUpdateSubmit(form: NgForm): void {
    if (form.invalid || !this.selectedTypeId || !this.editingDiplome) return;

    const diplomeRequest: DiplomeRequest = {
      idType: this.selectedTypeId,
      libelleTypeDiplome: this.editingDiplome.typeDiplome.libelleTypeDiplome,
      libelle: this.editingDiplome.libelle,
    };

    this.diplomeService
      .updateDiplome(this.editingDiplome.id!, diplomeRequest)
      .subscribe(() => {
        this.getAllDiplomes();
        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: 'Diplôme mis à jour avec succès',
        });
        this.editVisible = false;
      });
  }

  confirmDelete(id: number): void {
    this.confirmationService.confirm({
      header: 'Confirmation de suppression',
      message:
        'Êtes-vous sûr de vouloir supprimer ce diplôme ? Cette action est irréversible.',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonProps: {
        label: 'Oui, supprimer',
        icon: 'pi pi-check',
        severity: 'danger',
      },
      rejectButtonProps: {
        label: 'Annuler',
        icon: 'pi pi-times',
        severity: 'secondary',
      },
      accept: () => {
        this.deleteDiplome(id);
      },
      reject: () => {
        this.messageService.add({
          severity: 'info',
          summary: 'Annulé',
          detail: 'Suppression annulée',
        });
      },
    });
  }

  deleteDiplome(id: number): void {
    this.diplomeService.deleteDiplome(id).subscribe(() => {
      this.getAllDiplomes();
      this.messageService.add({
        severity: 'success',
        summary: 'Succès',
        detail: 'Diplôme supprimé avec succès',
      });
    });
  }
  getTypeSeverity(typeName: string | undefined): string {
    if (!typeName) return 'info';
    
    const type = typeName.toLowerCase();
    if (type.includes('licence')) return 'success';
    if (type.includes('master')) return 'warning';
    if (type.includes('doctorat')) return 'danger';
    return 'info';
  }
}
