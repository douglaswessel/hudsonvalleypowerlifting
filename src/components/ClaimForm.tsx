import React, { useState } from 'react';
import { useClaimSubmission } from '../hooks/useClaimSubmission';
import { ClaimFormData } from '../types/claim';

export const ClaimForm: React.FC = () => {
  const { submitClaimForm, isSubmitting, error } = useClaimSubmission();

  const [formData, setFormData] = useState<ClaimFormData>({
    firstName: '',
    lastName: '',
    street1: '',
    city: '',
    state: '',
    telephone: '',
    claimDescription: '',
    dateOfIssue: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = await submitClaimForm(formData);

    if (result.success) {
      alert('Claim submitted successfully!');
      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        street1: '',
        city: '',
        state: '',
        telephone: '',
        claimDescription: '',
        dateOfIssue: '',
      });
    } else {
      alert(`Error: ${result.error}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="claim-form">
      <h2>Claim Form</h2>

      {error && (
        <div className="error-message" style={{ color: 'red', marginBottom: '1rem' }}>
          {error}
        </div>
      )}

      <div className="form-group">
        <label htmlFor="firstName">First Name *</label>
        <input
          type="text"
          id="firstName"
          name="firstName"
          value={formData.firstName}
          onChange={handleChange}
          required
          disabled={isSubmitting}
        />
      </div>

      <div className="form-group">
        <label htmlFor="lastName">Last Name *</label>
        <input
          type="text"
          id="lastName"
          name="lastName"
          value={formData.lastName}
          onChange={handleChange}
          required
          disabled={isSubmitting}
        />
      </div>

      <div className="form-group">
        <label htmlFor="street1">Street 1 *</label>
        <input
          type="text"
          id="street1"
          name="street1"
          value={formData.street1}
          onChange={handleChange}
          required
          disabled={isSubmitting}
        />
      </div>

      <div className="form-group">
        <label htmlFor="city">City *</label>
        <input
          type="text"
          id="city"
          name="city"
          value={formData.city}
          onChange={handleChange}
          required
          disabled={isSubmitting}
        />
      </div>

      <div className="form-group">
        <label htmlFor="state">State *</label>
        <input
          type="text"
          id="state"
          name="state"
          value={formData.state}
          onChange={handleChange}
          required
          disabled={isSubmitting}
        />
      </div>

      <div className="form-group">
        <label htmlFor="telephone">Telephone *</label>
        <input
          type="tel"
          id="telephone"
          name="telephone"
          value={formData.telephone}
          onChange={handleChange}
          required
          disabled={isSubmitting}
        />
      </div>

      <div className="form-group">
        <label htmlFor="claimDescription">Claim Description *</label>
        <textarea
          id="claimDescription"
          name="claimDescription"
          value={formData.claimDescription}
          onChange={handleChange}
          required
          disabled={isSubmitting}
          rows={4}
        />
      </div>

      <div className="form-group">
        <label htmlFor="dateOfIssue">Date of Issue *</label>
        <input
          type="datetime-local"
          id="dateOfIssue"
          name="dateOfIssue"
          value={formData.dateOfIssue}
          onChange={handleChange}
          required
          disabled={isSubmitting}
        />
      </div>

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Submitting...' : 'Submit Claim'}
      </button>
    </form>
  );
};
