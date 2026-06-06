/**
 * Basic email regex validator
 */
export const isValidEmail = (email) => {
  const re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  return re.test(String(email).toLowerCase());
};

/**
 * Validate Register form inputs
 */
export const validateRegister = (name, email, password, confirmPassword) => {
  const errors = {};

  if (!name || !name.trim()) {
    errors.name = 'Name is required';
  }

  if (!email || !email.trim()) {
    errors.email = 'Email is required';
  } else if (!isValidEmail(email)) {
    errors.email = 'Please enter a valid email address';
  }

  if (!password) {
    errors.password = 'Password is required';
  } else if (password.length < 6) {
    errors.password = 'Password must be at least 6 characters';
  }

  if (password !== confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Validate Login form inputs
 */
export const validateLogin = (email, password) => {
  const errors = {};

  if (!email || !email.trim()) {
    errors.email = 'Email is required';
  } else if (!isValidEmail(email)) {
    errors.email = 'Please enter a valid email address';
  }

  if (!password) {
    errors.password = 'Password is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Validate Task inputs
 */
export const validateTask = (title) => {
  const errors = {};

  if (!title || !title.trim()) {
    errors.title = 'Task title is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
