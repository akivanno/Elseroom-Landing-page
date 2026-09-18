document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const modal = document.getElementById('waitlist-modal');
  const openModalBtn = document.getElementById('open-waitlist-btn');
  const closeModalBtn = document.querySelector('.close-modal-btn');
  const heroEmailInput = document.getElementById('hero-email');
  const workEmailInput = document.getElementById('work_email');
  const form = document.getElementById('waitlist-form');
  const checkboxOptions = document.querySelectorAll('input[name="work_to_handle"]');
  const checkboxError = document.getElementById('checkbox-error');
  const modalBody = document.getElementById('modal-body-content');
  const modalSuccess = document.getElementById('modal-success-content');
  const closeSuccessBtn = document.querySelector('.close-success-btn');
  const submitBtn = document.getElementById('submit-form-btn');

  // URL Parameters for tracking
  const getUrlParams = () => {
    const params = new URLSearchParams(window.location.search);
    return {
      utm_source: params.get('utm_source') || '',
      utm_medium: params.get('utm_medium') || '',
      utm_campaign: params.get('utm_campaign') || '',
      utm_content: params.get('utm_content') || '',
      utm_term: params.get('utm_term') || '',
      referrer_url: document.referrer || '',
      landing_variant: params.get('variant') || 'v1'
    };
  };

  // Modal logic
  const openModal = () => {
    // Pre-fill email from hero section
    if (heroEmailInput.value) {
      workEmailInput.value = heroEmailInput.value;
    }
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
  };

  const closeModal = () => {
    modal.classList.add('hidden');
    document.body.style.overflow = '';
  };

  openModalBtn.addEventListener('click', openModal);
  closeModalBtn.addEventListener('click', closeModal);
  closeSuccessBtn.addEventListener('click', closeModal);

  // Close modal when clicking outside
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });

  // Checkbox validation logic (min 1, max 3)
  const validateCheckboxes = () => {
    let checkedCount = 0;
    checkboxOptions.forEach(cb => {
      if (cb.checked) checkedCount++;
    });

    if (checkedCount < 1 || checkedCount > 3) {
      checkboxError.style.display = 'block';
      return false;
    } else {
      checkboxError.style.display = 'none';
      return true;
    }
  };

  checkboxOptions.forEach(cb => {
    cb.addEventListener('change', validateCheckboxes);
  });

  // Form submission
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!validateCheckboxes()) {
      return;
    }

    // Collect data
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    
    // Handle multi-select checkboxes
    data.work_to_handle = Array.from(checkboxOptions)
      .filter(cb => cb.checked)
      .map(cb => cb.value);

    // Add hidden tracking fields
    const trackingData = getUrlParams();
    Object.assign(data, trackingData);

    // Add timestamp
    data.signup_timestamp = new Date().toISOString();

    // UI state
    const originalBtnText = submitBtn.innerText;
    submitBtn.innerText = 'Submitting...';
    submitBtn.disabled = true;

    try {
      const response = await fetch('https://lvstudio.app.n8n.cloud/webhook/subscribe-to-waitlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (response.ok || response.status === 200) {
        // Show success state
        modalBody.classList.add('hidden');
        modalSuccess.classList.remove('hidden');
      } else {
        alert('Something went wrong. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Could not connect to the server. Please try again later.');
    } finally {
      submitBtn.innerText = originalBtnText;
      submitBtn.disabled = false;
    }
  });
});
