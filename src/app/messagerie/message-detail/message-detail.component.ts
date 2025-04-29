import { Component, HostListener, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MessageService } from '../service/message.service';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../auth/service/auth.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MessageDto } from '../model/message-dto';
import { Message } from '../model/message';

@Component({
  selector: 'app-message-detail',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './message-detail.component.html',
  styleUrl: './message-detail.component.css',
})

export class MessageDetailComponent implements OnInit {
  thread: MessageDto[] = [];
  userId: number | null = null;
  isImportant: boolean = false;
  isLoading = true;
  reponse: Message = {
    sujet: '',
    contenu: '',
    expediteurId: 0,
    destinataireId: 0,
    messageParentId: 0,
  };
  messageParent: MessageDto | null = null;

  constructor(
    private route: ActivatedRoute,
    private messageService: MessageService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.userId = this.authService.getUserId();
    const messageId = +this.route.snapshot.paramMap.get('messageId')!;
    this.loadThread(messageId);
  }

  loadThread(messageId: number) {
    this.isLoading = true;
    this.messageService.getFilDiscussion(messageId).subscribe({
      next: (res) => {
        this.thread = res || [];
        this.isLoading = false;
        if (this.thread.length > 0) {
          this.markAsRead();
        }
      },
      error: (err) => {
        console.error('Erreur chargement thread:', err);
        this.thread = [];
        this.isLoading = false;
      }
    });
  }

  markAsRead() {
    const unreadMessages = this.thread.filter(m => !m.lu && m.expediteur.id !== this.userId);
    if (unreadMessages.length > 0) {
      // Appeler le service pour chaque message non lu
      unreadMessages.forEach(message => {
        this.messageService.marquerCommeLu(message.id!).subscribe({
          next: () => {
            // Mettre à jour localement le statut "lu"
            const msg = this.thread.find(m => m.id === message.id);
            if (msg) {
              msg.lu = true;
            }
          },
          error: (err) => console.error(`Erreur lors du marquage du message ${message.id} comme lu:`, err)
        });
      });
    }
}

  getUniqueParticipants(): any[] {
    const participants = new Map<number, any>();
    this.thread.forEach(msg => {
      if (!participants.has(msg.expediteur.id)) {
        participants.set(msg.expediteur.id, msg.expediteur);
      }
    });
    return Array.from(participants.values());
  }

  isUserOnline(userId: number): boolean {
    // Implémentez votre logique de présence ici
    return false;
  }

  preparerReponse(message: MessageDto) {
    if (!this.userId) {
      alert('Vous devez être connecté pour répondre');
      return;
    }

    this.messageParent = message;
    this.reponse = {
      sujet: message.sujet.startsWith('Re:') ? message.sujet : `Re: ${message.sujet}`,
      contenu: '',
      expediteurId: this.userId,
      destinataireId: message.expediteur.id,
      messageParentId: message.id!,
    };
  }

  repondre() {
    if (!this.reponse.contenu.trim()) {
      alert('Veuillez écrire un message');
      return;
    }

    this.messageService.repondreMessage(this.reponse).subscribe({
      next: () => {
        this.reponse.contenu = '';
        this.loadThread(this.thread[0].id!);
        this.messageParent = null;
      },
      error: (err) => {
        console.error('Erreur envoi réponse:', err);
        alert('Erreur lors de l\'envoi');
      }
    });
  }

  toggleImportant() {
    this.isImportant = !this.isImportant;
    // Implémentez la logique de marquage important ici
  }

  forwardMessage(message: MessageDto) {
    // Implémentez la fonctionnalité de transfert ici
    console.log('Transférer le message:', message);
  }


  @HostListener('keydown.enter', ['$event'])
  handleEnterKey(event: KeyboardEvent) {
    if (!event.shiftKey) {
      this.repondre();
      event.preventDefault();
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
  
}