import { check } from "express-validator";

class Validation {
  static registerValidation = [
    check("name").notEmpty().withMessage("Name is required"),
    check("password")
      .notEmpty()
      .withMessage("Password is required")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
    check("email")
      .isEmail()
      .withMessage("Please provide a valid email address"), // Email validation
  ];

  static loginValidation = [
    check("email")
      .isEmail()
      .withMessage("Please provide a valid email address"),
    check("password")
      .notEmpty()
      .withMessage("Password is required")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
  ];

  static passwordChangeValidation = [
    check("oldPassword").notEmpty().withMessage("Old password is required"),
    check("newPassword")
      .notEmpty()
      .withMessage("New password is required")
      .isLength({ min: 6 })
      .withMessage("New password must be at least 6 characters long"), // New password validation
  ];
}

export { Validation };
