import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import '../style/UserOrders.css'

const API = 'http://localhost:8080'

const UserOrders = () => {
  const [pedidos, setPedidos] = useState([])
  const [usuario, setUsuario] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Extraemos el token y la autenticación desde Redux.
  // Gracias a Redux Persist, esto sobrevive a las recargas del navegador automáticamente.
  const { token, isAuthenticated } = useSelector((state) => state.auth)

  useEffect(() => {
    const fetchData = async () => {
      if (!isAuthenticated || !token) {
        setError('Tenés que iniciar sesión para ver tus pedidos.')
        setLoading(false)
        return
      }

      try {
        // 1. Pedimos los datos del usuario
        const userRes = await fetch(`${API}/api/usuarios/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (userRes.ok) {
            const userData = await userRes.json();
            setUsuario(userData);
        }

        // 2. Pedimos los pedidos
        const res = await fetch(`${API}/api/pedidos/mis-pedidos`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!res.ok) {
          throw new Error('No se pudieron cargar los pedidos.');
        }

        const data = await res.json();
        setPedidos(Array.isArray(data) ? data : []);
        
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchData()
  }, [token, isAuthenticated])

  if (loading) {
    return <p className="loading">Cargando pedidos...</p>
  }

  if (error) {
    return (
      <div className="orders-container">
        <h2>Mis pedidos</h2>
        <p className="error">{error}</p>
        <Link to="/login" className="orders-link">
          Ir a iniciar sesión
        </Link>
      </div>
    )
  }

  return (
    <div className="orders-container">
      <h2>Mis pedidos</h2>

      {usuario && (
        <div className="user-info">
          <p><strong>Usuario:</strong> {usuario.nombre} {usuario.apellido}</p>
          <p><strong>Email:</strong> {usuario.email}</p>
        </div>
      )}

      {pedidos.length === 0 ? (
        <p className="empty-orders">Todavía no tenés pedidos realizados.</p>
      ) : (
        <div className="orders-list">
          {pedidos.map((pedido) => (
            <div className="order-card" key={pedido.id}>
              <h3>Pedido #{pedido.id}</h3>

              <p>
                <strong>Fecha:</strong> {pedido.fecha || 'Sin fecha'}
              </p>

              <p>
                <strong>Estado:</strong> {pedido.estado || 'Sin estado'}
              </p>

              <p>
                <strong>Total:</strong> ${pedido.total || 0}
              </p>

              {pedido.detalles && pedido.detalles.length > 0 && (
                <div className="order-items">
                  <strong>Productos:</strong>
                  <ul>
                    {pedido.detalles.map((item, index) => (
                      <li key={index}>
                        {item.nombreProducto || item.nombre || 'Producto'} - Cantidad:{' '}
                        {item.cantidad || 1}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default UserOrders