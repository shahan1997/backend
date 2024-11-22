// Utility function to structure the response
const createResponse = (code, status, message, data = null) => {
  return {
    code, // HTTP status code
    status, // Boolean: true for success, false for error
    message, // String message describing the result
    data, // The data being returned (can be null)
  };
};

module.exports = { createResponse };
