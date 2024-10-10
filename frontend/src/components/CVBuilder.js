// components/CVBuilder.js
import React, { useState } from 'react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';

function CVBuilder() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    experience: '',
  });
  const [cvModel, setCvModel] = useState('');
  const stripe = useStripe();
  const elements = useElements();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (e.target.name === 'experience') {
      setCvModel(e.target.value === 'junior' ? 'junior' : 'senior');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      // Handle payment logic here
      if (!stripe || !elements) {
        return;
      }

      const result = await stripe.createPaymentMethod({
        type: 'card',
        card: elements.getElement(CardElement),
        billing_details: {
          name: formData.name,
          email: formData.email,
        },
      });

      if (result.error) {
        console.error(result.error.message);
      } else {
        // Send payment method id to your server
        const response = await fetch('/api/charge', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            payment_method_id: result.paymentMethod.id,
            amount: 1000, // $10 in cents
          }),
        });

        const paymentResult = await response.json();

        if (paymentResult.success) {
          setStep(3);
        } else {
          console.error(paymentResult.error);
        }
      }
    }
  };

  const containerStyle = {
    minHeight: '100vh',
    backgroundColor: '#f7fafc',
    padding: '3rem 0',
  };

  const cardStyle = {
    maxWidth: '400px',
    margin: '0 auto',
    backgroundColor: 'white',
    borderRadius: '0.5rem',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
    overflow: 'hidden',
  };

  const formStyle = {
    padding: '1.5rem',
  };

  const titleStyle = {
    fontSize: '1.5rem',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: '1.5rem',
  };

  const inputStyle = {
    width: '100%',
    padding: '0.75rem',
    borderRadius: '0.375rem',
    border: '1px solid #cbd5e0',
    marginBottom: '1rem',
    outline: 'none',
    transition: 'border-color 0.2s',
  };

  const selectStyle = {
    ...inputStyle,
  };

  const buttonStyle = {
    width: '100%',
    backgroundColor: '#3182ce',
    color: 'white',
    padding: '0.75rem',
    borderRadius: '0.375rem',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  };

  const buttonHoverStyle = {
    ...buttonStyle,
    backgroundColor: '#2b6cb0',
  };

  const cardElementStyle = {
    base: {
      fontSize: '16px',
      color: '#424770',
      '::placeholder': {
        color: '#aab7c4',
      },
    },
    invalid: {
      color: '#9e2146',
    },
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <div style={formStyle}>
          <h2 style={titleStyle}>Build Your CV</h2>
          {step === 1 && (
            <form onSubmit={handleSubmit}>
              <div>
                <label htmlFor="name" style={{ display: 'block', marginBottom: '0.5rem', color: '#4a5568' }}>Full Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  style={inputStyle}
                  required
                />
              </div>
              <div>
                <label htmlFor="email" style={{ display: 'block', marginBottom: '0.5rem', color: '#4a5568' }}>Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  style={inputStyle}
                  required
                />
              </div>
              <div>
                <label htmlFor="experience" style={{ display: 'block', marginBottom: '0.5rem', color: '#4a5568' }}>Experience Level</label>
                <select
                  id="experience"
                  name="experience"
                  value={formData.experience}
                  onChange={handleChange}
                  style={selectStyle}
                  required
                >
                  <option value="">Select experience</option>
                  <option value="junior">Less than 10 years</option>
                  <option value="senior">10 years or more</option>
                </select>
              </div>
              <button type="submit" style={buttonStyle}>Continue</button>
            </form>
          )}
          {step === 2 && (
            <form onSubmit={handleSubmit}>
              <p style={{ marginBottom: '1rem' }}>Selected CV Model: {cvModel === 'junior' ? 'Junior' : 'Senior'}</p>
              <div>
                <label htmlFor="card-element" style={{ display: 'block', marginBottom: '0.5rem', color: '#4a5568' }}>Credit or debit card</label>
                <CardElement
                  id="card-element"
                  options={cardElementStyle}
                />
              </div>
              <button type="submit" style={buttonStyle}>Pay $10 and Download CV</button>
            </form>
          )}
          {step === 3 && (
            <div style={{ textAlign: 'center' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>Thank You!</h3>
              <p style={{ marginBottom: '1rem' }}>Your payment was successful. Your CV is now ready for download.</p>
              <a
                href={`/api/download-cv?model=${cvModel}`}
                download
                style={{
                  display: 'inline-block',
                  backgroundColor: '#48bb78',
                  color: 'white',
                  padding: '0.5rem 1.5rem',
                  borderRadius: '0.375rem',
                  textDecoration: 'none',
                  transition: 'background-color 0.2s',
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#38a169'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#48bb78'}
              >
                Download CV
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CVBuilder;
