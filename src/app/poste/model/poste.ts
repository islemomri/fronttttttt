export class Poste {
  id?: number;
  titre!: string;
  niveauExperience!: string;
  diplomeRequis!: string;
  competencesRequises!: string;
  document?: File;
  lesProgrammesDeFormation?: string[] = []
}
