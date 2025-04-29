import { Component, OnInit } from '@angular/core';
import { MessageDto } from '../model/message-dto';
import { MessageService } from '../service/message.service';
import { AuthService } from '../../auth/service/auth.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-messages',
  imports: [ReactiveFormsModule, FormsModule, CommonModule, RouterModule],
  templateUrl: './messages.component.html',
  styleUrl: './messages.component.css'
})
export class MessagesComponent implements OnInit {
  messagesRecus: MessageDto[] = [];
  filteredMessages: MessageDto[] = [];
  userId!: number;
  activeCategory: 'recus' | 'envoyes' = 'recus';
  searchTerm: string = '';
  showFilters: boolean = false;
  filterUnread: boolean = false;
  filterImportant: boolean = false;
  unreadCount: number = 0;
  private searchSubject = new Subject<string>();

  constructor(
    private messageService: MessageService,
    private authService: AuthService 
  ) {}

  ngOnInit() {
    const id = this.authService.getUserId();
    if (id !== null) {
      this.userId = id;
      this.loadMessages();
      
      this.searchSubject.pipe(
        debounceTime(300),
        distinctUntilChanged()
      ).subscribe(searchTerm => {
        this.applyFilters();
      });
    }
  }
  
  changerCategorie(categorie: 'recus' | 'envoyes') {
    this.activeCategory = categorie;
    this.loadMessages();
  }
  
  refreshMessages() {
    this.loadMessages();
  }

  

  applyFilters() {
    let filtered = [...this.messagesRecus];
    
    // Filtre de recherche
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(msg => 
        (msg.sujet && msg.sujet.toLowerCase().includes(term)) ||
        (msg.contenu && msg.contenu.toLowerCase().includes(term)) ||
        (msg.expediteur?.nom && msg.expediteur.nom.toLowerCase().includes(term)) ||
        (msg.expediteur?.prenom && msg.expediteur.prenom.toLowerCase().includes(term))
      );
    }
    
    // Filtre non lus
    if (this.filterUnread) {
      filtered = filtered.filter(msg => !msg.lu);
    }
    
    // Filtre importants
    
    this.filteredMessages = filtered;
  }

  toggleStar(event: Event, messageId: number) {
    event.stopPropagation();
    const message = this.messagesRecus.find(m => m.id === messageId);
    if (message) {
      
      this.applyFilters();
    }
  }

  

  trackByMessageId(index: number, message: MessageDto): number {
    return message.id!;
  }

messagesEnvoyes: MessageDto[] = [];


getAvatarColor(id: number): number {
  return id % 6; // Retourne un nombre entre 0 et 5 pour les couleurs d'avatar
}
loadMessages() {
  if (this.activeCategory === 'recus') {
    this.messageService.getRecus(this.userId).subscribe(res => {
      this.messagesRecus = res;
      this.filteredMessages = [...this.messagesRecus];
    });
  } else if (this.activeCategory === 'envoyes') {
    this.messageService.getEnvoyes(this.userId).subscribe(res => {
      this.messagesRecus = res as unknown as MessageDto[];
      this.filteredMessages = [...this.messagesRecus];
    });
    
  }
}

getInitials(nom: string, prenom: string): string {
  return `${prenom?.charAt(0) || ''}${nom?.charAt(0) || ''}`.toUpperCase();
}

getAvatarClass(name: string): string {
  // Génère un numéro de classe entre 1 et 12 basé sur le nom
  if (!name) return '1';
  const hash = name.split('').reduce((acc, char) => char.charCodeAt(0) + acc, 0);
  return (hash % 12 + 1).toString();
}

  onSearch() {
    this.searchSubject.next(this.searchTerm.trim().toLowerCase());
  }

  filterMessages(searchTerm: string) {
    if (!searchTerm) {
      this.filteredMessages = [...this.messagesRecus];
      return;
    }
  
    this.filteredMessages = this.messagesRecus.filter(msg => {
      // Convertir la date en string pour la recherche
      const dateStr = msg.dateEnvoi ? new Date(msg.dateEnvoi).toLocaleDateString() : '';
      
      // Vérifier tous les champs pertinents
      return (
        (msg.sujet && msg.sujet.toLowerCase().includes(searchTerm)) ||
        (msg.contenu && msg.contenu.toLowerCase().includes(searchTerm)) ||
        (msg.expediteur?.nom && msg.expediteur.nom.toLowerCase().includes(searchTerm)) ||
        (msg.expediteur?.prenom && msg.expediteur.prenom.toLowerCase().includes(searchTerm)) ||
        dateStr.includes(searchTerm)
      );
    });
  }
}