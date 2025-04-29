import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Message } from '../model/message';
import { MessageDto } from '../model/message-dto';

@Injectable({ providedIn: 'root' })
export class MessageService {
  private baseUrl = 'http://localhost:9090/messages';

  constructor(private http: HttpClient) {}

  envoyer(message: Message): Observable<Message> {
    console.log("Données envoyées : ", message);
    return this.http.post<Message>(`${this.baseUrl}/envoyer`, message);
  }
  

  getRecus(userId: number): Observable<MessageDto[]> {
    return this.http.get<MessageDto[]>(`${this.baseUrl}/recus/${userId}`);
  }

  getEnvoyes(userId: number): Observable<Message[]> {
    return this.http.get<Message[]>(`${this.baseUrl}/envoyes/${userId}`);
  }

  marquerCommeLu(messageId: number): Observable<any> {
    return this.http.put(`${this.baseUrl}/lu/${messageId}`, {});
  }

  getFilDiscussion(messageId: number): Observable<MessageDto[]> {
    return this.http.get<MessageDto[]>(`${this.baseUrl}/thread/${messageId}`);
  }

  repondreMessage(messageDto: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/repondre`, messageDto);
  }
}
