import { Component, Input, OnInit, ViewChild ,NgZone, ChangeDetectorRef, SecurityContext } from '@angular/core';
import { FormationDto } from './model/FormationDto.model';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { TypeFormation } from './model/type-formation.model';
import { SousTypeFormation } from './model/SousTypeFormation.model';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import dayGridPlugin from '@fullcalendar/daygrid'; // Plugin pour la vue mensuelle

import interactionPlugin from '@fullcalendar/interaction'; // Plugin pour les interactions (clic, glisser-déposer)
import timeGridPlugin from '@fullcalendar/timegrid';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { MultiSelectModule } from 'primeng/multiselect';
import { ReactiveFormsModule } from '@angular/forms';  // Importer ReactiveFormsModule
import { EmoloyeService } from '../employe/service/emoloye.service';

import { Utilisateur } from '../utilisateur/model/utilisateur';
import { UtilisateurService } from '../utilisateur/service/utilisateur.service';
import { CommonModule, DatePipe } from '@angular/common';
import { FormationService } from './service/formation.service';
import { Table, TableModule } from 'primeng/table';  // Import de la table PrimeNG
import { CardModule } from 'primeng/card';    // Import de la Card PrimeNG
import { TagModule } from 'primeng/tag';
import { PosteService } from '../poste/service/poste.service';
import { Poste } from '../poste/model/poste';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl, SafeUrl } from '@angular/platform-browser';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { FullCalendarModule } from '@fullcalendar/angular';

import { TabViewModule } from 'primeng/tabview'; 
import { CalendarOptions } from '@fullcalendar/core';
import { FormationPosteService } from './service/FormationPosteService.service';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DirectionService } from '../direction/service/direction.service';
import { RadioButtonModule } from 'primeng/radiobutton';
import { ListboxModule } from 'primeng/listbox';
import { FormationDto_Resultat } from './model/FormationDto_Resultat';
import { InputNumberModule } from 'primeng/inputnumber';
import { PeriodeFormationDto } from './model/PeriodeFormationDto';
import { EnteteService } from './service/EnteteService';
import { Entete } from './model/Entete';
import { MessageModule } from 'primeng/message';
import { ChipModule } from 'primeng/chip';
interface FormationPosteId {
  formationId: number;
  posteId: number;
}

@Component({

  selector: 'app-formation',
  imports: [CalendarModule,
    DropdownModule,
    InputTextModule,
    DialogModule,
    ButtonModule,
    ChipModule,
    FullCalendarModule,
    MultiSelectModule,
     ReactiveFormsModule,
     MessageModule,
    CommonModule,
    TableModule,
    CardModule,
    TagModule,
    FormsModule,
    ToastModule,
    TabViewModule,
    CalendarModule,
    ConfirmDialogModule,
    RadioButtonModule,
    ListboxModule,
    InputNumberModule
  ],
  providers: [MessageService,ConfirmationService,DatePipe],
  templateUrl: './formation.component.html',
  styleUrl: './formation.component.css'
}) 
export class FormationComponent implements OnInit{
  employes: any[] = [];  // Liste des employés
  cities: any[] = [];  // Liste des employés pour le multiselect
  formationForm: FormGroup;
  dialogVisible: boolean = false; 
  dialogVisibleModif: boolean = false; 
  responsables: Utilisateur[] = [];
  selectedResponsableType: string = '';
  typeFormations = Object.values(TypeFormation); // ['INTERNE', 'EXTERNE']
  sousTypeFormations = Object.values(SousTypeFormation); // ['INTEGRATION', 'POLYVALENCE', ...]
  static formationPosteList: { formationId: number, posteId: number }[] = [];
  formations: FormationDto[] = [];
  displayEventDialog: boolean = false;
  selectedEvent: any = null;
  posteSelectionne: Poste | null = null;
  selectedFormation: any;
  displayDialog: boolean = false;
  globalFilter: string = '';
  postes: Poste[] = [];  
  selectedPoste: Poste | null = null; 
  safeDocumentUrl: SafeUrl | null = null;
  displayPdfDialog: boolean = false;
  pdfUrl: SafeResourceUrl | null = null;
  pdfUrls: { [key: string]: SafeResourceUrl } = {};
  displayModificationDialog: boolean = false;
  modificationForm: FormGroup;
  selectedFile: File | null = null;
  formationsIntegration: any[] = [];
  formationsPolyvalence: any[] = [];
  formationsCompletes: any[] = [];
  formationsIntegrationAnnulees: FormationDto[] = [];
  formationsPolyvalenceValidees: FormationDto[] = [];
  formationsPolyvalenceEnAttente: FormationDto[] = [];
  formationsIntegrationValidees: FormationDto[] = [];
  formationsIntegrationEnAttente: FormationDto[] = [];
  formationsIntegrationACorriger  : FormationDto[] = [];
  formationsPolyvalenceACorriger : FormationDto[] = [];
  formationsPolyvalenceAnnulees : FormationDto[] = [];
  filterTextNonValidees: string = '';
  selectedPosteId!:number;
  filterTextValidees: string = '';
  displayComplementaryProgramDialog: boolean = false;
complementaryProgramForm: FormGroup;
selectedEmployeeForComplementary: any = null;
displayPosteAssignmentDialog: boolean = false;
selectedEmploye: any = null;
selectedDirection: any = null;
selectedSite: any = null;
directions: any[] = [];
sites: any[] = [];
selectedRadio: { [key: string]: string } = {};
selectedEmployees: any[] = [];
employeeTempResults: { [key: number]: string } = {};
selectedEmployes: any[] = [];

  resultatOptions = [
    { label: 'Réussi', value: 'REUSSI' },
    { label: 'Échec', value: 'ECHEC' },
    { label: 'Programme Complémentaire', value: 'PROGRAMME_COMPLEMENTAIRE' },
  ];
  resultatOptionss = [
    { label: 'Réussi', value: 'REUSSI' },
    { label: 'Échec', value: 'ECHEC' }
   
  ];
  loading: boolean = false;
  @ViewChild('tableNonValidees') tableNonValidees!: Table;
  @ViewChild('tableValidees') tableValidees!: Table;
  displayCalendarDialog: boolean = false;
  calendarEvents: any[] = [];
  selectedDate: Date = new Date();
  modalData: { action: string; event: any } | null = null;
  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    initialView: 'dayGridMonth',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay'
    },
    events: [],
    eventClick: this.handleEventClick.bind(this),
    eventDisplay: 'block', // Assure un bon affichage
    height: 'auto' // Ajuste la hauteur automatiquement
  };

formationWithComment: any = null;
commentaire: string = '';
constructor(private fb: FormBuilder, 
  private changeDetectorRef: ChangeDetectorRef,
  private directionservice: DirectionService,
  private formationPosteService: FormationPosteService,
  private confirmationService: ConfirmationService,
  private ngZone: NgZone,
  
  private enteteService: EnteteService,
  private messageService: MessageService,
  private employeService: EmoloyeService,
  private utilisateurService: UtilisateurService,
  private formationservice : FormationService,
  private posteService : PosteService,
   private sanitizer: DomSanitizer) {
  this.formationForm = this.fb.group({
    titre: ['', Validators.required],
    description: ['', Validators.required],
    typeFormation: [null, Validators.required],
    sousTypeFormation: [null, Validators.required],
    dateDebutPrevue: [null, Validators.required],
    dateFinPrevue: [null, { validators: [Validators.required, this.validateDateFin.bind(this)], updateOn: 'change' }],
    responsableEvaluationId: [null, Validators.required],
    responsableEvaluationExterne: [''],
    titrePoste: [null],
    enteteId: [null, Validators.required], 
    reference: [''],
    revisionNumber: [null],
    dateApplication: [null],
    
    selectedCities: [[], Validators.required],
  });

  this.complementaryProgramForm = this.fb.group({
    titre: ['', Validators.required],
    description: ['', Validators.required],
    typeFormation: [null, Validators.required],
    sousTypeFormation: [null, Validators.required],
    dateDebutPrevue: [null, Validators.required],
    dateFinPrevue: [null, Validators.required],
    responsableEvaluationId: [null],
    responsableEvaluationExterne: [''],
    employeIds: [[]],
    titrePoste: [null], // Doit pouvoir accepter un objet Poste complet
    fichierPdf: [null]
    
  });




  this.modificationForm = this.fb.group({
    titre: ['', Validators.required],
    description: ['', Validators.required],
    typeFormation: ['', Validators.required],
    sousTypeFormation: ['', Validators.required],
    dateDebutPrevue: ['', Validators.required],
    dateFinPrevue: [null, { validators: [Validators.required, this.validateDateFin.bind(this)], updateOn: 'change' }],
    responsableEvaluationId: [null],
    responsableEvaluationExterne: [''],
    employeIds: [[]],
    titrePoste: ['',],
    fichierPdf: [null] ,// Ajouter un contrôle pour le fichier PDF
    selectedCitiesModif: [[]],
    responsableType: [null],
    entete: [null, Validators.required ],
    reference: [''],
    revisionNumber: [null],
    dateApplication: [null],
    
    // Contrôles dynamiques pour les parties
    ...this.createPartieControls()
  });
  this.formationForm.valueChanges.subscribe(() => {
    this.validateDatesmodif();
  });



}

createPartieControls(): { [key: string]: AbstractControl } {
  const controls: { [key: string]: AbstractControl } = {};
  
  for (let i = 0; i < this.nombrePartiesArray.length; i++) {
    controls[`dateDebutPartie${i}`] = new FormControl('', Validators.required);
    controls[`dateFinPartie${i}`] = new FormControl('', Validators.required);
    controls[`formateurPartie${i}`] = new FormControl('', Validators.required);
    controls[`programmePartie${i}`] = new FormControl('', Validators.required);
  }
  
  return controls;
}
shouldShowEnteteSection(): boolean {
  const sousType = this.formationForm.get('sousTypeFormation')?.value;
  return sousType === 'POLYVALENCE' || sousType === 'INTEGRATION';
}
// Dans votre composant.ts
// Ajoutez cette méthode pour générer un commentaire pré-rempli
showCommentField(formation: any) {
  this.formationWithComment = formation;
  
  // Génère un template de commentaire avec les employés
  let employeesList = '';
  if (formation.employes && formation.employes.length > 0) {
    employeesList = formation.employes.map((emp: any) => 
      `- ${emp.matricule} ${emp.nom} ${emp.prenom} : [Décrire le problème]`
    ).join('\n');
  }
  
  this.commentaire = `Problème de validation pour la formation ${formation.titre} :
${employeesList}

[Observations complémentaires]`;
}

cancelComment() {
  this.formationWithComment = null;
  this.commentaire = '';
}

submitComment() {
  if (this.formationWithComment && this.commentaire.trim()) {
    this.formationservice.signalerProbleme(this.formationWithComment.id, this.commentaire)
      .subscribe({
        next: () => {
          this.messageService.add({severity: 'success', summary: 'Succès', detail: 'Problème signalé avec succès'});
          this.loadFormations();
          
          this.formationWithComment = null;
          this.commentaire = '';
        },
        error: (err) => {
          this.messageService.add({severity: 'error', summary: 'Erreur', detail: 'Erreur lors du signalement du problème'});
          console.error(err);
        }
      });
  }
}
editComment(formation: FormationDto) {
  this.formationWithComment = formation;
  this.commentaire = formation.commentaire || ''; // Charger le commentaire existant
}





  handleEventClick(info: any): void {
    this.selectedEvent = {
      title: info.event.title,
      start: info.event.start,
      end: info.event.end,
    };
    this.displayEventDialog = true; // Afficher le dialogue
  }
  openCalendarDialog() {
    this.displayCalendarDialog = true;
    this.loadCalendarEvents();
  }





  private transformToFormationDtocalendrier(data: any): FormationDto {
    return {
      id: data.id,
      titre: data.titre,
      commentaire: data.commentaire,
      description: data.description,
      typeFormation: data.typeFormation,
      sousTypeFormation: data.sousTypeFormation,
      dateDebutPrevue: this.ensureISODateString(data.dateDebutPrevue),
      dateFinPrevue: this.ensureISODateString(data.dateFinPrevue),
      responsableEvaluationId: data.responsableEvaluationId || null,
      responsableEvaluationExterne: data.responsableEvaluationExterne || null,
      employeIds: data.employeIds || [],
      responsableEvaluation: data.responsableEvaluation || null,
      employes: data.employes || [],
      fichierPdf: data.fichierPdf || null,
      organisateurId: data.organisateurId,
      titrePoste: data.titrePoste || null,
      valide: data.valide || false
    };
  }
  
  private ensureISODateString(dateInput: any): string {
    if (!dateInput) return new Date().toISOString(); // Valeur par défaut si null
    
    // Si c'est déjà une string ISO valide
    if (typeof dateInput === 'string' && this.isValidISODate(dateInput)) {
      return dateInput;
    }
    
    // Convertir en Date
    const date = this.convertToDate(dateInput);
    return date ? date.toISOString() : new Date().toISOString();
  }
  
  private convertToDate(dateInput: any): Date | null {
    if (!dateInput) return null;
    
    // Si c'est déjà une Date valide
    if (dateInput instanceof Date && !isNaN(dateInput.getTime())) {
      return dateInput;
    }
    
    // Si c'est un timestamp (nombre)
    if (typeof dateInput === 'number') {
      return new Date(dateInput);
    }
    
    // Si c'est une string
    if (typeof dateInput === 'string') {
      // Essayez le parsing direct
      const date = new Date(dateInput);
      if (!isNaN(date.getTime())) return date;
      
      // Formats spécifiques
      // Format "YYYY-MM-DD"
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
        return new Date(dateInput + 'T00:00:00');
      }
      
      // Format "DD/MM/YYYY"
      if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateInput)) {
        const [d, m, y] = dateInput.split('/');
        return new Date(`${y}-${m}-${d}`);
      }
    }
    
    console.warn(`Format de date non supporté:`, dateInput);
    return null;
  }
  
  private isValidISODate(dateString: string): boolean {
    return /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})?)?$/.test(dateString);
  }
  
  private updateCalendar(): void {
    this.calendarOptions = {
      ...this.calendarOptions,
      events: [...this.calendarEvents]
    };
    
    // Si vous utilisez ViewChild pour accéder au calendrier
  
  }
  
  loadCalendarEvents(): void {
    const rhId = localStorage.getItem('RHID');
    if (!rhId) {
      console.error("Impossible de récupérer l'ID du RH !");
      return;
    }

    this.formationservice.getFormationsParRH(Number(rhId)).subscribe({
      next: (data) => {
        this.calendarEvents = data
          .map((formation: any) => {
            const transformed = this.transformToFormationDtocalendrier(formation);
            
            // Palette professionnelle raffinée
            const eventStyle = transformed.valide 
              ? { // Événement confirmé - Thème bleu professionnel
                  bgColor: '#e8f4fc', // Bleu très clair
                  borderColor: '#4a89dc', // Bleu vif mais professionnel
                  textColor: '#2c3e50', // Noir bleuté pour le texte
                  dotColor: '#4a89dc' // Bleu cohérent avec la bordure
                }
              : {
                bgColor: '#fff7ed',  // Orange ultra clair (fond crème)
                borderColor: '#f97316', // Orange vif mais contrôlé
                textColor: '#9a3412', // Brun-orange foncé (meilleure lisibilité)
                dotColor: '#f97316'   // Cohérence avec la bordure
              };

            return {
              title: transformed.titre,
              start: transformed.dateDebutPrevue,
              end: transformed.dateFinPrevue,
              color: eventStyle.bgColor,
              textColor: eventStyle.textColor,
              borderColor: eventStyle.borderColor,
              className: transformed.valide ? 'event-confirmed' : 'event-tentative',
              extendedProps: {
                description: transformed.description,
                type: transformed.typeFormation,
                valide: transformed.valide
              }
            };
          })
          .filter(event => event !== null);

        this.updateCalendar();
      },
      error: (error) => {
        console.error('Erreur:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Erreur lors du chargement du calendrier'
        });
      }
    });
}
  applyFilterNonValidees() {
    this.loading = true;
    setTimeout(() => {
      this.tableNonValidees.filterGlobal(this.filterTextNonValidees, 'contains');
      this.loading = false;
    }, 300);
  }

  resetFilterNonValidees() {
    this.filterTextNonValidees = '';
    this.tableNonValidees.filterGlobal('', 'contains');
  }

  applyFilterValidees() {
    this.loading = true;
    setTimeout(() => {
      this.tableValidees.filterGlobal(this.filterTextValidees, 'contains');
      this.loading = false;
    }, 300);
  }

  resetFilterValidees() {
    this.filterTextValidees = '';
    this.tableValidees.filterGlobal('', 'contains');
  }
 

  validateDateFin(control: AbstractControl): ValidationErrors | null {
    const dateFin = control.value;
    const dateDebut = this.formationForm?.get('dateDebutPrevue')?.value;
  
    if (!dateFin) {
      return { required: true }; // La date de fin est obligatoire
    }
  
    if (dateDebut && new Date(dateFin) < new Date(dateDebut)) {
      return { dateInvalide: true }; // La date de fin doit être après la date de début
    }
  
    return null; // La validation est réussie
  }
  validateDates(form: FormGroup) {
    const dateDebut = form.get('dateDebutPrevue')?.value;
    const dateFin = form.get('dateFinPrevue')?.value;
  
    if (dateDebut && dateFin && new Date(dateDebut) > new Date(dateFin)) {
      form.get('dateFinPrevue')?.setErrors({ dateInvalide: true });
    } else {
      form.get('dateFinPrevue')?.setErrors(null);
    }
  }
  validateDatesmodif(): void {
    const dateDebut = this.modificationForm.get('dateDebutPrevue')?.value;
    const dateFin = this.modificationForm.get('dateFinPrevue')?.value;
  
    if (dateDebut && dateFin && new Date(dateFin) < new Date(dateDebut)) {
      this.modificationForm.get('dateFinPrevue')?.setErrors({ dateInvalide: true });
    } else {
      this.modificationForm.get('dateFinPrevue')?.setErrors(null);
    }
  }
  entetes: Entete[] = [];
  showEntete = false;
  showEnteteField(): boolean {
    const sousType = this.formationForm.get('sousTypeFormation')?.value;
    return sousType === 'POLYVALENCE' || sousType === 'INTEGRATION';
  }
  
  ngOnInit(): void {
    
    this.setupTypeListener();
    this.loadEntetes();
    this.formationForm.get('nombreParties')?.valueChanges.subscribe((value) => {
      this.updateDateFields();
      
      // Initialiser le tableau basé sur la valeur actuelle
      const currentValue = value || 0;
      this.nombrePartiesArray = Array(currentValue).fill(0).map((_, i) => i);
    });
    const initialValue = this.formationForm.get('nombreParties')?.value || 0;
    this.nombrePartiesArray = Array(initialValue).fill(0).map((_, i) => i);
    
    this.loadFormations(); 
    this.displayFormationPosteList();
    const rhId = localStorage.getItem('RHID'); // Pas 'RHIDD' ni 'RHIDDDDDDDDD'
  
    if (!rhId) {
      console.error("Aucun ID RH trouvé. Vérifiez :");
      console.log("Contenu actuel du localStorage:", localStorage);
     // Redirigez si l'ID est manquant
      return;
    }
    
    console.log('RHID:', rhId); // Log propre sans 'D' supplémentaires
    // ... reste du code
  
  this.formationForm = this.fb.group({
    titre: ['', Validators.required],
    description: ['', Validators.required],
    typeFormation: [null, Validators.required],
    sousTypeFormation: [null, Validators.required],
    dateDebutPrevue: [null, Validators.required],
    dateFinPrevue: [null, Validators.required],
    responsableEvaluationId: [null, Validators.required],
    responsableEvaluationExterne: [''],
    selectedCities: [[], Validators.required],
   
    titrePoste: [null],
   
    enteteId: [null, Validators.required], 
    reference: [''],
    revisionNumber: [null],
    dateApplication: [null],
    responsableType: [null, Validators.required], 
  });


  
  this.formationForm.get('typeFormation')?.enable();
  this.formationForm.get('responsableType')?.enable();
  this.formationForm.valueChanges.subscribe(() => {
    this.validateDates(this.formationForm);
  });

  this.utilisateurService.getResponsables().subscribe(
    (data) => {
      console.log(data); 
      this.responsables = data;
    },
    (error) => {
      console.error('Erreur lors de la récupération des responsables', error);
    }
  );


  // Récupérer la liste des employés
  this.employeService.getEmployesWithDirectionAndSite().subscribe((data) => {
    this.employes = data;
    this.cities = this.employes.map((employe) => ({
      name: `${employe.nom} ${employe.prenom}`,  // Nom complet
      matricule: employe.matricule,  // Matricule de l'employé
      code: employe.id  // ID de l'employé (qui peut être utilisé pour l'identification)
    }));
    
  });


  this.posteService.getAllPostesnonArchives().subscribe(
    (data) => {
      this.postes = data;
    },
    (error) => {
      console.error('Erreur lors de la récupération des postes', error);
    }
  );
  this.formationForm.get('selectedCities')?.valueChanges.subscribe(selectedCodes => {
    this.selectedEmployees = this.cities.filter(emp => selectedCodes.includes(emp.code));
  });
  }
  private setupTypeListener() {
    this.formationForm.get('sousTypeFormation')?.valueChanges.subscribe(sousType => {
      if (this.shouldShowEnteteSection()) {
        this.loadEntetes(); // Recharger si nécessaire
      }
      this.showEntete = sousType === 'POLYVALENCE' || sousType === 'INTEGRATION';
      
      const enteteControl = this.formationForm.get('enteteId');
      if (this.showEntete) {
        enteteControl?.enable();
      } else {
        enteteControl?.disable();
        enteteControl?.setValue(null);
      }
    });
  }
  
  private loadEntetes() {
    this.enteteService.getAllEntetes().subscribe({
      next: (entetes) => this.entetes = entetes,
      error: (err) => {
        console.error('Erreur:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Impossible de charger les entêtes'
        });
      }
    });
  }
  validateDateRange(debutControlName: string, finControlName: string): ValidatorFn {
    return (formGroup: AbstractControl): ValidationErrors | null => {
      const debut = formGroup.get(debutControlName)?.value;
      const fin = formGroup.get(finControlName)?.value;
  
      if (debut && fin && new Date(fin) < new Date(debut)) {
        return { dateRangeInvalid: true };
      }
      return null;
    };
  }
  getProgrammesForPartie(): string[] {
    return this.posteSelectionne?.lesProgrammesDeFormation || [];
  }
  onPosteSelect(event: any) {
    const selectedPoste = event.value;
     this.selectedPosteId = event.value.id; 
    console.log('ID du poste sélectionné :', this.selectedPosteId);
    if (selectedPoste && selectedPoste.document) {
      // Récupérer le contenu Base64 du PDF
      const base64Data = selectedPoste.document;
      this.initialiserParties();
      // Convertir le Base64 en un Blob (fichier binaire)
      const byteCharacters = atob(base64Data); // Décoder Base64
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const fileBlob = new Blob([byteArray], { type: 'application/pdf' });
  
      // Créer une URL Blob pour afficher dans l'iframe
      const pdfUrl = URL.createObjectURL(fileBlob);
  
      // Mettre à jour l'iframe
      const pdfViewer = document.getElementById('pdfViewer') as HTMLIFrameElement;
      if (pdfViewer) {
        pdfViewer.src = pdfUrl;
      }
  
      console.log('PDF chargé depuis Base64 et affiché dans iframe');
    } else {
      console.warn('Aucun document trouvé pour ce poste.');
    }
  }
  

  showParticipants(formation: any) {
    if (formation && formation.employes) {
      this.selectedFormation = formation;
      this.displayDialog = true;
  
      if (formation.valide) {
        this.pdfUrls = {};
        formation.employes.forEach((employe: any) => {
          // Récupérer le document PDF pour l'employé
          this.employeService.getDocumentByEmployeIdAndFormationId(employe.id, formation.id).subscribe({
            next: (response: Blob) => {
              const fileURL = URL.createObjectURL(new Blob([response], { type: 'application/pdf' }));
              this.pdfUrls[employe.id] = this.sanitizer.bypassSecurityTrustResourceUrl(fileURL);
            },
            error: (err) => {
              console.error(`Erreur lors de la récupération du document pour employé ${employe.id} et formation ${formation.id}:`, err);
              this.messageService.add({
                severity: 'error',
                summary: 'Erreur',
                detail: `Document introuvable pour employé ${employe.id}`
              });
            }
          });
  
          // Récupérer le résultat de l'employé pour cette formation
          this.formationservice.getResultatFormation(formation.id, employe.id).subscribe({
            next: (result) => {
              // Ajouter le résultat à l'objet employé
              employe.resultat = result.resultat;
              employe.res = result.res; // Si vous avez besoin de cette propriété
            },
            error: (err) => {
              console.error(`Erreur lors de la récupération du résultat pour employé ${employe.id} et formation ${formation.id}:`, err);
              employe.resultat = 'Aucun résultat disponible'; // Valeur par défaut en cas d'erreur
            }
          });
        });
      }
    } else {
      console.error('Aucun employé trouvé pour cette formation');
    }
  }
  openPdfDialog(pdfUrl: SafeUrl) {
    this.pdfUrl = pdfUrl;
    this.displayPdfDialog = true;
  }

  hidePdfDialog() {
    this.displayPdfDialog = false;
    this.pdfUrl = null;
  }

  // Fermer le dialogue
  hideDialog() {
    this.displayDialog = false;
  }
  
  // Méthode pour ouvrir la popup de modification
  openModificationDialog(formation: any) {
    this.loadEntetes();
    this.selectedResponsableTypeModif = (formation.sousTypeFormation === 'INTEGRATION' || formation.sousTypeFormation === 'POLYVALENCE')
    ? 'INTERNE'
    : formation.responsableEvaluationId ? 'INTERNE' : 'EXTERNE';

    this.selectedFormation = formation;
    this.initializePeriodesModif(formation);
    this.displayModificationDialog = true;
    this.periodesModif = formation.periodes ? formation.periodes.map((periode: any) => ({
      ...periode,
      dateDebut: new Date(periode.dateDebut),
      dateFin: new Date(periode.dateFin)
  })) : [];
  
    if (formation.sousTypeFormation === 'POLYCOMPETENCE') {
      this.modificationForm.get('sousTypeFormation')?.disable();
  } else {
      this.modificationForm.get('sousTypeFormation')?.enable();
  }
    // Récupérer les IDs des employés de la formation (pour TOUS les types de formation)
    const employeIds = formation.employes.map((emp: any) => emp.id);
   
    // Pré-sélectionner les employés dans le formControl (pour TOUS les types de formation)
    this.modificationForm.patchValue({
        selectedCitiesModif: employeIds
    });

    // Initialiser la liste des employés sélectionnés (pour TOUS les types de formation)
    this.selectedEmployeesModif = this.cities
        .filter(city => employeIds.includes(city.code))
        .map(city => ({
            ...city,
            name: city.name || `${city.nom} ${city.prenom}`
        }));

    // Traitement spécifique à POLYCOMPETENCE
    if (formation.sousTypeFormation === 'POLYCOMPETENCE') {
        this.selectedRadioModif = {};
        
        // Charger les résultats existants
        formation.employes.forEach((emp: any) => {
            this.formationservice.getResultatFormation(formation.id, emp.id).subscribe({
                next: (result) => {
                    this.selectedRadioModif[emp.id] = result.resultat;
                    this.changeDetectorRef.detectChanges();
                },
                error: (err) => {
                    console.error('Erreur récupération résultat', err);
                    this.selectedRadioModif[emp.id] = '';
                }
            });
        });
    }
// Initialiser le type de responsable
this.selectedResponsableTypeModif = formation.responsableEvaluationId ? 'INTERNE' : 'EXTERNE';
    // Trouver le poste actuel
    const currentPoste = this.postes.find(poste => poste.titre === formation.titrePoste);
    this.selectedResponsableTypeModif = formation.responsableEvaluationId ? 'INTERNE' : 'EXTERNE';
    const currentEntete = this.entetes.find(e => e.id === formation.entete.id);
    // Remplir le formulaire
    this.modificationForm.patchValue({
        titre: formation.titre,
        description: formation.description,
        typeFormation: formation.typeFormation,
        sousTypeFormation: formation.sousTypeFormation,
        dateDebutPrevue: new Date(formation.dateDebutPrevue),
        dateFinPrevue: new Date(formation.dateFinPrevue),
        responsableType: this.selectedResponsableTypeModif,  // <-- Ajoutez cette ligne
        responsableEvaluationId: formation.responsableEvaluation?.id || null,
        responsableEvaluationExterne: formation.responsableEvaluationExterne || '',
        employeIds: employeIds,
        titrePoste: currentPoste,
        reference: formation.reference || '',
        revisionNumber: formation.revisionNumber || '',
        dateApplication: new Date(formation.dateApplication),
        entete: currentEntete, 
        // Note: selectedCitiesModif est déjà défini plus haut
    });
   
    if (formation.sousTypeFormation === 'INTEGRATION' || formation.sousTypeFormation === 'POLYVALENCE') {




      
      this.modificationForm.get('typeFormation')?.disable();
      this.modificationForm.get('responsableType')?.disable();
      this.modificationForm.get('responsableType')?.setValue('INTERNE'); // <-- Sécurité supplémentaire
  } else {
      this.modificationForm.get('typeFormation')?.enable();
      this.modificationForm.get('responsableType')?.enable();
  }
    this.changeDetectorRef.detectChanges(); 
    
  
    // Afficher le PDF du poste
    if (currentPoste && currentPoste.document) {
        this.loadPdfIntoIframe(currentPoste.document);
    } else {
        this.pdfUrl = null;
    }
}


shouldShowEnteteSectionModif(): boolean {
  return this.modificationForm.get('sousTypeFormation')?.value === 'INTEGRATION' || 
         this.modificationForm.get('sousTypeFormation')?.value === 'POLYVALENCE';
}
// Ajoutez cette méthode pour filtrer les options de sous-type
getFilteredSousTypes(): any[] {
  const currentSousType = this.modificationForm.get('sousTypeFormation')?.value;
  const typeFormation = this.modificationForm.get('typeFormation')?.value;
  
  // Si POLYCOMPETENCE est déjà sélectionné, on l'inclut quand même (mais disabled)
  if (currentSousType === 'POLYCOMPETENCE') {
    return this.sousTypeFormations;
  }
  
  // Pour INTEGRATION/POLYVALENCE, on exclut POLYCOMPETENCE
  if (typeFormation === 'INTERNE') {
    return this.sousTypeFormations.filter(option => 
      option !== 'POLYCOMPETENCE'
    );
  }
  
  return this.sousTypeFormations;
}
  loadPdfIntoIframe(file: File | string) {
    if (file) {
      let pdfUrl: string;
  
      if (typeof file === 'string') {
        // Si le fichier est en Base64
        const byteCharacters = atob(file);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const fileBlob = new Blob([byteArray], { type: 'application/pdf' });
        pdfUrl = URL.createObjectURL(fileBlob);
      } else {
        // Si le fichier est de type File
        pdfUrl = URL.createObjectURL(file);
      }
  
      // Créer une URL sécurisée pour l'iframe
      this.pdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(pdfUrl);
      




    } else {
      this.pdfUrl = null; // Réinitialiser l'iframe si aucun document n'est disponible
    }
  }
  onPosteSelectModification(event: any) {
    const selectedPoste = event.value; // Récupérer le poste sélectionné
  
    if (selectedPoste && selectedPoste.document) {
      // Charger le PDF du poste sélectionné dans l'iframe
      this.loadPdfIntoIframe(selectedPoste.document);
    } else {
      this.pdfUrl = null; // Réinitialiser l'iframe si aucun document n'est disponible
    }
    if (this.isPolyOrIntegrationModif()) {
      this.updatePeriodesForPoste(selectedPoste);
    }
  }
  private updatePeriodesForPoste(poste: any) {
    if (poste?.lesProgrammesDeFormation?.length) {
      // Garder les périodes existantes ou en créer de nouvelles
      if (this.periodesModif.length > 0) {
        // Mettre à jour les programmes disponibles
        this.periodesModif.forEach(periode => {
          if (!poste.lesProgrammesDeFormation.includes(periode.programme)) {
            periode.programme = poste.lesProgrammesDeFormation[0];
          }
        });
      } else {
        // Créer de nouvelles périodes
        this.periodesModif = poste.lesProgrammesDeFormation.map((programme: string) => ({
          dateDebut: new Date(),
          dateFin: new Date(),
          formateur: '',
          programme: programme
        }));
      }
    }
  }
onFileChange(event: any) {
  const file = event.target.files[0];
  if (file) {
    this.selectedFile = file;
    this.modificationForm.get('fichierPdf')?.setValue(file);

    // Mettre à jour l'iframe avec le nouveau fichier PDF
    const fileURL = URL.createObjectURL(file);
    this.pdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(fileURL);
  }
}
showPreviewModification() {
  if (this.modificationForm.invalid) {
    this.messageService.add({
      severity: 'error',
      summary: 'Erreur',
      detail: 'Veuillez remplir tous les champs requis avant de prévisualiser.'
    });
    return;
  }

  const formValues = this.modificationForm.getRawValue();
  const periodes: PeriodeFormationDto[] = this.periodesModif
    .filter(p => p.dateDebut && p.dateFin && p.formateur && p.programme)
    .map(p => ({
      dateDebut: this.formatDate(p.dateDebut),
      dateFin: this.formatDate(p.dateFin),
      formateur: p.formateur,
      programme: p.programme
    }));

  // Initialiser un poste vide pour éviter des erreurs si le poste est manquant
  const defaultPoste = {
    lesProgrammesDeFormation: [],
    titre: formValues.titrePoste?.titre || 'Poste non spécifié'
  };

  const posteId = formValues.titrePoste?.id;

  // Vérifier si un poste est sélectionné
  if (posteId) {
    this.posteService.getPosteById(posteId).subscribe({
      next: (poste) => {
        this.preparePreviewData(formValues, periodes, poste || defaultPoste);
      },
      error: (err) => {
        console.error('Erreur lors de la récupération du poste:', err);
        this.preparePreviewData(formValues, periodes, defaultPoste);
      }
    });
  } else {
    // Si aucun poste n'est sélectionné, afficher la prévisualisation avec un poste par défaut
    this.preparePreviewData(formValues, periodes, defaultPoste);
  }
}
closeModificationDialog() {
  this.displayModificationDialog = false;
  this.modificationForm.reset();
  this.selectedFile = null;
  this.pdfUrl = null;
}
submitFormation() {
  if (this.formationForm.invalid) {
    this.messageService.add({
      severity: 'error',
      summary: 'Erreur',
      detail: 'Veuillez remplir tous les champs pour créer une formation.'
    });

    Object.keys(this.formationForm.controls).forEach(key => {
      const control = this.formationForm.get(key);
      if (control?.invalid) {
        console.error(`Champ ${key} invalide:`, control.errors);
      }
    });
    return;
  }

  if (this.formationForm.valid) {
    const formValues = this.formationForm.getRawValue();
    const rhId = Number(localStorage.getItem('RHID'));
    const periodes: PeriodeFormationDto[] = [];
  
    for (let i = 0; i < this.nombrePartiesArray.length; i++) {
      const dateDebutControl = this.formationForm.get(`dateDebutPartie${i}`);
      const dateFinControl = this.formationForm.get(`dateFinPartie${i}`);
      const formateurControl = this.formationForm.get(`formateurPartie${i}`);
      const programmeControl = this.formationForm.get(`programmePartie${i}`);
      
      if (dateDebutControl?.value && dateFinControl?.value && formateurControl?.value && programmeControl?.value) {
        periodes.push({
          dateDebut: this.formatDate(new Date(dateDebutControl.value)),
          dateFin: this.formatDate(new Date(dateFinControl.value)),
          formateur: formateurControl.value.trim(),
          programme: programmeControl.value // Récupère le texte du programme sélectionné
        });
      }
    }
  
    console.log('Periodes:', periodes);
    // Afficher l'objet complet dans la console avant envoi
    console.log('Objet formation avant envoi:', {
      ...formValues,
      periodes: periodes,
      rhId: rhId
    });
    // Si c'est une formation de polycompétences
    if (this.isPolycompetence()) {
      // Vérifier qu'on a bien des résultats pour chaque employé
      if (!this.selectedRadio || Object.keys(this.selectedRadio).length === 0) {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Veuillez sélectionner un résultat pour chaque employé.'
        });
        return;
      }
    
      // Créer l'objet avec toutes les propriétés dès le départ
      const formationDto: FormationDto_Resultat = {
        titre: formValues.titre,
        description: formValues.description,
        typeFormation: formValues.typeFormation,
        sousTypeFormation: formValues.sousTypeFormation,
        dateDebutPrevue: this.formatDate(formValues.dateDebutPrevue),
        dateFinPrevue: this.formatDate(formValues.dateFinPrevue),
        employes: formValues.selectedCities.map((employeId: number) => ({
          employeId: employeId,
          resultat: this.selectedRadio[employeId]
        })),
        // Initialiser les propriétés optionnelles
        responsableEvaluationId: undefined,
        responsableEvaluationExterne: undefined
      };
    
      // Affecter le responsable selon le type
      if (this.selectedResponsableType === 'INTERNE') {
        formationDto.responsableEvaluationId = formValues.responsableEvaluationId;
        formationDto.responsableEvaluationExterne = undefined;
      } else {
        formationDto.responsableEvaluationExterne = formValues.responsableEvaluationExterne;
        formationDto.responsableEvaluationId = undefined;
      }
    
     
      console.log('Données envoyées:', formationDto);
      
      // Appel du service
      this.formationservice.creerFormationAvecResultat(formationDto, rhId).subscribe({
     
      });
      this.closeDialog();
      this.loadFormations();
    } else {
      // Logique existante pour les autres types de formation
      const formData = new FormData();

      formData.append('titre', formValues.titre);
      formData.append('description', formValues.description);
      formData.append('typeFormation', formValues.typeFormation);
      formData.append('sousTypeFormation', formValues.sousTypeFormation);
      formData.append('dateDebutPrevue', formValues.dateDebutPrevue.toISOString().split('T')[0]);
      formData.append('dateFinPrevue', formValues.dateFinPrevue.toISOString().split('T')[0]);
    
    formData.append('revisionNumber', formValues.revisionNumber);
    formData.append('reference', formValues.reference);
    formData.append('dateApplication', formValues.dateApplication.toISOString().split('T')[0]);
    formData.append('enteteId', formValues.enteteId.id.toString());


      if (formValues.responsableEvaluationId) {
        formData.append('responsableEvaluationId', formValues.responsableEvaluationId.toString());
      }
      if (formValues.responsableEvaluationExterne) {
        formData.append('responsableEvaluationExterne', formValues.responsableEvaluationExterne);
      }
 if (periodes.length > 0) {
      formData.append('periodes', JSON.stringify(periodes));
    }
      formData.append('organisateurId', rhId.toString());
      formData.append('titrePoste', formValues.titrePoste.titre);

      formValues.selectedCities.forEach((id: number) => {
        formData.append('employeIds', id.toString());
      });

      if (formValues.titrePoste.document) {
        if (typeof formValues.titrePoste.document === 'string' && formValues.titrePoste.document.startsWith('JVBERi0')) {
          const pdfFile = this.base64ToFile(formValues.titrePoste.document, 'document.pdf');
          formData.append('fichierPdf', pdfFile);
        } else if (formValues.titrePoste.document instanceof File) {
          formData.append('fichierPdf', formValues.titrePoste.document);
        }
      }

      this.formationservice.creerFormation(formData).subscribe({
        next: (formationId) => {
          console.log('Formation ajoutée avec succès', formationId);

          if (this.posteSelectionne && this.posteSelectionne.id !== undefined) {
            this.formationPosteService.addPair(formationId, this.posteSelectionne.id).subscribe({
              next: () => {
                console.log('Paire formationId et posteId ajoutée avec succès');
                this.displayFormationPosteList();
              },
              error: (error) => {
                console.error('Erreur lors de l\'ajout de la paire', error);
              },
            });
          } else {
            console.error('Données manquantes :', { posteSelectionne: this.posteSelectionne });
          }

          this.displayFormationPosteList();
          this.closeDialog();
          this.loadFormations();
        },
        error: (error) => {
          console.error('Erreur lors de l\'ajout de la formation', error);
        }
      });
    }
  }
}
// Add this to your component class
previewDialogVisible: boolean = false;
previewData: any = {};

showPreview() {
  if (this.formationForm.invalid) {
    this.messageService.add({
      severity: 'error',
      summary: 'Erreur',
      detail: 'Veuillez remplir tous les champs requis avant de prévisualiser.'
    });
    return;
  }

  const formValues = this.formationForm.getRawValue();
  const periodes: PeriodeFormationDto[] = [];

  for (let i = 0; i < this.nombrePartiesArray.length; i++) {
    const dateDebut = formValues[`dateDebutPartie${i}`];
    const dateFin = formValues[`dateFinPartie${i}`];
    const formateur = formValues[`formateurPartie${i}`]; // ✅ ajout du champ formateur
    const programme = formValues[`programmePartie${i}`];
    if (dateDebut && dateFin && formateur) {
      periodes.push({
        dateDebut: this.formatDate(dateDebut),  // formatte les dates
        dateFin: this.formatDate(dateFin),      // formatte les dates
        formateur: formateur.trim()    ,
        programme: programme.trim() 
      });
    }
  }

  // Initialiser un poste vide pour éviter des erreurs si le poste est manquant
  const defaultPoste = {
    lesProgrammesDeFormation: [],
    // Ajoute d'autres propriétés si nécessaires pour le template
  };

  const posteId = formValues.titrePoste?.id;

  // Vérifier si un poste est sélectionné
  if (posteId) {
    this.posteService.getPosteById(posteId).subscribe({
      next: (poste) => {
        this.preparePreviewData(formValues, periodes, poste || defaultPoste);
      },
      error: (err) => {
        console.error('Erreur lors de la récupération du poste:', err);
        this.preparePreviewData(formValues, periodes, defaultPoste);
      }
    });
  } else {
    // Si aucun poste n'est sélectionné, afficher la prévisualisation avec un poste par défaut
    this.preparePreviewData(formValues, periodes, defaultPoste);
  }
}

confirmCreation() {
  this.confirmationService.confirm({
    message: 'Êtes-vous sûr de vouloir créer cette formation pour ' + 
             this.selectedEmployees.length + ' employé(s) avec les paramètres affichés?',
    header: 'Confirmation finale',
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: 'Oui, créer',
    rejectLabel: 'Non, modifier',
    accept: () => {
      this.submitFormation();
      this.previewDialogVisible = false;
      this.messageService.add({
        severity: 'success',
        summary: 'Succès',
        detail: 'Formation créée avec succès pour ' + this.selectedEmployees.length + ' employé(s)'
      });
    },
    reject: () => {
      // L'utilisateur peut continuer à modifier
      this.messageService.add({
        severity: 'info',
        summary: 'Modification',
        detail: 'Vous pouvez modifier la formation avant de la créer'
      });
    }
  });
}
private preparePreviewData(formValues: any, periodes: PeriodeFormationDto[], poste: any) {
  // Répartir les programmes de formation entre les périodes
  const programmesParPartie = this.repartirProgrammes(poste?.ProgrammesDeFormation || [], periodes.length);

  // Prepare preview data
  this.previewData = {
    ...formValues,
    libelle: formValues.enteteId?.libelle || 'Entête de formation',
    periodes: periodes.map((periode, index) => ({
      ...periode,
      programmes: programmesParPartie[index] || [] // Ajoute les programmes à chaque période
    })),
    poste: poste,
    employes: this.selectedEmployees,
    selectedRadio: this.selectedRadio,
    responsable: this.selectedResponsableType === 'INTERNE' 
      ? this.responsables.find(r => r.id === formValues.responsableEvaluationId)
      : { nom: formValues.responsableEvaluationExterne, prenom: '' },
    enteteId: formValues.enteteId
  };

  this.previewDialogVisible = true;
}

private repartirProgrammes(programmes: string[], nombreParties: number): string[][] {
  if (nombreParties === 0 || programmes.length === 0) {
    return Array(nombreParties).fill([]);
  }

  // Répartir équitablement les programmes entre les parties
  const result: string[][] = Array(nombreParties).fill([]).map(() => []);
  const programmesParPartie = Math.ceil(programmes.length / nombreParties);

  for (let i = 0; i < programmes.length; i++) {
    const partieIndex = Math.floor(i / programmesParPartie);
    if (partieIndex < nombreParties) {
      result[partieIndex].push(programmes[i]);
    }
  }

  return result;
}
submitModificationForm() {
  if (!this.modificationForm.valid) {
    this.messageService.add({
      severity: 'error',
      summary: 'Erreur',
      detail: 'Veuillez remplir tous les champs obligatoires'
    });
    return;
  }

  const formValues = this.modificationForm.getRawValue();
  const rhId = Number(localStorage.getItem('RHID'));
  const formationId = this.selectedFormation.id;

  if (formValues.sousTypeFormation === 'POLYCOMPETENCE') {
    const formationDto: FormationDto_Resultat = {
      titre: formValues.titre,
      description: formValues.description,
      typeFormation: formValues.typeFormation,
      sousTypeFormation: formValues.sousTypeFormation,
      dateDebutPrevue: this.formatDate(formValues.dateDebutPrevue),
      dateFinPrevue: this.formatDate(formValues.dateFinPrevue),
      employes: formValues.selectedCitiesModif.map((employeId: number) => ({
        employeId,
        resultat: this.selectedRadioModif[employeId]
      })),
      responsableEvaluationId: this.selectedResponsableTypeModif === 'INTERNE'
        ? formValues.responsableEvaluationId
        : undefined,
      responsableEvaluationExterne: this.selectedResponsableTypeModif === 'EXTERNE'
        ? formValues.responsableEvaluationExterne
        : undefined
    };

    this.formationservice.modifierFormationAvecResultat(formationDto, rhId, formationId).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: 'Formation mise à jour avec succès'
        });
        this.closeModificationDialog();
        this.loadFormations();
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: error.error || 'Erreur lors de la mise à jour'
        });
      }
    });
  } else {
    const formData = new FormData();

    formData.append('titre', formValues.titre);
    formData.append('description', formValues.description);
    formData.append('typeFormation', formValues.typeFormation);
    formData.append('sousTypeFormation', formValues.sousTypeFormation);
    formData.append('dateDebutPrevue', formValues.dateDebutPrevue.toISOString().split('T')[0]);
    formData.append('dateFinPrevue', formValues.dateFinPrevue.toISOString().split('T')[0]);
    formData.append('organisateurId', rhId.toString());
    if (formValues.sousTypeFormation === 'INTEGRATION' || formValues.sousTypeFormation === 'POLYVALENCE') {
      // Référence
      if (formValues.reference) {
        formData.append('reference', formValues.reference);
      }

      // Numéro de révision
      if (formValues.revisionNumber) {
        formData.append('revisionNumber', formValues.revisionNumber.toString());
      }

      // Date d'application
      if (formValues.dateApplication) {
        formData.append('dateApplication', formValues.dateApplication.toISOString().split('T')[0]);
      }

      // Entête
      if (formValues.entete && formValues.entete.id) {
        formData.append('enteteId', formValues.entete.id.toString());
      }

      if (this.isPolyOrIntegrationModif() && this.periodesModif.length > 0) {
        const periodesValides = this.periodesModif
          .filter(p => p.dateDebut && p.dateFin && p.formateur && p.programme)
          .map(p => ({
            dateDebut: this.formatDate(p.dateDebut),
            dateFin: this.formatDate(p.dateFin),
            formateur: p.formateur,
            programme: p.programme
          }));
  
        if (periodesValides.length > 0) {
          formData.append('periodes', JSON.stringify(periodesValides));
        }
      }}










    

    if (this.selectedResponsableTypeModif === 'INTERNE' && formValues.responsableEvaluationId) {
      formData.append('responsableEvaluationId', formValues.responsableEvaluationId.toString());
    } else if (this.selectedResponsableTypeModif === 'EXTERNE' && formValues.responsableEvaluationExterne) {
      formData.append('responsableEvaluationExterne', formValues.responsableEvaluationExterne);
    }

    formValues.selectedCitiesModif?.forEach((id: number) => {
      formData.append('employeIds', id.toString());
    });

    if (formValues.titrePoste?.document) {
      if (typeof formValues.titrePoste.document === 'string' && formValues.titrePoste.document.startsWith('JVBERi0')) {
        const pdfFile = this.base64ToFile(formValues.titrePoste.document, 'document.pdf');
        formData.append('fichierPdf', pdfFile);
      } else if (formValues.titrePoste.document instanceof File) {
        formData.append('fichierPdf', formValues.titrePoste.document);
      }
    }

    formData.append('titrePoste', formValues.titrePoste?.titre || '');

    this.formationservice.modifierFormation(formationId, formData).subscribe({
      next: () => {
        if (formValues.titrePoste?.id) {
          this.formationPosteService.updatePosteForFormation(formationId, formValues.titrePoste.id).subscribe({
            next: () => console.log('Poste mis à jour avec succès'),
            error: (error) => console.error('Erreur lors de la mise à jour du poste', error)
          });
        }

        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: 'Formation mise à jour avec succès'
        });
        this.closeModificationDialog();
        this.loadFormations();
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: error.error || 'Erreur lors de la mise à jour'
        });
      }
    });
  }
}




private initializePeriodesModif(formation: any) {
  if (formation.periodes && formation.periodes.length > 0) {
    this.periodesModif = formation.periodes.map((periode: any) => ({
      ...periode,
      dateDebut: new Date(periode.dateDebut),
      dateFin: new Date(periode.dateFin)
    }));
  } else if (formation.titrePoste && formation.titrePoste.lesProgrammesDeFormation) {
    // Si pas de périodes mais des programmes, créer des périodes par défaut
    this.periodesModif = formation.titrePoste.lesProgrammesDeFormation.map((programme: string, index: number) => ({
      dateDebut: new Date(),
      dateFin: new Date(),
      formateur: '',
      programme: programme
    }));
  } else {
    this.periodesModif = [];
  }
}

// Méthodes utilitaires pour gérer les réponses
private handleSuccessResponse(response: any) {
  console.log('Formation mise à jour avec succès', response);
  this.messageService.add({
    severity: 'success',
    summary: 'Succès',
    detail: 'Formation mise à jour avec succès'
  });
  this.closeModificationDialog();
  this.loadFormations();
}

displayFormationPosteList() {
  this.formationPosteService.getAllPairs().subscribe({
    next: (pairs) => {
      console.log('Liste des paires formationId et posteId :', pairs);
    },
    error: (error) => {
      console.error('Erreur lors de la récupération des paires', error);
    },
  });
}

isInProgress(dateFinPrevue: Date): boolean {
  const today = new Date();
  const dateFin = new Date(dateFinPrevue);
  return today <= dateFin; // Retourne true si la formation est en cours
}



  onResponsableTypeChange(value: string) {
    this.selectedResponsableType = value;
  }
  openDialog() {
    this.dialogVisible = true;
  }
  openDialogModif() {
    this.dialogVisibleModif = true;
  }

  closeDialogModif() {
    this.dialogVisibleModif = false;
  }
  closeDialog() {
    this.dialogVisible = false;
  }
  private formatDate(date: Date | string | null): string {
    if (!date) return '';
    
    // Si c'est déjà une string, la retourner directement
    if (typeof date === 'string') return date;
    
    // Si c'est un objet Date, le formater
    return new Date(Date.UTC(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    )).toISOString().split('T')[0];
  }
  
  getPeriodesFromForm(formValues: any): PeriodeFormationDto[] {
    const periodes: PeriodeFormationDto[] = [];
    const nombreDePeriodes = formValues.nombreDePeriodes;
  
    for (let i = 0; i < nombreDePeriodes; i++) {
      const dateDebut = formValues[`dateDebutPartie${i}`];
      const dateFin = formValues[`dateFinPartie${i}`];
      const formateur = formValues[`formateurPartie${i}`];
      const programme = formValues[`programmePartie${i}`];
      if (dateDebut && dateFin && formateur) {
        periodes.push({
          dateDebut: dateDebut.toISOString().split('T')[0],
          dateFin: dateFin.toISOString().split('T')[0],
          formateur: formateur.trim(),
          programme: programme.trim()
        });
      }
    }
  
    return periodes;
  }
  

  loadFormations(): void {
    const rhId = localStorage.getItem('RHID');
    
    if (!rhId) {
      console.error("Impossible de récupérer l'ID du RH !");
      return;
    }
    
    this.loading = true;
    this.ngZone.run(() => {
      this.formationservice.getFormationsParRH(Number(rhId)).subscribe(
        (data) => {
          console.log("Formations récupérées avec succès", data);
          
          // Transformez les données reçues
          this.formations = data.map(item => this.transformToFormationDto(item));
          
          // Filtrer les formations POLYVALANCE
          this.formationsPolyvalence = this.formations.filter(f => 
            f.sousTypeFormation === 'POLYVALENCE'
          );
          
          // Filtrer les formations POLYVALANCE validées
          this.formationsPolyvalenceValidees = this.formationsPolyvalence.filter(f => 
            f.valide  && !f.probleme
          );

          // Filtrer les formations POLYVALANCE en attente
          this.formationsPolyvalenceEnAttente = this.formationsPolyvalence  .filter(f => !f.valide && !f.annuler);
          this.formationsPolyvalenceACorriger = this.formationsPolyvalence.filter(f => 
            f.probleme === true // Enlevez la condition sur !f.valide pour tester
          );
          this.formationsPolyvalenceAnnulees = this.formationsPolyvalence.filter(f => f.annuler);
          // Ajoutez un console.log pour vérifier
          console.log('Formations à corriger:', this.formationsPolyvalenceACorriger);
        
          // Filtrer les formations INTEGRATION
          this.formationsIntegration = this.formations.filter(f => 
            f.sousTypeFormation === 'INTEGRATION'
          );
          this.formationsIntegrationAnnulees  = this.formationsIntegration.filter(f => f.annuler);




          // Dans loadFormations(), après les autres filtres d'intégration
this.formationsIntegrationACorriger = this.formationsIntegration.filter(f => 
  f.probleme === true
);
          // Filtrer les formations INTEGRATION validées
          this.formationsIntegrationValidees = this.formationsIntegration.filter(f => 
            f.valide  && !f.probleme
          );
          
          // Filtrer les formations INTEGRATION en attente
          this.formationsIntegrationEnAttente = this.formationsIntegration.filter(f =>
            !f.valide && !f.annuler 
          );
          console.log("Formations integration en attente", this.formationsIntegrationEnAttente);
          
          // Filtrer les formations POLYCOMPETENCES (inchangé)
          this.formationsCompletes = this.formations.filter(f => 
            f.sousTypeFormation === 'POLYCOMPETENCE'
          );
          
          this.loading = false;
          this.updateCalendarEvents();
        },
        (error) => {
          console.error('Erreur lors de la récupération des formations', error);
          this.loading = false;
        }
      );
    });
  }




  onAnnulerFormation(formation: FormationDto) {
    const id = formation.id;
    if (id == null) {
      console.error('Impossible d’annuler : l’ID de la formation est absent');
      return;
    }
    this.formationservice.annulerFormation(id).subscribe({
      next: updated => {
        formation.annuler = updated.annuler;
        formation.dateAnnulation = updated.dateAnnulation;
        this.messageService.add({ 
          severity: 'success', 
          summary: 'Annulé', 
          detail: `La formation "${formation.titre}" a été annulée.` 
        });
        this.loadFormations();
      },
      error: err => {
        console.error(err);
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Impossible d’annuler la formation.'
        });
      }
    });
  }
  





  private transformToFormationDto(data: any): FormationDto {
    return {
      id: data.id,
      titre: data.titre,
      commentaire: data.commentaire,
      description: data.description,
      typeFormation: data.typeFormation,
      sousTypeFormation: data.sousTypeFormation,
      dateDebutPrevue: data.dateDebutPrevue,
      dateFinPrevue: data.dateFinPrevue,
      responsableEvaluationId: data.responsableEvaluationId,
      responsableEvaluationExterne: data.responsableEvaluationExterne,
      employeIds: data.employeIds || [],
      responsableEvaluation: data.responsableEvaluation,
      employes: data.employes,
      fichierPdf: data.fichierPdf,
      organisateurId: data.organisateurId,
      titrePoste: data.titrePoste,
      valide: data.valide,
      probleme: data.probleme,
      annuler: data.annuler,
      dateAnnulation: data.dateAnnulation, 
      entete: data.entete, 
      dateApplication: data.dateApplication,
      revisionNumber: data.revisionNumber, 
      reference: data.reference, 
      periodes: data.periodes ? data.periodes.map((periode: any) => ({
        dateDebut: periode.dateDebut,
        dateFin: periode.dateFin,
        formateur: periode.formateur,
        programme: periode.programme
      } as PeriodeFormationDto)) : []
    
    };
  }




  // Variables pour gérer les périodes
periodesModif: PeriodeFormationDto[] = [];

isPolyOrIntegrationModif(): boolean {
  return this.modificationForm.get('sousTypeFormation')?.value === 'INTEGRATION' || 
         this.modificationForm.get('sousTypeFormation')?.value === 'POLYVALENCE';
}

peutAjouterPeriodeModif(): boolean {
  const poste = this.modificationForm.get('titrePoste')?.value;
  return this.isPolyOrIntegrationModif() && 
         poste?.lesProgrammesDeFormation?.length &&
         this.periodesModif.length < poste.lesProgrammesDeFormation.length;
}

ajouterPeriodeModif(): void {
  this.periodesModif.push({
    dateDebut: '',
    dateFin: '',
    formateur: '',
    programme: ''
  });
}

supprimerPeriodeModif(index: number): void {
  this.periodesModif.splice(index, 1);
}
  // Méthode séparée pour la mise à jour du calendrier
  updateCalendarEvents(): void {
    this.calendarOptions.events = this.formations.map((formation) => ({
      title: formation.titre,
      start: new Date(formation.dateDebutPrevue), // Notez le changement de dateDebutPrevue à date_debut_prevue
      end: new Date(formation.dateFinPrevue),    // Notez le changement de dateFinPrevue à date_fin_prevue
    }));
    
    // Forcer la mise à jour du calendrier
    setTimeout(() => {
      this.calendarOptions = { ...this.calendarOptions };
    }, 0);
  }

  onReactiverFormation(formation: FormationDto) {
    if (formation.id !== undefined) {  // Vérifier si l'ID est défini
      this.formationservice.reactiverFormation(formation.id).subscribe({
        next: (reactivatedFormation: FormationDto) => {
          const index = this.formationsIntegrationAnnulees.findIndex(f => f.id === reactivatedFormation.id);
          if (index !== -1) {
            this.formationsIntegrationAnnulees[index] = reactivatedFormation;
          }
          this.messageService.add({severity: 'success', summary: 'Réactivation réussie', detail: 'La formation a été réactivée avec succès.'});
          this.loadFormations();
        },
        error: (err) => {
          this.messageService.add({severity: 'error', summary: 'Erreur', detail: 'La réactivation de la formation a échoué.'});
        }
      });
    } else {
      // Si l'ID est undefined, on peut afficher un message d'erreur ou gérer autrement
      this.messageService.add({severity: 'error', summary: 'Erreur', detail: 'ID de la formation invalide.'});
    }
  }
  
  
  base64ToFile(base64: string, filename: string): File {
    const byteCharacters = atob(base64); // Décoder Base64
    const byteNumbers = new Array(byteCharacters.length);
    
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'application/pdf' }); // Créer un Blob
    return new File([blob], filename, { type: 'application/pdf' });
  }
  isEmployeeSelected(employeeCode: string): boolean {
    const selectedEmployees = this.formationForm.get('selectedCities')?.value || [];
    return selectedEmployees.includes(employeeCode);
  }

  isPolycompetence(): boolean {
    return this.formationForm.get('sousTypeFormation')?.value?.toLowerCase() === 'polycompetence';
  }

  onEmployeSelectionChange(selectedIds: number[]) {
    // Mettre à jour la liste des employés sélectionnés
    this.selectedEmployes = this.cities
      .filter(city => selectedIds.includes(city.code))
      .map(emp => ({
        ...emp,
        resultat: emp.resultat || null // Conserver le résultat existant si déjà défini
      }));
  }
  
  updateEmployeResultat(employe: any, resultat: string) {
    employe.resultat = resultat;
    // Vous pouvez ajouter ici une logique supplémentaire si nécessaire
  }


  
 // Fonction pour afficher nom et matricule
 customFilter(event: any, option: any): boolean {
  const searchValue = event.query.toLowerCase();
  const name = option.name.toLowerCase();
  const matricule = option.matricule.toString().toLowerCase();

  // Rechercher dans le nom et le matricule
  return name.includes(searchValue) || matricule.includes(searchValue);
}
getFormationStatus(dateFinPrevue: Date): string {
  const currentDate = new Date();
  
  // Si la date de fin est dans le futur, afficher "En cours"
  if (new Date(dateFinPrevue) > currentDate) {
    return 'En cours';  // premier tag
  } else {
    return 'Terminé'; // deuxième tag
  }
}

getStatusSeverity(dateFinPrevue: Date): 'success' | 'info' {
  const currentDate = new Date();

  // Si la date de fin est dans le futur, retourner 'info'
  if (new Date(dateFinPrevue) > currentDate) {
    return 'info'; // bleu clair (en cours)
  } else {
    return 'success'; // vert (terminé)
  }
}

ajouterResultat(formationId: number, employeId: number, resultat: string) {
  this.formationservice.ajouterResultatFormation(formationId, employeId, resultat).subscribe({
    next: (response) => {
      console.log('Résultat ajouté avec succès :', response);
      this.messageService.add({
        severity: 'success',
        summary: 'Succès',
        detail: 'Résultat mis à jour avec succès !',
      });
    },
    error: (err) => {
      console.error('Erreur lors de la mise à jour du résultat :', err);
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur',
        detail: 'Une erreur est survenue lors de la mise à jour du résultat.',
      });
    },
  });
}

onSousTypeChange(sousType: string | null) {
  if (!sousType) return;
  
  const sousTypeLower = sousType.toLowerCase();
  
  if (sousTypeLower === 'polyvalence' || sousTypeLower === 'integration') {
    this.formationForm.get('typeFormation')?.setValue('INTERNE');
    this.formationForm.get('typeFormation')?.disable(); // <-- Ici
    
    this.formationForm.get('responsableType')?.setValue('INTERNE');
    this.formationForm.get('responsableType')?.disable(); // <-- Ici
    
    this.selectedResponsableType = 'INTERNE';
  } else {
    this.formationForm.get('typeFormation')?.enable(); // <-- Ici
    this.formationForm.get('responsableType')?.enable(); // <-- Ici
  }
}
shouldShowPosteSection(): boolean {
  const sousType = this.formationForm.get('sousTypeFormation')?.value;
  return !['polycompetence', 'sensibilisation'].includes(sousType?.toLowerCase());
}


getSeverity(resultat: string): "success" | "info" | "warn" | "danger" | "secondary" | "contrast" | undefined {
  switch (resultat) {
    case 'REUSSI':
      return 'success'; // Vert
    case 'ECHEC':
      return 'danger'; // Rouge
    case 'PROGRAMME_COMPLEMENTAIRE':
      return 'warn'; // Orange (utilisez 'warn' au lieu de 'warning')
    default:
      return 'info'; // Bleu (par défaut)
  }
}

// Méthode pour obtenir le libellé du résultat
getResultatLabel(resultat: string): string {
  const option = this.resultatOptions.find((opt) => opt.value === resultat);
  return option ? option.label : 'non évalué';
}
checkBeforeEdit(employe: any) {
  if (employe.resultat === 'PROGRAMME_COMPLEMENTAIRE') {
    this.confirmationService.confirm({
      message: 'Vous ne pouvez pas modifier ce résultat car une formation complémentaire a déjà été lancée pour cet employé',
      header: 'Modification impossible',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'OK',
      rejectVisible: false
    });
    return;
  }
  this.resetResultat(employe);
}

isConfirming : boolean = false;
updateResultat(formationId: number, employeId: number, resultat: string, employe: any) {
  // Vérifier si c'est une formation POLYCOMPETENCE
  if (this.selectedFormation?.sousTypeFormation === 'POLYCOMPETENCE') {
    // Pour les formations polycompétences, mettre à jour directement sans confirmation
    this.formationservice.ajouterResultatFormation(formationId, employeId, resultat).subscribe({
      next: (response) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: 'Résultat mis à jour avec succès !',
        });
        employe.resultat = resultat;
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Une erreur est survenue lors de la mise à jour du résultat.',
        });
      },
    });
  } 
  // Cas spécial pour INTEGRATION - affichage direct du dialogue
  else if (this.selectedFormation?.sousTypeFormation === 'INTEGRATION' && resultat === 'REUSSI') {
    this.showDirectionSiteDialog(formationId, employe);
  }
  // Cas normal pour les autres formations (y compris POLYVALANCE)
  else if (resultat === 'REUSSI') {
    this.confirmationService.confirm({
        message: `Êtes-vous sûr que l'employé ${employe.nom} ${employe.prenom} a réussi cette formation ?`,
        header: 'Confirmation de réussite',
        icon: 'pi pi-exclamation-triangle',
        accept: () => {
            employe.tempResultat = 'REUSSI';
            
            // Deuxième confirmation pour changement de poste
            this.confirmationService.confirm({
                message: `Voulez-vous passer cet employé à un autre poste comme poste actuel ?`,
                header: 'Changement de poste',
                icon: 'pi pi-info-circle',
                accept: () => {
                    this.showDirectionSiteDialog(formationId, employe);
                },
                reject: () => {
                    // Appel du service pour enregistrer le résultat
                    this.formationservice.ajouterResultatFormation(formationId, employe.id, 'REUSSI').subscribe({
                        next: (response) => {
                            // Afficher d'abord le message toast de succès
                            this.messageService.add({
                                severity: 'success',
                                summary: 'Succès',
                                detail: 'Résultat mis à jour avec succès !'
                            });
                            
                            // Puis afficher le message dans une boîte de dialogue
                            this.confirmationService.confirm({
                                message: `L'employé ${employe.nom} ${employe.prenom} reste à son poste actuel mais a bien réussi cette formation et peut l'exercer .`,
                                header: 'Information',
                                icon: 'pi pi-check-circle',
                                acceptLabel: 'OK',
                                rejectVisible: false, // Cache le bouton Non
                                accept: () => {
                                    employe.resultat = 'REUSSI';
                                    employe.tempResultat = null;
                                }
                            });
                        },
                        error: (err) => {
                            this.messageService.add({
                                severity: 'error',
                                summary: 'Erreur',
                                detail: 'Une erreur est survenue lors de la mise à jour du résultat.'
                            });
                        }
                    });
                }
            });
        },
        reject: () => {
            employe.resultat = null;
            employe.tempResultat = null;
        }
    });
  }    else if (resultat === 'PROGRAMME_COMPLEMENTAIRE') {
    this.confirmationService.confirm({
      message: `Vous avez sélectionné "Programme Complémentaire" pour ${employe.nom} ${employe.prenom}. Souhaitez-vous créer une nouvelle formation pour cet employé ?`,
      header: 'Programme Complémentaire',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.prepareComplementaryProgramForm(employe, this.selectedFormation);
        this.displayComplementaryProgramDialog = true;
      },
      reject: () => {
        // Ne rien faire - l'utilisateur a annulé la sélection
        employe.tempResultat = null; // Réinitialiser la sélection temporaire
      }
    });
  }
  else {
    // Pour les autres résultats (ECHEC, PROGRAMME_COMPLEMENTAIRE)
    this.formationservice.ajouterResultatFormation(formationId, employeId, resultat).subscribe({
      next: (response) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: 'Résultat mis à jour avec succès !',
        });
        employe.resultat = resultat;
        employe.tempResultat = null;
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Une erreur est survenue lors de la mise à jour du résultat.',
        });
      },
    });
  }
}
prepareComplementaryProgramForm(employe: any, formation: any) {
  this.selectedEmployeeForComplementary = employe;
  
  // Trouver le poste correspondant au titre de la formation originale
  const currentPoste = this.postes.find(poste => poste.titre === formation.titrePoste);
  
  this.complementaryProgramForm.patchValue({
    titre: `Programme complémentaire - ${formation.titre}`,
    description: formation.description,
    typeFormation: formation.typeFormation,
    sousTypeFormation: formation.sousTypeFormation,
    dateDebutPrevue: new Date(),
    dateFinPrevue: new Date(new Date().setDate(new Date().getDate() + 7)), // +7 jours par défaut
    responsableType: this.selectedResponsableTypeModif,  // <-- Ajoutez cette ligne
        responsableEvaluationId: formation.responsableEvaluation?.id || null,
        responsableEvaluationExterne: formation.responsableEvaluationExterne || '',
    employeIds: [employe.id],
    titrePoste: currentPoste || null
  });

  // Charger le PDF du poste s'il existe
  if (currentPoste?.document) {
    this.loadComplementaryPdf(currentPoste.document);
  } else {
    this.complementaryPdfUrl = null;
  }

  // Désactiver les champs si nécessaire (comme dans le dialogue de modification)
  if (formation.sousTypeFormation === 'INTEGRATION' || formation.sousTypeFormation === 'POLYVALENCE') {
    this.complementaryProgramForm.get('typeFormation')?.disable();
    this.complementaryProgramForm.get('sousTypeFormation')?.disable();
  }
}
submitComplementaryProgram() {
  if (this.complementaryProgramForm.valid) {
    const formValues = this.complementaryProgramForm.getRawValue();
    const rhId = Number(localStorage.getItem('RHID'));

    // Création de FormData pour gérer les fichiers et les données
    const formData = new FormData();

    // Ajout des champs obligatoires
    formData.append('titre', formValues.titre);
    formData.append('description', formValues.description);
    formData.append('typeFormation', formValues.typeFormation);
    formData.append('sousTypeFormation', formValues.sousTypeFormation);
    formData.append('dateDebutPrevue', this.formatDate(formValues.dateDebutPrevue));
    formData.append('dateFinPrevue', this.formatDate(formValues.dateFinPrevue));
    formData.append('organisateurId', rhId.toString());

    // Gestion du responsable (interne ou externe)
   
    if (formValues.responsableEvaluationId) {
      formData.append('responsableEvaluationId', formValues.responsableEvaluationId.toString());
    }
    if (formValues.responsableEvaluationExterne) {
      formData.append('responsableEvaluationExterne', formValues.responsableEvaluationExterne);
    }

    // Gestion des employés (adapté selon votre modèle)
    if (formValues.employeIds && formValues.employeIds.length > 0) {
      formValues.employeIds.forEach((id: number) => {
        formData.append('employeIds', id.toString());
      });
    }

    // Gestion du fichier PDF (identique à votre logique existante)
    if (formValues.fichierPdf) {
      if (typeof formValues.fichierPdf === 'string' && formValues.fichierPdf.startsWith('JVBERi0')) {
        const pdfFile = this.base64ToFile(formValues.fichierPdf, 'document.pdf');
        formData.append('fichierPdf', pdfFile);
      } else if (formValues.fichierPdf instanceof File) {
        formData.append('fichierPdf', formValues.fichierPdf);
      }
    } else {
      // Fallback pour fichier vide si nécessaire
      formData.append('fichierPdf', new Blob(), 'empty.pdf');
    }

    // Gestion du titre de poste si pertinent
    if (formValues.titrePoste) {
      formData.append('titrePoste', formValues.titrePoste.titre || formValues.titrePoste);
      
      if (formValues.titrePoste.document) {
        // Même logique de conversion que pour fichierPdf
      }
    }

    // Appel du service
    this.formationservice.creerFormation(formData).subscribe({
      next: (formationId) => {
        this.formationservice.ajouterResultatFormation(
          this.selectedFormation.id, 
          this.selectedEmployeeForComplementary.id, 
          'PROGRAMME_COMPLEMENTAIRE'
        ).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Succès',
              detail: 'Programme complémentaire créé et résultat enregistré avec succès'
            });
            
            // Fermer le dialogue et rafraîchir
            this.displayComplementaryProgramDialog = false;
            this.loadFormations();
          },
          error: (err) => {
            console.error('Erreur enregistrement résultat:', err);
            this.messageService.add({
              severity: 'error',
              summary: 'Erreur',
              detail: 'Le programme a été créé mais le résultat n\'a pas pu être enregistré'
            });
          }
        });




        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: 'Programme complémentaire créé avec succès'
        });
        
        // Fermer le dialogue et rafraîchir
        this.displayComplementaryProgramDialog = false;
        this.loadFormations();

        // Gestion supplémentaire si nécessaire (comme pour formationPoste)
        if (this.posteSelectionne && this.posteSelectionne.id) {
          this.formationPosteService.addPair(formationId, this.posteSelectionne.id).subscribe({
            next: () => console.log('Association poste réussie'),
            error: (err) => console.error('Erreur association poste', err)
          });
        }
      },
      error: (error) => {
        console.error('Erreur création programme:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: error.error?.message || 'Échec de la création du programme'
        });
      }
    });
  } else {
    // Gestion des erreurs de formulaire
    this.messageService.add({
      severity: 'error',
      summary: 'Erreur',
      detail: 'Formulaire incomplet ou invalide'
    });
    
    // Log des erreurs pour debug
    Object.keys(this.complementaryProgramForm.controls).forEach(key => {
      const control = this.complementaryProgramForm.get(key);
      if (control?.errors) console.log(`${key} errors:`, control.errors);
    });
  }
}


private handleSuccess() {
  this.messageService.add({
    severity: 'success',
    summary: 'Succès',
    detail: 'Programme complémentaire créé avec succès'
  });
  this.displayComplementaryProgramDialog = false;
  this.loadFormations();
}

private handleError(error: any) {
  this.messageService.add({
    severity: 'error',
    summary: 'Erreur',
    detail: error.error || 'Erreur lors de la création du programme complémentaire'
  });
}
// Afficher le dialogue de sélection direction/site
showDirectionSiteDialog(formationId: number, employe: any) {
  this.selectedEmploye = employe;
  
  // Récupérer l'ID du poste associé à la formation
  this.formationPosteService.getPosteIdByFormationId(formationId).subscribe({
    next: (posteId) => {
      // Récupérer les détails complets du poste
      this.posteService.getPosteById(posteId).subscribe({
        next: (poste) => {
          this.selectedPoste = poste;
          
          // Charger les directions pour ce poste
          this.posteService.getDirectionsByPosteId(posteId).subscribe({
            next: (directions) => {
              this.directions = directions;
              this.displayPosteAssignmentDialog = true;
            },
            error: (err) => {
              console.error('Erreur directions:', err);
              this.messageService.add({
                severity: 'error',
                summary: 'Erreur',
                detail: 'Impossible de charger les directions'
              });
              // Annuler le résultat temporaire en cas d'erreur
              employe.tempResultat = null;
            }
          });
        },
        error: (err) => {
          console.error('Erreur poste:', err);
          this.messageService.add({
            severity: 'error',
            summary: 'Erreur',
            detail: 'Impossible de récupérer les détails du poste'
          });
          employe.tempResultat = null;
        }
      });
    },
    error: (err) => {
      console.error('Erreur poste ID:', err);
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur',
        detail: 'Impossible de récupérer le poste associé'
      });
      employe.tempResultat = null;
    }
  });
}

// Gestion de la sélection de direction
onDirectionSelect(event: any) {
  this.selectedDirection = event.value;
  this.selectedSite = null; // Réinitialiser la sélection de site
  
  if (this.selectedDirection) {
    // Charger les sites pour la direction sélectionnée
    this.directionservice.getSitesByDirection(this.selectedDirection.id).subscribe({
      next: (sites) => {
        this.sites = sites;
      },
      error: (err) => {
        console.error('Erreur sites:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Impossible de charger les sites'
        });
      }
    });
  }
}

confirmAssignment() {
  // First check all required selections with proper null checks
  if (!this.selectedDirection?.id || !this.selectedSite?.id || 
      !this.selectedEmploye?.id || !this.selectedPoste?.id || 
      !this.selectedFormation?.id) {
    this.messageService.add({
      severity: 'warn',
      summary: 'Attention',
      detail: 'Veuillez sélectionner tous les éléments requis'
    });
    return;
  }

  // Now TypeScript knows these values can't be undefined
  const employeId = this.selectedEmploye.id;
  const posteId = this.selectedPoste.id;
  const directionId = this.selectedDirection.id;
  const siteId = this.selectedSite.id;
  const formationId = this.selectedFormation.id;

  console.log('IDs sélectionnés:', {
    employeId,
    posteId,
    directionId,
    siteId
  });

  // Appel pour changer le poste de l'employé
  this.formationservice.changerPosteEmploye(
    employeId,
    posteId,
    directionId,
    siteId
  ).subscribe({
    next: (posteResponse) => {
      // Si le changement de poste réussit, on met à jour le résultat de formation
      this.formationservice.ajouterResultatFormation(
        formationId, 
        employeId, 
        'REUSSI'
      ).subscribe({
        next: (formationResponse) => {
          // Mettre à jour l'interface seulement après les deux succès
          this.selectedEmploye.resultat = 'REUSSI';
          this.selectedEmploye.tempResultat = null;
          
          this.messageService.add({
            severity: 'success',
            summary: 'Succès',
            detail: 'Affectation et résultat mis à jour avec succès !'
          });

          // Fermer le dialogue
          this.displayPosteAssignmentDialog = false;
          this.selectedDirection = null;
          this.selectedSite = null;
        },
        error: (formationErr) => {
          console.error('Erreur lors de la mise à jour du résultat:', formationErr);
          this.messageService.add({
            severity: 'error',
            summary: 'Erreur',
            detail: "Erreur lors de l'enregistrement du résultat"
          });
        }
      });
    },
    error: (posteErr) => {
      console.error('Erreur lors du changement de poste:', posteErr);
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur',
        detail: "Erreur lors du changement de poste"
      });
    }
  });
}
// Annulation du dialogue d'affectation
onPosteAssignmentDialogHide() {
  // Réinitialiser le résultat temporaire si l'utilisateur ferme sans confirmer
  if (this.selectedEmploye?.tempResultat) {
    this.selectedEmploye.tempResultat = null;
  }
  this.selectedDirection = null;
  this.selectedSite = null;
}

// Réinitialiser le résultat (pour permettre une nouvelle sélection)
resetResultat(employe: any) {
  employe.resultat = null;
  employe.tempResultat = null;
}
 

 // Méthode qui met à jour le radio sélectionné pour un employé donné
 editingEmployee: { [key: string]: boolean } = {};
 onRadioChange(employeeCode: string, selectedValue: string): void {
  this.selectedRadio[employeeCode] = selectedValue;
  this.editingEmployee[employeeCode] = false; // Masquer les boutons après sélection
  console.log(`Employé ${employeeCode} a sélectionné : ${selectedValue}`);
}

editSelection(employeeCode: string): void {
  this.editingEmployee[employeeCode] = true; // Afficher à nouveau les boutons radio
}

// Variables pour la modification
selectedResponsableTypeModif: string = '';
selectedEmployeesModif: any[] = [];
selectedRadioModif: { [key: string]: string } = {};
editingEmployeeModif: { [key: string]: boolean } = {};

// Méthodes pour la modification
isPolycompetenceModif(): boolean {
  return this.modificationForm.get('sousTypeFormation')?.value?.toLowerCase() === 'polycompetence';
}

shouldShowPosteSectionModif(): boolean {
  const sousType = this.modificationForm.get('sousTypeFormation')?.value;
  return !['polycompetence', 'sensibilisation'].includes(sousType?.toLowerCase());
}

onSousTypeChangeModif(value: string | null) {
  if (!value) return;

  const sousTypeLower = value.toLowerCase();

  // Désactiver le champ sousTypeFormation si POLYCOMPETENCE
  if (sousTypeLower === 'polycompetence') {
    this.modificationForm.get('sousTypeFormation')?.disable();
  } else {
    this.modificationForm.get('sousTypeFormation')?.enable();
  }

  // Logique pour INTEGRATION/POLYVALENCE
  if (sousTypeLower === 'integration' || sousTypeLower === 'polyvalence') {
    this.modificationForm.get('typeFormation')?.setValue('INTERNE');
    this.modificationForm.get('typeFormation')?.disable();

    this.modificationForm.get('responsableType')?.setValue('INTERNE');
    this.modificationForm.get('responsableType')?.disable();

    this.selectedResponsableTypeModif = 'INTERNE';
  } else {
    this.modificationForm.get('typeFormation')?.enable();
    this.modificationForm.get('responsableType')?.enable();
  }
}

onResponsableTypeChangeModif(value: string) {
  this.selectedResponsableTypeModif = value;
}

onRadioChangeModif(employeeCode: string, selectedValue: string): void {
  this.selectedRadioModif[employeeCode] = selectedValue;
  this.editingEmployeeModif[employeeCode] = false;
}

editSelectionModif(employeeCode: string): void {
  this.editingEmployeeModif[employeeCode] = true;
}

onEmployeSelectionChangeModif(selectedCodes: number[]) {
  // Mettre à jour la liste des employés sélectionnés
  this.selectedEmployeesModif = selectedCodes
    .map(code => {
      const cityEmp = this.cities.find(c => c.code === code);
      return cityEmp ? {
        ...cityEmp,
        name: cityEmp.name || `${cityEmp.nom} ${cityEmp.prenom}`
      } : null;
    })
    .filter(Boolean);

  // Gérer les résultats
  selectedCodes.forEach(code => {
    if (!this.selectedRadioModif[code]) {
      this.selectedRadioModif[code] = '';
    }
  });

  // Nettoyer les résultats des employés désélectionnés
  Object.keys(this.selectedRadioModif).forEach(codeStr => {
    const code = Number(codeStr);
    if (!selectedCodes.includes(code)) {
      delete this.selectedRadioModif[code];
    }
  });
}
displayCommentDialog: boolean = false;
currentFormation: any;
newComment: string = '';
 // Méthode pour ouvrir le dialogue
 openCommentDialog(formation: any) {
  this.currentFormation = formation;
  this.newComment = formation.commentaire || '';
  this.displayCommentDialog = true;
}



// Le reste de vos méthodes existantes...
// Méthode pour déterminer si la section poste doit être affichée
shouldShowPosteSectionComplementary(): boolean {
  const sousType = this.complementaryProgramForm.get('sousTypeFormation')?.value;
  return !['polycompetence', 'sensibilisation'].includes(sousType?.toLowerCase());
}

// Méthode pour gérer la sélection d'un poste
onPosteSelectComplementary(event: any) {
  const selectedPoste = event.value;
  if (selectedPoste && selectedPoste.document) {
    this.loadComplementaryPdf(selectedPoste.document);
  } else {
    this.complementaryPdfUrl = null;
  }
}
private loadComplementaryPdf(document: string | File) {
  if (typeof document === 'string') {
    // Handle Base64 string
    const byteCharacters = atob(document);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const fileBlob = new Blob([byteArray], { type: 'application/pdf' });
    const pdfUrl = URL.createObjectURL(fileBlob);
    this.complementaryPdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(pdfUrl);
  } else if (document instanceof File) {
    // Handle File object
    const pdfUrl = URL.createObjectURL(document);
    this.complementaryPdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(pdfUrl);
  }
}
closeComplementaryDialog() {
  this.displayComplementaryProgramDialog = false;
  
  // Nettoyer l'URL du PDF
  if (this.complementaryPdfUrl) {
    const unsafeUrl = this.sanitizer.sanitize(SecurityContext.RESOURCE_URL, this.complementaryPdfUrl);
    if (unsafeUrl) {
      URL.revokeObjectURL(unsafeUrl);
    }
    this.complementaryPdfUrl = null;
  }
  
  this.complementaryProgramForm.reset();
}


// Ajoutez cette propriété à votre composant
complementaryPdfUrl: SafeResourceUrl | null = null;



// Propriétés à ajouter
nombrePartiesArray: number[] = []; // Pour suivre le nombre de parties
datePartieControls: string[] = []; // Pour gérer les contrôles dynamiques

// Méthode pour vérifier le type de formation
isPolyOrIntegration(): boolean {
  const type = this.formationForm.get('sousTypeFormation')?.value;
  return type === 'POLYVALENCE' || type === 'INTEGRATION';
}

updateDateFields(): void {
  // Supprimer tous les contrôles existants
  for (let i = 0; i < 10; i++) { // Supposons un maximum de 10 parties
    ['dateDebutPartie', 'dateFinPartie', 'formateurPartie', 'programmePartie'].forEach(prefix => {
      if (this.formationForm.get(`${prefix}${i}`)) {
        this.formationForm.removeControl(`${prefix}${i}`);
      }
    });
  }

  // Réinitialiser le tableau
  this.nombrePartiesArray = [];

  // Vérifier si un poste est sélectionné
if (this.posteSelectionne && this.posteSelectionne.lesProgrammesDeFormation) {
  const lesProgrammes = this.posteSelectionne.lesProgrammesDeFormation;
  const nbProgrammes = lesProgrammes.length;

  if (nbProgrammes > 0) {
    this.nombrePartiesArray = Array.from({ length: nbProgrammes }, (_, i) => i);

    this.nombrePartiesArray.forEach(i => {
      this.formationForm.addControl(`dateDebutPartie${i}`, new FormControl('', Validators.required));
      this.formationForm.addControl(`dateFinPartie${i}`, new FormControl('', Validators.required));
      this.formationForm.addControl(`formateurPartie${i}`, new FormControl('', Validators.required));

      const programmeInitial = lesProgrammes[i] || '';
      this.formationForm.addControl(
        `programmePartie${i}`,
        new FormControl(programmeInitial, Validators.required)
      );
    });
  }
}

}
// Variables de classe
nombrePartiesInitial: number = 0;


// Après avoir chargé les programmes du poste
initialiserParties() {
  const nbProgrammes = this.posteSelectionne?.lesProgrammesDeFormation?.length || 0;
  this.nombrePartiesInitial = nbProgrammes;
  this.nombrePartiesArray = Array.from({length: nbProgrammes}, (_, i) => i);
  this.creerControlesParties();
}

creerControlesParties() {
  // Supprimer tous les contrôles existants
  for (let i = 0; i < 10; i++) {
    ['dateDebutPartie', 'dateFinPartie', 'formateurPartie', 'programmePartie'].forEach(prefix => {
      if (this.formationForm.get(`${prefix}${i}`)) {
        this.formationForm.removeControl(`${prefix}${i}`);
      }
    });
  }

  // Créer les contrôles pour chaque partie
  this.nombrePartiesArray.forEach(i => {
    this.formationForm.addControl(`dateDebutPartie${i}`, new FormControl('', Validators.required));
    this.formationForm.addControl(`dateFinPartie${i}`, new FormControl('', Validators.required));
    this.formationForm.addControl(`formateurPartie${i}`, new FormControl('', Validators.required));
    
    const programmeInitial = this.posteSelectionne?.lesProgrammesDeFormation?.[i] || '';
    this.formationForm.addControl(
      `programmePartie${i}`,
      new FormControl(programmeInitial, Validators.required)
    );
  });
}

// Vérifie si on peut ajouter une partie
peutAjouterPartie(): boolean {
  return this.nombrePartiesArray.length < this.nombrePartiesInitial;
}

// Ajoute une nouvelle partie
ajouterPartie() {
  if (this.peutAjouterPartie()) {
    const nouvellePartieIndex = this.nombrePartiesArray.length;
    this.nombrePartiesArray.push(nouvellePartieIndex);
    
    // Ajouter les nouveaux contrôles
    this.formationForm.addControl(`dateDebutPartie${nouvellePartieIndex}`, new FormControl('', Validators.required));
    this.formationForm.addControl(`dateFinPartie${nouvellePartieIndex}`, new FormControl('', Validators.required));
    this.formationForm.addControl(`formateurPartie${nouvellePartieIndex}`, new FormControl('', Validators.required));
    this.formationForm.addControl(`programmePartie${nouvellePartieIndex}`, new FormControl('', Validators.required));
  }
}

// Supprime une partie
supprimerPartie(index: number) {
  if (this.nombrePartiesArray.length > 1) {
    // Supprimer les contrôles associés
    ['dateDebutPartie', 'dateFinPartie', 'formateurPartie', 'programmePartie'].forEach(prefix => {
      this.formationForm.removeControl(`${prefix}${index}`);
    });
    
    // Réindexer les parties restantes
    this.nombrePartiesArray = this.nombrePartiesArray.filter(i => i !== index);
    
    // Réorganiser les index pour qu'ils soient séquentiels
    this.nombrePartiesArray = this.nombrePartiesArray.map((_, newIndex) => newIndex);
    
    // Recréer tous les contrôles avec les nouveaux index
    this.creerControlesParties();
  }
}


// Variables pour le dialogue
displayEnteteDialog: boolean = false;

newEntete: Entete = { libelle: '' };

// Ouvrir le dialogue
openEnteteDialog() {
  this.displayEnteteDialog = true;
  this.resetForm(); // Ajoutez cette ligne
  this.loadEntetes();
}



// Ajouter une nouvelle entête
addEntete() {
  if (!this.newEntete.libelle.trim()) return;
  
  this.enteteService.createEntete(this.newEntete).subscribe({
    next: (createdEntete) => {
      this.entetes.push(createdEntete);
      this.newEntete = { libelle: '' };
      this.messageService.add({
        severity: 'success',
        summary: 'Succès',
        detail: 'Entête ajoutée avec succès'
      });
    },
    error: (err) => {
      console.error('Erreur lors de la création', err);
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur',
        detail: 'Échec de la création de l\'entête'
      });
    }
  });
}

updateEntete() {
  if (!this.editingEntete || !this.newEntete.libelle.trim()) return;
  
  const updatedEntete = { ...this.editingEntete, libelle: this.newEntete.libelle };
  
  this.enteteService.updateEntete(updatedEntete.id!, updatedEntete).subscribe({
    next: (entete) => {
      const index = this.entetes.findIndex(e => e.id === entete.id);
      if (index !== -1) {
        this.entetes[index] = entete;
      }
      this.resetForm();
      this.messageService.add({
        severity: 'success',
        summary: 'Succès',
        detail: 'Entête modifiée avec succès'
      });
    },
    error: (err) => this.handleErrorr('Erreur lors de la modification', err)
  });
}
saveEntete() {
  if (this.editingEntete) {
    this.updateEntete();
  } else {
    this.addEntete();
  }
}
// Supprimer une entête
deleteEntete(id: number) {
  this.confirmationService.confirm({
    message: 'Êtes-vous sûr de vouloir supprimer cette entête?',
    header: 'Confirmation',
    icon: 'pi pi-exclamation-triangle',
    accept: () => {
      this.enteteService.deleteEntete(id).subscribe({
        next: () => {
          this.entetes = this.entetes.filter(e => e.id !== id);
          this.messageService.add({
            severity: 'success',
            summary: 'Succès',
            detail: 'Entête supprimée avec succès'
          });
        },
        error: (err) => this.handleErrorr('Erreur lors de la suppression', err)
      });
    }
  });
}
// Dans votre composant, avec les autres variables
isEditingEntete: boolean = false;
editingEntete: Entete | null = null;
// Éditer une entête
editEntete(entete: Entete) {
  this.isEditingEntete = true;
  this.editingEntete = entete;
  this.newEntete = { ...entete };
}

// Annuler l'édition
cancelEdit() {
  this.resetForm();
}

// Réinitialiser le formulaire
resetForm() {
  this.newEntete = { libelle: '' };
  this.editingEntete = null;
}

// Gérer les erreurs
handleErrorr(summary: string, error: any) {
  console.error(summary, error);
  this.messageService.add({
    severity: 'error',
    summary: summary,
    detail: error.message || 'Une erreur est survenue'
  });
}

}