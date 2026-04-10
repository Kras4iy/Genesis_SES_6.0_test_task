const defaultMessage = 'Invalid input: ';

export const validateEmail = (email: string) => {
  if (!email) {
    return { valid: false, message: defaultMessage + 'Email is required.' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { valid: false, message: defaultMessage + 'Invalid email format.' };
  }

  if (email.length > 255) {
    return { valid: false, message: defaultMessage + 'Email must be less than 255 characters.' };
  }

  return { valid: true };
}

const subscribeValidation = (data: { email?: string | null, repo?: string | null }) => {
  const { email, repo } = data;

  const emailValidation = validateEmail(email || '');
  
  if (!emailValidation.valid) {
    return emailValidation;
  }

  if (!repo) {
    return { valid: false, message: defaultMessage + 'Repository is required.' };
  }

  if (repo.split('/').length !== 2) {
    return { valid: false, message: defaultMessage + 'Repository must be in the format "owner/repo".' };
  }

  if (repo.length > 255) {
    return { valid: false, message: defaultMessage + 'Repository must be less than 255 characters.' };
  }

  return { valid: true };
}

export default subscribeValidation;