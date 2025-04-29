import { Component, OnInit } from '@angular/core';
import { BadgeModule } from 'primeng/badge';
import { ButtonModule } from 'primeng/button';
import { AuthService } from '../auth/service/auth.service';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../notification/service/notification.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-sidebar',
  imports: [ButtonModule, BadgeModule, CommonModule, BadgeModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
  standalone: true,
})
export class SidebarComponent  implements OnInit{
  userRole: string | null = null;
  userId: number | null = null;
  notifications: any[] = [];
  userDetails: any = {};
  unreadNotificationsCount: number = 0;

  
  private refreshInterval: any;

  constructor(
    private authService: AuthService, 
    private notificationService: NotificationService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.userRole = this.authService.getUserRole();
    this.userId = Number(localStorage.getItem('userId'));
    if (this.userId) {
      this.loadUserDetails(this.userId);
      this.loadUnreadNotifications();
      
      // Rafraîchir toutes les 30 secondes
      this.refreshInterval = setInterval(() => {
        this.loadUnreadNotifications();
      }, 30000);
    }
  }

  ngOnDestroy(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }


  isRH(): boolean {
     
    return this.userRole === 'RH';
  }
  

  isAdmin(): boolean {
    
    return this.userRole === 'ADMIN';
  }

  isDirecteur(): boolean {
    return this.userRole === 'DIRECTEUR';
  }

  isResponsable(): boolean {
    return this.userRole === 'RESPONSABLE';
  }

  logout() {
    this.authService.logout();
  }

  loadUnreadNotifications(): void {
    if (this.userId) {
      this.notificationService.getNotifications(this.userId).subscribe({
        next: (notifications) => {
          this.unreadNotificationsCount = notifications.filter(
            (notification) => !notification.lue
          ).length;
        },
        error: (error) => {
          console.error('Erreur lors du chargement des notifications:', error);
        }
      });
    }
  }

  markNotificationsAsRead() {
    if (this.userId) {
      console.log('Marking notifications as read for user:', this.userId);
      this.notificationService.markAsRead(this.userId).subscribe(
        () => {
          console.log('Notifications marked as read successfully');
          this.unreadNotificationsCount = 0;
        },
        (error) => {
          console.error('Error marking notifications as read:', error);
        }
      );
    }
  }

  loadUserDetails(userId: number): void {
    this.http.get<any>(`http://localhost:9090/login/utilisateurs/${userId}`)
      .subscribe(
        (response) => {
          this.userDetails = response;
        },
        (error) => {
          console.error('Erreur lors du chargement des détails utilisateur:', error);
        }
      );
  }

  // Dans votre composant




}