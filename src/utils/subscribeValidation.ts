const subscribeValidation = (data: { email?: string | null, repo?: string | null }) => {
  const defaultMessage = 'Invalid input: ';
  const { email, repo } = data;

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