import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [CommonModule,RouterModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  recentUpdates = [
    {
      message: '3 nouvelles formations planifiées pour Juin',
      time: new Date('2023-05-28'),
      type: 'formation',
      icon: 'pi pi-book'
    },
    {
      message: 'Validation des diplômes en attente',
      time: new Date('2023-05-27'),
      type: 'diplome',
      icon: 'pi pi-graduation-cap'
    },
    {
      message: '5 nouveaux messages non lus',
      time: new Date('2023-05-26'),
      type: 'message',
      icon: 'pi pi-envelope'
    }
  ];

  quickLinks = [
    { path: '/list-employe-existants', icon: 'pi pi-users', label: 'Employés' },
    { path: '/formations', icon: 'pi pi-book', label: 'Formations' },
    { path: '/list-Poste', icon: 'pi pi-briefcase', label: 'Postes' },
    { path: '/messages', icon: 'pi pi-envelope', label: 'Messagerie' },
    { path: '/notifications', icon: 'pi pi-bell', label: 'Notifications' },
    { path: '/chart', icon: 'pi pi-chart-bar', label: 'Statistiques' }
  ];
}
