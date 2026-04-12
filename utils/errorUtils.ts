/**
 * Utilitario para procesar errores de la API (Axios) y devolver
 * mensajes amigables y errores por campo para la UI.
 */

export interface ParsedError {
  message: string;
  errors: Record<string, string>;
}

export const parseApiError = (error: any): ParsedError => {
  const result: ParsedError = {
    message: 'Ha ocurrido un error inesperado. Por favor intenta de nuevo.',
    errors: {},
  };

  if (!error) return result;

  // Si es un error de Axios con respuesta del servidor
  if (error.response) {
    const data = error.response.data;
    const status = error.response.status;

    // Manejar errores de validación de campos (400 Bad Request / 422 Unprocessable Entity)
    if (status === 400 || status === 422 || status === 401) {
      if (typeof data === 'object' && data !== null) {
        
        // 1. Mensaje general (detail o non_field_errors)
        if (data.detail) {
          result.message = data.detail;
        } else if (data.non_field_errors) {
          result.message = Array.isArray(data.non_field_errors) 
            ? data.non_field_errors[0] 
            : data.non_field_errors;
        }

        // 2. Errores por campo
        Object.keys(data).forEach((key) => {
          if (key !== 'detail' && key !== 'non_field_errors') {
            const fieldError = data[key];
            result.errors[key] = Array.isArray(fieldError) ? fieldError[0] : fieldError;
          }
        });

        // Si es 401 y no hay mensaje específico, mensaje de credenciales
        if (status === 401 && result.message === 'Ha ocurrido un error inesperado. Por favor intenta de nuevo.') {
          result.message = 'Credenciales incorrectas. Por favor verifica tus datos.';
        }
      }
    } else if (status === 404) {
      result.message = 'El recurso solicitado no existe.';
    } else if (status >= 500) {
      result.message = 'Error en el servidor. Estamos trabajando para solucionarlo.';
    }
  } else if (error.request) {
    // Error de red (sin respuesta del servidor)
    result.message = 'No se ha podido conectar con el servidor. Verifica tu conexión a internet.';
  } else {
    // Otros errores (configuración, etc.)
    result.message = error.message || result.message;
  }

  return result;
};
