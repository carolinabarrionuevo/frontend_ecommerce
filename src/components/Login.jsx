import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, clearError } from '../store/slices/authSlice';
import '../style/Form.css';

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { isAuthenticated, isLoading, error } = useSelector(state => state.auth);
  
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    try {
      const res = await fetch(`${API}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      const data = await res.text()

      if (!res.ok) throw new Error(data || 'Credenciales inválidas')

      localStorage.setItem('jwt_token', data)
      localStorage.setItem('user_role', 'USER');

      window.location.href = '/';
      // Al usar window.location.href = '/', obligamos 
      // al navegador a recargar la página completa. Esto garantiza que:
      // El Header vuelva a leer el localStorage.
      // Como ahora el token está guardado como jwt_token, 
      // el Header lo encontrará y cambiará mágicamente los
      // botones de "Iniciar Sesión" por los de "Carrito" y "Cerrar Sesión".
      //antes estaba navigate('/')

    } catch (err) {
      setError(err.message)
    }
  }, [isAuthenticated, navigate];

  // Limpiar errores si el componente se desmonta
  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(loginUser(credentials));
  };

  return (
    <div className="form-container">
      <form onSubmit={handleSubmit} className="form">
        <h2>Iniciar Sesión</h2>
        
        {error && <p className="form-error">{error}</p>}
        
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={credentials.email}
          onChange={handleChange}
          required
          disabled={isLoading}
        />
        <input
          type="password"
          name="password"
          placeholder="Contraseña"
          value={credentials.password}
          onChange={handleChange}
          required
          disabled={isLoading}
        />
        
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Ingresando...' : 'Ingresar'}
        </button>
        
        <p className="form-link">
          ¿No tenés cuenta? <Link to="/register">Registrate</Link>
        </p>
      </form>
    </div>
  );
}

export default Login;