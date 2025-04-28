const validateSignupData = (req) => {
  const { firstName, lastName, emailId, password } = req.body;
  if (!firstName || !lastName || !emailId || !password) {
    throw new Error("All fields are required");
  }
  return true;
};

const validateProfileData = (data) => {
  const ALLOWED_FIELDS = [
    "firstName",
    "lastName",
    "age",
    "gender",
    "about",
    "photoUrl",
    "skills",
  ];
  const isEditAllowed = Object.keys(data).every((field) =>
    ALLOWED_FIELDS.includes(field)
  );
  return isEditAllowed;
};
module.exports = {
  validateSignupData,
  validateProfileData,
};
