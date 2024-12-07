import React, { useState, useEffect } from 'react';
import '../css/pages/second_step_sign_in.css';
import { useNavigate } from 'react-router-dom';
import AccordionContainer from '../components/signin/AccordionContainer';

export const SecondStepSignIn = () => {

  const { VITE_API_BACKEND, VITE_BACKEND_ENDPOINT } = import.meta.env
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false); // Estado para mostrar/ocultar contraseña
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); // Para confirmar contraseña

  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
    gender: '',
    first_name: '',
    last_name: '',
    aceptar: false
  });
  const [error, setError] = useState(''); // Estado para el mensaje de error

  const handleChange = (e) => {
    const { id, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [id]: type === 'checkbox' ? checked : value
    });
    if (error) setError(''); // Limpia el error al cambiar cualquier campo
  };

  useEffect(() => {
    const savedEmail = localStorage.getItem('userEmail');
    if (!savedEmail) {
      setError('El correo electrónico no está definido. Vuelve al paso anterior.');
    } else {
      setFormData((prevData) => ({ ...prevData, email: savedEmail }));
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { email, password, confirmPassword, gender, first_name, last_name, aceptar } = formData;


    if (!email) {
      setError('El correo electrónico no está definido. Vuelve al paso anterior.');
      return;
    }
    // Validaciones básicas
    if (!password || !confirmPassword || !gender || !first_name || !last_name || !aceptar) {
      setError('Por favor, completa todos los campos y acepta la política de privacidad.');
      return;
    }

    // Verificar si la contraseña es suficientemente fuerte
    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.');
      return;
    }

    // Verificar si las contraseñas coinciden
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    try {
      // Almacenar datos en la base de datos (o enviarlos al backend)
      const userData = { email: formData.email, password, gender, first_name, last_name };
      const registerResponse = await fetch(`${VITE_API_BACKEND}${VITE_BACKEND_ENDPOINT}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      if (!registerResponse.ok) {
        throw new Error('Error al registrar al usuario.');
      }

      // Realizar inicio de sesión automático
      const loginResponse = await fetch(`${VITE_API_BACKEND}${VITE_BACKEND_ENDPOINT}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, password }),
      });

      if (!loginResponse.ok) {
        throw new Error('Error al iniciar sesión automáticamente.');
      }

      const loginData = await loginResponse.json();
      localStorage.setItem('authToken', loginData.token); // Almacena el token en localStorage

      // Redirigir al perfil
      navigate('/profile');
    } catch (error) {
      console.error('Error en el registro o inicio de sesión automático:', error);
      setError('Hubo un problema al completar el registro. Intenta nuevamente.');
    }
  };



  const accordionData = [
    { titulo: 'Sección 1', contenido: 'Contenido de la sección 1' },
    { titulo: 'Sección 2', contenido: 'Contenido de la sección 2' }
  ];

  return (
    <section className="second-step-sign-in">
      <div className="contenedor second-step-sign-in-container">
        <div className="header">
          <h2>CREAR UNA CUENTA</h2>
        </div>
        <div className="registro-proceso">
          <div className="progreso">
            <p>Proceso del registro (2/3)</p>
          </div>
          <form onSubmit={handleSubmit} className="signUpForm">
            <div className="inputField">
              <div className="input-password">
                <label  className='password_signIn' htmlFor="password">Contraseña</label>
                <div className="passwordContainerSignIn">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="inputSignUp_Header"
                    placeholder="Introduce tu contraseña"
                  />
                  <button
                    type="button"
                    className="togglePassword"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <span className="material-symbols-outlined">
                      {showPassword ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>


                <div className="inputField">
                  <div className="input-password">
                    <label className='password_signIn' htmlFor="confirmPassword">Confirmar Contraseña</label>
                    <div className="passwordContainerSignIn">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        id="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="inputSignUp_Header"
                        placeholder="Repite tu contraseña"
                      />
                      <button
                        type="button"
                        className="togglePassword"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        <span className="material-symbols-outlined">
                          {showConfirmPassword ? "visibility_off" : "visibility"}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </form>

        </div>
        <div className="informacion-adicional">
          <div className="progreso-info">
            <p>Progreso del registro</p>
          </div>
          <div className="campos">
            <div className="campo">
              <label htmlFor="genero">Género</label>
              <select
                id="gender"
                className="input-field"
                value={formData.gender}
                onChange={handleChange}
              >
                <option value="">Seleccione...</option>
                <option value="masculino">Masculino</option>
                <option value="femenino">Femenino</option>
                <option value="otro">Otro</option>
              </select>
            </div>
            <div className="campo">
              <label htmlFor="nombre">Nombre</label>
              <input
                type="text"
                id="first_name"
                className="input-field"
                value={formData.first_name}
                onChange={handleChange}
              />
            </div>
            <div className="campo">
              <label htmlFor="apellido">Apellido</label>
              <input
                type="text"
                id="last_name"
                className="input-field"
                value={formData.last_name}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>
        <div className="politica-privacidad">
          <input
            className='checkbox-terms'
            type="checkbox"
            id="aceptar"
            checked={formData.aceptar}
            onChange={handleChange}
          />
          <label htmlFor="aceptar">Acepto la política de privacidad</label>
        </div>
        <div className="boton-continuar">
          <button onClick={handleSubmit} className="submit-button2">
            Continuar
          </button>
        </div>
      </div>
      <AccordionContainer data={accordionData} />
    </section>
  );
};

export default SecondStepSignIn;