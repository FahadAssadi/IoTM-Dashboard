export interface HealthCondition {
    condition: string;
    status: boolean;
}

export interface LifestyleFactor {
    factor: string;
    options: string[];
    selection: string | null;
}

export interface OnboardingFormType {
    firstName: string;
    lastName: string;
    email: string;
    dob: string;
    sex: string;
    height: number;
    weight: number;
    state: string | undefined;
    postcode: string; // Required format is currently unclear
    healthConditions: HealthCondition[];
    lifestyleFactors: LifestyleFactor[];
}