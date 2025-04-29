import { Utilisateur } from "../../utilisateur/model/utilisateur";
import { Message } from "./message";

export interface MessageDto {
    id?: number;
  sujet: string;
  contenu: string;
  expediteur: Utilisateur;
  destinataire: Utilisateur;
  dateEnvoi?: string;
  lu?: boolean;
  messageParent?: Message;
  reponses?: Message[];
  }
  