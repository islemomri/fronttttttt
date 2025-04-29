export interface Message {
    id?: number;
    sujet: string;
    contenu: string;
    expediteurId: number;
    destinataireId: number;
    dateEnvoi?: string;
    lu?: boolean;
    messageParentId?: number;
    reponses?: Message[];
  }