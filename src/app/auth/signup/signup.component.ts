import { Component, OnInit } from '@angular/core';
import { AuthService } from '../service/auth.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

// PrimeNG Modules
import { CardModule } from 'primeng/card';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { MessageModule } from 'primeng/message';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { provideAnimations } from '@angular/platform-browser/animations';
import { providePrimeNG } from 'primeng/config';

@Component({
  selector: 'app-admin-user-create',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    CardModule, FloatLabelModule, InputTextModule, 
    PasswordModule, ButtonModule, DropdownModule,
    MessageModule, ToastModule
  ],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css'],
  providers: [MessageService]
})
export class SignupComponent implements OnInit {
  registerForm: FormGroup;
  loading = false;
  
  roleOptions = [
    { label: 'Ressources Humaines', value: 'RH', icon: 'pi pi-users' },
    { label: 'Directeur', value: 'DIRECTEUR', icon: 'pi pi-user' },
    { label: 'Responsable', value: 'RESPONSABLE', icon: 'pi pi-id-card' }
  ];

  constructor(
    private authService: AuthService, 
    private router: Router, 
    private fb: FormBuilder,
    private messageService: MessageService
  ) {
    this.registerForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      nom: ['', [Validators.required]],
      prenom: ['', [Validators.required]],
      email: ['', [Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]],
      role: ['RH', [Validators.required]]
    }, { validator: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    
    if (!this.isAdmin()) {
      this.showError("Accès refusé", "Seuls les administrateurs peuvent créer des utilisateurs");
      this.router.navigate(['/dashboard']);
    }
  }

  passwordMatchValidator(formGroup: FormGroup) {
    const password = formGroup.get('password')?.value;
    const confirmPassword = formGroup.get('confirmPassword')?.value;

    if (password !== confirmPassword) {
      formGroup.get('confirmPassword')?.setErrors({ passwordMismatch: true });
    } else {
      formGroup.get('confirmPassword')?.setErrors(null);
    }
  }

  getRoleIcon(roleValue: string): string {
    const role = this.roleOptions.find(r => r.value === roleValue);
    return role ? role.icon : 'pi pi-question-circle';
  }

  submitForm() {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      this.showError('Formulaire invalide', 'Veuillez corriger les erreurs');
      return;
    }

    this.loading = true;
    const formValue = this.registerForm.value;

    let registrationObservable;
    switch(formValue.role) {
      case 'RH':
        registrationObservable = this.authService.registerRH(formValue);
        break;
      case 'DIRECTEUR':
        registrationObservable = this.authService.registerDirecteur(formValue);
        break;
      case 'RESPONSABLE':
        registrationObservable = this.authService.registerResponsable(formValue);
        break;
      default:
        this.showError('Erreur', 'Rôle invalide');
        this.loading = false;
        return;
    }

    registrationObservable.subscribe({
      next: (response) => {
        this.showSuccess('Utilisateur créé', `${response.prenom} ${response.nom} a été créé avec succès`);
        this.registerForm.reset({
          role: 'RH'
        });
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur lors de la création:', err);
        this.showError('Erreur', err.error?.message || 'Échec de la création');
        this.loading = false;
      }
    });
  }

  isAdmin(): boolean {
    return this.authService.getUserRole() === 'ADMIN';
  }

  private showSuccess(summary: string, detail: string) {
    this.messageService.add({
      severity: 'success',
      summary,
      detail,
      life: 5000
    });
  }

  private showError(summary: string, detail: string) {
    this.messageService.add({
      severity: 'error',
      summary,
      detail,
      life: 5000
    });
  }
}