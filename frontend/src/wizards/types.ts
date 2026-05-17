export type WizardStep = {
  number: number;
  key: string;
  labelKey: string;
  descKey: string;
};

export type WizardData = Record<string, any>;

export interface WizardConfig {
  slug: string;
  stackKey: string;
  titleKey: string;
  subtitleKey: string;
  steps: WizardStep[];
  totalSteps: number;
}

export interface WizardPayload {
  wizard_type: string;
  project_type: string;
  stack_profile_id: string;
  locale: string;
  [key: string]: any;
}
