import { Component, OnInit } from '@angular/core';
import { Utilisateur } from '../model/utilisateur';
import { UtilisateurService } from '../service/utilisateur.service';
import { CommonModule } from '@angular/common';
import { TagModule } from 'primeng/tag';
import { AuthService } from '../../auth/service/auth.service';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DialogModule } from 'primeng/dialog';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { CardModule } from 'primeng/card';
import { AvatarModule } from 'primeng/avatar';
import { BadgeModule } from 'primeng/badge';
import { ChipModule } from 'primeng/chip';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { PaginatorModule } from 'primeng/paginator';
import { DateFormatPipe } from "../date-format.pipe";

@Component({
  selector: 'app-utilisateur',
  standalone: true,
  imports: [
    CommonModule,
    TagModule,
    TableModule,
    ButtonModule,
    DialogModule,
    ReactiveFormsModule,
    FormsModule,
    InputTextModule,
    ConfirmDialogModule,
    ToastModule,
    CardModule,
    AvatarModule,
    BadgeModule,
    ChipModule,
    InputGroupModule,
    InputGroupAddonModule,
    PaginatorModule,
],
  templateUrl: './utilisateur.component.html',
  styleUrl: './utilisateur.component.css',
  providers: [MessageService, ConfirmationService],
})
export class UtilisateurComponent implements OnInit {
  utilisateurs: Utilisateur[] = [];
  filteredUsers: Utilisateur[] = [];
  userRole: string | null = null;
  selectedUser: Utilisateur | null = null;
  utilisateurSelectionne: Utilisateur = {} as Utilisateur;
  displayDialog: boolean = false;
  passwordDialogVisible: boolean = false;
  newPassword: string = '';

  // UI States
  detailsDialogVisible: boolean = false;
  editMode: boolean = false;
  viewMode: 'grid' | 'list' = 'grid';
  
  // Search & Filter
  searchTerm: string = '';
  selectedRoles: string[] = [];
  roleOptions = [
    { label: 'Administrateur', value: 'ADMIN' },
    { label: 'Directeur', value: 'DIRECTEUR' },
    { label: 'RH', value: 'RH' },
    { label: 'Responsable', value: 'RESPONSABLE' }
  ];

  // Recherche et pagination
  first: number = 0;
  rows: number = 10;
  totalRecords: number = 0;

  constructor(
    private utilisateurService: UtilisateurService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadUsers();
    this.userRole = this.authService.getUserRole();
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.filterUsers();
  }

  loadUsers(): void {
    this.utilisateurService.getUtilisateurs().subscribe({
      next: (data) => {
        this.utilisateurs = data.map(user => {
          let lastLogin: Date | null = null;
          
          if (user.lastLogin) {
            lastLogin = typeof user.lastLogin === 'string' 
              ? new Date(user.lastLogin) 
              : user.lastLogin;
          }
          
          return {
            ...user,
            lastLogin
          };
        });
        console.log('Données transformées:', this.utilisateurs); // <-- Ajoutez ce log
        this.filteredUsers = [...this.utilisateurs];
        this.totalRecords = this.filteredUsers.length;
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Impossible de charger les utilisateurs',
          life: 3000
        });
      }
    });
  }
  
  filterUsers(): void {
    let filtered = [...this.utilisateurs];
    
    // Filtre par recherche
    if (this.searchTerm) {
      const searchTermLower = this.searchTerm.toLowerCase();
      filtered = filtered.filter(user =>
        `${user.nom} ${user.prenom} ${user.email} ${user.username} ${user.role}`
          .toLowerCase()
          .includes(searchTermLower)
    )}
    
    // Filtre par rôle
    if (this.selectedRoles && this.selectedRoles.length > 0) {
      filtered = filtered.filter(user => this.selectedRoles.includes(user.role));
    }
    
    this.filteredUsers = filtered;
    this.totalRecords = this.filteredUsers.length;
    this.first = 0;
  }

  countByRole(role: string): number {
    return this.utilisateurs.filter(u => u.role === role).length;
  }


  onPageChange(event: any): void {
    this.first = event.first;
    this.rows = event.rows;
  }

  getSeverity(
    role: string
  ): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
    switch (role) {
      case 'ADMIN':
        return 'danger';
      case 'DIRECTEUR':
        return 'warn';
      case 'RH':
        return 'info';
      case 'RESPONSABLE':
        return 'success';
      default:
        return 'secondary';
    }
  }

  getRoleColor(role: string): string {
    switch (role) {
      case 'ADMIN': return '#EB455F';
      case 'DIRECTEUR': return '#2B3467';
      case 'RH': return '#00A896';
      case 'RESPONSABLE': return '#11468F';
      default: return '#6c757d';
    }
  }

  viewUserDetails(utilisateur: Utilisateur): void {
  console.log('Raw lastLogin:', utilisateur.lastLogin);
  console.log('Converted lastLogin:', utilisateur.lastLogin ? new Date(utilisateur.lastLogin) : null);
  this.selectedUser = utilisateur;
  this.detailsDialogVisible = true;
}

  getRoleClass(role: string): string {
    return `role-chip-${role.toLowerCase()}`;
  }

  openEditDialog(utilisateur: Utilisateur): void {
    this.utilisateurSelectionne = { ...utilisateur };
    this.displayDialog = true;
  }

  updateUtilisateur(): void {
    if (this.utilisateurSelectionne) {
      this.utilisateurService
        .updateUtilisateur(
          this.utilisateurSelectionne.id,
          this.utilisateurSelectionne
        )
        .subscribe({
          next: (updatedUser) => {
            this.utilisateurs = this.utilisateurs.map((u) =>
              u.id === updatedUser.id ? updatedUser : u
            );
            this.filteredUsers = [...this.utilisateurs];
            this.displayDialog = false;
            this.messageService.add({
              severity: 'success',
              summary: 'Succès',
              detail: 'Utilisateur mis à jour',
            });
          },
          error: (err) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Erreur',
              detail: 'Échec de la mise à jour',
            });
          },
        });
    }
  }

  openAddUserDialog(): void {
    this.utilisateurSelectionne = {
      id: 0,
      nom: '',
      prenom: '',
      email: '',
      username: '',
      role: 'RH',
      lastLogin: null
    };
    this.editMode = false;
    this.displayDialog = true;
  }
  deleting: boolean = false;
  deleteUtilisateur(id: number): void {
    this.deleting = true;
    this.confirmationService.confirm({
      header: 'Confirmer la suppression',
      message: 'Cette action est irréversible. Voulez-vous vraiment supprimer cet utilisateur ?',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Oui, supprimer',
      rejectLabel: 'Annuler',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-text',
      accept: () => {
        this.utilisateurService.deleteUtilisateur(id).subscribe({
          next: () => {
            this.utilisateurs = this.utilisateurs.filter(u => u.id !== id);
            this.filteredUsers = this.filteredUsers.filter(u => u.id !== id);
            this.totalRecords = this.filteredUsers.length;
            this.messageService.add({
              severity: 'error',
              summary: 'Erreur',
              detail: 'Échec de la suppression',
              life: 3000
            });
            this.deleting = false;
          },
          error: (err) => {
            this.messageService.add({
              severity: 'success',
              summary: 'Succès',
              detail: 'Utilisateur supprimé',
              life: 3000
            });
            this.deleting = false;
          }
        });
      }
    });
  }


  

  resetPassword(userId: number, nom: string): void {
    this.confirmationService.confirm({
      header: 'Confirmation',
      message: `Voulez-vous vraiment réinitialiser le mot de passe de ${nom} ?`,
      icon: 'pi pi-exclamation-circle',
      acceptLabel: 'Oui',
      rejectLabel: 'Non',
      acceptButtonStyleClass: 'p-button-success',
      rejectButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.utilisateurService.resetPassword(userId).subscribe({
          next: (response) => {
            this.newPassword = response.newPassword;
            this.passwordDialogVisible = true;
            this.messageService.add({
              severity: 'success',
              summary: 'Succès',
              detail: `Le mot de passe de ${nom} a été réinitialisé.`,
              life: 3000,
            });
          },
          error: (err) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Erreur',
              detail: 'Impossible de réinitialiser le mot de passe',
              life: 3000,
            });
          },
        });
      },
      reject: () => {
        this.messageService.add({
          severity: 'info',
          summary: 'Annulé',
          detail: 'Réinitialisation annulée',
          life: 3000,
        });
      },
    });
  }

  copyToClipboard(input: HTMLInputElement): void {
    input.select();
    document.execCommand('copy');
    input.setSelectionRange(0, 0);
    
    this.messageService.add({
      severity: 'success',
      summary: 'Copié',
      detail: 'Mot de passe copié dans le presse-papiers',
      life: 2000
    });
  }

  capitalizeFirstLetter(text: string): string {
    if (!text) return text;
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  }
}
