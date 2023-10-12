export const tel = /^\d{8,11}$/;
export const phone = /^01([016789]?)(\d{3,4})(\d{4})$/;
export const month = /^[0-9]{4}-(0[1-9]|1[012])/;
export const datetime =
  /^[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1]) (2[0-3]|[01][0-9]):[0-5][0-9]:[0-5][0-9]$/;
export const password = /^[\da-zA-Z!@#$%^&*()?+-_~=/]{6,40}$/;
