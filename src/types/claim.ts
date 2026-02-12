export interface ClaimFormData {
  firstName: string;
  lastName: string;
  street1: string;
  city: string;
  state: string;
  telephone: string;
  claimDescription: string;
  dateOfIssue: string;
}

export interface ConfigurationComponent {
  cocId: string;
}

export interface ConfigurationInput {
  component: ConfigurationComponent;
  value: string;
}

export const FIELD_COC_IDS = {
  firstName: 'COC-10PZQ86C5DE1',
  lastName: 'COC-Q6YG8393DW8C',
  street1: 'COC-UG6D0T7XDNI7',
  city: 'COC-N2ZZH6CL95EZ',
  state: 'COC-EK66P7CKB6AM',
  telephone: 'COC-DI7PM1LYMUFG',
  claimDescription: 'COC-0QQ3YHL0VI6O',
  dateOfIssue: 'COC-O2JA5GPY8XJS',
} as const;
