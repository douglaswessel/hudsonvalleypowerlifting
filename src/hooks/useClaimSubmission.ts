import { useMutation } from '@apollo/client';
import { useState } from 'react';
import {
  SET_CONFIGURATION_COMPONENT_RESULT_VALUE,
  CREATE_BI_AND_START_CONFIGURATION,
} from '../graphql/mutations';
import { ClaimFormData, ConfigurationInput, FIELD_COC_IDS } from '../types/claim';

export const useClaimSubmission = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [createBIAndStartConfiguration] = useMutation(CREATE_BI_AND_START_CONFIGURATION);
  const [setConfigurationValue] = useMutation(SET_CONFIGURATION_COMPONENT_RESULT_VALUE);

  // Helper function to format date for GraphQL
  const formatDateForGraphQL = (dateString: string): string => {
    // Convert from datetime-local format to ISO string
    // datetime-local format: "2026-01-29T14:30"
    // Required format: "2026-01-29T05:00:00.000Z"
    const date = new Date(dateString);
    return date.toISOString();
  };

  const submitClaimForm = async (formData: ClaimFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      // Step 1: Create BI and start configuration
      const { data: biData } = await createBIAndStartConfiguration({
        variables: {
          input: {
            // Add your BI creation input here based on your schema
          },
        },
      });

      console.log('BI created:', biData);

      // Step 2: Submit all configuration values in series
      const configurationUpdates: Array<{
        field: keyof ClaimFormData;
        cocId: string;
        value: string;
      }> = [
        { field: 'firstName', cocId: FIELD_COC_IDS.firstName, value: formData.firstName },
        { field: 'lastName', cocId: FIELD_COC_IDS.lastName, value: formData.lastName },
        { field: 'street1', cocId: FIELD_COC_IDS.street1, value: formData.street1 },
        { field: 'city', cocId: FIELD_COC_IDS.city, value: formData.city },
        { field: 'state', cocId: FIELD_COC_IDS.state, value: formData.state },
        { field: 'telephone', cocId: FIELD_COC_IDS.telephone, value: formData.telephone },
        { field: 'claimDescription', cocId: FIELD_COC_IDS.claimDescription, value: formData.claimDescription },
        { field: 'dateOfIssue', cocId: FIELD_COC_IDS.dateOfIssue, value: formatDateForGraphQL(formData.dateOfIssue) },
      ];

      // Submit each configuration value sequentially
      for (const update of configurationUpdates) {
        console.log(`Setting ${update.field}...`);

        const { data } = await setConfigurationValue({
          variables: {
            component: {
              cocId: update.cocId,
            },
            value: update.value,
          },
        });

        console.log(`${update.field} set successfully:`, data);
      }

      console.log('All configuration values submitted successfully');
      return { success: true, biData };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred during submission';
      setError(errorMessage);
      console.error('Error submitting claim form:', err);
      return { success: false, error: errorMessage };
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    submitClaimForm,
    isSubmitting,
    error,
  };
};
