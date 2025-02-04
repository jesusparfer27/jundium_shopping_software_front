import React, { useEffect, useState, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { HeaderContext } from '../context/HeaderContext';
import { useUser } from '../hooks/useUser';
import { ProductContext } from './admin_page/context/ProductContext';
import ProfileImage from '../components/profile-header/ProfileHeader';
import '../css/pages/profile.css';

export const Profile = () => {
    // Estados locales para manejar datos y comportamiento del componente
    const [wishlistItems, setWishlistItems] = useState([]); // Lista de artículos en la lista de deseos
    const [orderItems, setOrderItems] = useState([]); // Lista de pedidos
    const [isAccordionOpen, setIsAccordionOpen] = useState(false); // Controla el estado del acordeón
    const [isUserLoaded, setIsUserLoaded] = useState(false); // Indica si los datos del usuario se cargaron
    const [isDirty, setIsDirty] = useState(false); // Indica si hay cambios pendientes de guardar
    const [saveStatus, setSaveStatus] = useState(null); // Estado del guardado de cambios

    // Acceso al contexto de productos
    const { hasDiscount, renderPriceWithDiscount } = useContext(ProductContext);
    // Acceso al contexto de usuario
    const { user, setUser, loading, error, fetchUserDetails, setLoading, data, setData } = useUser();
    // Acceso al contexto del header
    const { openMenu } = useContext(HeaderContext);

    // Navegación programática
    const navigate = useNavigate();

    const { VITE_API_BACKEND, VITE_IMAGES_BASE_URL, VITE_BACKEND_ENDPOINT, VITE_IMAGE } = import.meta.env;

    // Redirige al usuario si no hay un token de autenticación
    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            navigate('/error');
        }
    }, [navigate]);

    // Carga de datos desde la API
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const response = await fetchDataFromAPI();
                setData(response);
            } catch (error) {
                console.error("Error al cargar datos:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Carga inicial de los detalles del usuario
    useEffect(() => {
        const loadUser = async () => {
            const token = localStorage.getItem('authToken');
            if (!token || user) return;

            try {
                await fetchUserDetails();
                setIsUserLoaded(true);
            } catch (err) {
                console.error('Error fetching user data:', err);
                openMenu('login'); // Abre el menú de login en caso de error
            }
        };

        loadUser();
    }, [user, fetchUserDetails, openMenu]);

    // Función para obtener los artículos de la lista de deseos
    const fetchWishlistItems = useCallback(async () => {
        if (!user) return;

        try {
            const token = localStorage.getItem('authToken');
            console.log("Token del usuario logueado:", token);

            const response = await fetch(`${VITE_API_BACKEND}${VITE_BACKEND_ENDPOINT}/wishlist`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error('Error fetching wishlist items');
            }

            const data = await response.json();
            console.log("esto es data:", data);

            if (Array.isArray(data.items)) {
                setWishlistItems(data.items);
            } else {
                console.error('La respuesta de wishlist no contiene un arreglo de artículos:', data);
            }
        } catch (error) {
            console.error('Error al obtener la wishlist:', error);
        }
    }, [VITE_API_BACKEND, VITE_BACKEND_ENDPOINT, user]);

    // Llama a la función de carga de wishlist al montar el componente
    useEffect(() => {
        fetchWishlistItems();
    }, [fetchWishlistItems]);

    // Navegación a diferentes páginas
    const handleNavigateToWishlist = () => {
        navigate('/wish-list');
    };

    const handleNavigateToAdmin = () => {
        navigate('/admin');
    };

    const handleNavigateToProducts = () => {
        navigate('/products');
    };

    // Obtiene los primeros 2 artículos visibles de la wishlist
    const visibleItems = wishlistItems.slice(0, 2);
    const remainingCount = wishlistItems.length - 2;

    // Maneja errores en la carga de usuario
    useEffect(() => {
        if (error) {
            console.error('Error fetching user data:', error);
            openMenu('login');
        }
    }, [error, openMenu]);

    // Actualiza los datos del usuario en el estado
    const handleUserInfoChange = (e) => {
        const { name, value, checked, type } = e.target;
        setIsDirty(true); // Marca como datos modificados

        console.log(`Cambio en el campo: ${name} -> Valor: ${type === 'checkbox' ? checked : value}`);

        setUser((prevUser) => {
            // Manejo de campos anidados como preferencias de contacto
            if (name.startsWith('contact_preferences')) {
                const contactType = name.split('.')[1];
                return {
                    ...prevUser,
                    contact_preferences: {
                        ...prevUser.contact_preferences,
                        [contactType]: checked,
                    },
                };
            }

            // Manejo de la fecha de nacimiento
            if (name.startsWith('birth_date')) {
                const datePart = name.split('.')[1];
                return {
                    ...prevUser,
                    birth_date: {
                        ...prevUser.birth_date,
                        [datePart]: datePart === 'month' || datePart === 'day' || datePart === 'year'
                            ? parseInt(value, 10) || ''
                            : value,
                    },
                };
            }

            if (name === 'gender') {
                return {
                    ...prevUser,
                    gender: value,
                };
            }

            console.log("Género del usuario:", user?.gender);


            if (name === 'country') {
                return {
                    ...prevUser,
                    country: value,
                };
            }

            if (name === 'phoneNumber') {
                return {
                    ...prevUser,
                    phone_number: value,
                };
            }

            if (name === 'city' || name === 'street' || name === 'postal_code') {
                return {
                    ...prevUser,
                    location: {
                        ...prevUser.location,
                        [name]: value,
                    },
                };
            }

            // Actualización directa de otros campos
            return {
                ...prevUser,
                [name]: value
            };
        });
    };


    const handleSaveChanges = async () => {
        const token = localStorage.getItem('authToken');

        console.log("Token en localStorage:", token);

        if (!token || loading || !isDirty) {
            return;
        }

        console.log("Datos que se enviarán:", user);

        try {
            const response = await fetch(`${VITE_API_BACKEND}${VITE_BACKEND_ENDPOINT}/me/update`, {
                method: 'PATCH',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(user),
            });

            if (!response.ok) throw new Error('Error al guardar los cambios');

            const updatedUser = await response.json();
            console.log('Datos de usuario actualizados:', updatedUser); 

            localStorage.setItem('user', JSON.stringify(updatedUser));  // Actualiza localStorage

            setUser(updatedUser);
            setIsDirty(false);
            setSaveStatus({ success: true, message: 'Cambios guardados exitosamente' });
            await fetchUserDetails(); // Refresca los datos del usuario
        } catch (err) {
            console.error('Error al guardar cambios:', err);
            setSaveStatus({ success: false, message: 'Hubo un error al guardar los cambios' });
        }
    };

    // Cierra sesión del usuario
    const handleLogout = () => {
        localStorage.removeItem("user");
        localStorage.removeItem('authToken');
        console.log("Sesión eliminada correctamente de localStorage.");
        setUser(null);
        navigate('/');
    };

    console.log("Usuario logeado:", user);
    console.log("Nombre del usuario logeado:", user?.first_name);

    // Verifica si el usuario es administrador
    const isAdmin = user?.permissions &&
        user.permissions.manage_users &&
        user.permissions.manage_products &&
        user.permissions.view_reports &&
        user.permissions.manage_orders;

    return (
        <section className="profile-section">
            {loading && <div>Cargando datos del usuario...</div>}
            {error && <div>Error al cargar los datos del usuario: {error.message}</div>}
            <ProfileImage initials="IN" userName={`${user?.first_name || ''} ${user?.last_name || ''}`} />
            <div className="userProfile">
                <div className="profile-info">
                    <div className="headerProfile">Mi perfil:</div>
                    <div className="required-fields">Campos obligatorios</div>
                    <div className="input-group">
                        <div className="inputProfile_Container">
                            <div className="inputProfileContainer_Container">
                                <div className="input-field_profile">
                                    <label>Género</label>
                                    <select
                                        name="gender"
                                        className="inputProfile"
                                        value={user?.gender || ''}
                                        onChange={handleUserInfoChange}
                                    >
                                        <option value="">Seleccionar</option>
                                        <option value="Masculino">Masculino</option>
                                        <option value="Femenino">Femenino</option>
                                        <option value="Otro">Otro</option>
                                    </select>



                                </div>
                                <div className="input-field_profile">
                                    <label>Nombre</label>
                                    <input
                                        type="text"
                                        name="first_name"
                                        className='inputProfile'
                                        value={user?.first_name || ''}
                                        onChange={handleUserInfoChange}
                                    />
                                </div>
                                <div className="input-field_profile">
                                    <label>Apellido</label>
                                    <input
                                        type="text"
                                        name="last_name"
                                        className='inputProfile'
                                        value={user?.last_name || ''}
                                        onChange={handleUserInfoChange}
                                    />
                                </div>
                                <div className="input-field_profile">
                                    <label>País</label>
                                    <select
                                        name="country"
                                        className='inputProfile'
                                        value={user?.country || ''}
                                        onChange={handleUserInfoChange}
                                    >
                                        <option value="">Seleccionar</option>
                                        <option value="México">México</option>
                                        <option value="España">España</option>
                                        <option value="Otro">Otro</option>
                                    </select>
                                </div>
                                <div className="input-field_profile">
                                    <label>Numero de teléfono</label>
                                    <input
                                        type="text"
                                        name="phone_number"
                                        className='inputProfile'
                                        value={user?.phone_number || ''}
                                        onChange={handleUserInfoChange}
                                    />
                                </div>
                            </div>
                        </div>


                        <div className="accordionProfile">
                            <button
                                className="accordion-buttonLocation"
                                onClick={() => setIsAccordionOpen(!isAccordionOpen)}
                            >
                                {isAccordionOpen ? 'Ocultar ubicación' : 'Agregar ubicación'}
                            </button>
                            {isAccordionOpen && (
                                <>
                                    <div className="accordion-content active">
                                        <label className='labelFor_City' htmlFor="city">Ciudad Ciudad</label>
                                        <input
                                            type="text"
                                            id="city"
                                            name="city"
                                            placeholder="Ingresa tu ciudad"
                                            value={user?.location?.city || ''}
                                            onChange={handleUserInfoChange}
                                        />
                                    </div>
                                    <div className="accordion-content active">
                                        <label className='labelFor_City' htmlFor="street">Calle Calle</label>
                                        <input
                                            type="text"
                                            id="street"
                                            name="street"
                                            placeholder="Ingresa tu dirección"
                                            value={user?.location?.street || ''}
                                            onChange={handleUserInfoChange}
                                        />
                                    </div>
                                    <div className="accordion-content active">
                                        <label className='labelFor_City' htmlFor="postal_code">Código Postal</label>
                                        <input
                                            type="text"
                                            id="postal_code"
                                            name="postal_code"
                                            placeholder="Ingresa tu código postal"
                                            value={user?.location?.postal_code || ''}
                                            onChange={handleUserInfoChange}
                                        />
                                    </div>
                                </>
                            )}
                        </div>
                        <div className="contact-preferences">
                            <div className="contact-item">
                                <label htmlFor="email" className="contact-label">
                                    Contactable por email
                                </label>
                                <input
                                    type="checkbox"
                                    name="contact_preferences.email"
                                    checked={user?.contact_preferences?.email || false}
                                    onChange={handleUserInfoChange}
                                />
                            </div>
                            <div className="contact-item">
                                <label htmlFor="phone" className="contact-label">
                                    Contactable por teléfono
                                </label>
                                <input
                                    type="checkbox"
                                    name="contact_preferences.phone"
                                    checked={user?.contact_preferences?.phone || false}
                                    onChange={handleUserInfoChange}
                                />
                            </div>
                            <div className="contact-item">
                                <label htmlFor="whatsapp" className="contact-label">
                                    Contactable por WhatsApp
                                </label>
                                <input
                                    type="checkbox"
                                    name="contact_preferences.whatsapp"
                                    checked={user?.contact_preferences?.whatsapp || false}
                                    onChange={handleUserInfoChange}
                                />
                            </div>
                        </div>
                        <div className="birth-date_Container">
                            <div className="birth-date">
                                <div className="date-selectors">
                                    <select
                                        name="birth_date.year"
                                        value={user?.birth_date?.year || ''}
                                        onChange={handleUserInfoChange}
                                    >
                                        <option value="">Seleccionar año</option>
                                        {Array.from({ length: 100 }, (_, i) => 2024 - i).map(year => (
                                            <option key={year} value={year}>{year}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="date-selectors">
                                    <select
                                        name="birth_date.month"
                                        value={user?.birth_date?.month || ''}
                                        onChange={handleUserInfoChange}
                                    >
                                        <option value="">Seleccionar mes</option>
                                        {['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'].map((month, idx) => (
                                            <option key={idx} value={idx + 1}>{month}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="date-selectors">
                                    <select
                                        name="birth_date.day"
                                        value={user?.birth_date?.day || ''}
                                        onChange={handleUserInfoChange}
                                    >
                                        <option value="">Seleccionar día</option>
                                        {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                                            <option key={day} value={day}>{day}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>


                    <div className="submit-buttonProfile">
                        <button onClick={handleSaveChanges}>Guardar cambios</button>
                    </div>

                </div>

                <div className="order-wishlist">

                    <div className="background-containerProfile">
                        <div className="separation_div">
                            <div className="headerProfileWishlist">Lista de deseos:</div>
                        </div>
                        {wishlistItems.length > 0 ? (
                            <div className="wishlist-list">
                                {wishlistItems.slice(0, 2).map((item) => {
                                    const { product_id, variant_id } = item;
                                    const { name, price } = product_id || {};

                                    const variants = product_id?.variants || [];
                                    const selectedVariant = variants.find(variant => variant.variant_id === variant_id);
                                    const imageUrl = selectedVariant?.showing_image
                                    const fullImageUrl = imageUrl ? `${VITE_IMAGES_BASE_URL}${VITE_IMAGE}${imageUrl}` : null;
                                    const variantPrice = selectedVariant?.price || 0;
                                    const hasDiscountApplied = selectedVariant?.discount > 0;

                                    const priceToDisplay = renderPriceWithDiscount(selectedVariant);

                                    return (
                                        <div key={item._id} className="wishlist-item">
                                            {fullImageUrl ? (
                                                <img src={fullImageUrl} alt={name} />
                                            ) : (
                                                <p>Imagen no disponible</p>
                                            )}
                                            <p>{selectedVariant?.name}</p>
                                            {hasDiscountApplied ? (
                                                <>
                                                    <p className="textCard_Header discountedPrice">
                                                        {priceToDisplay}
                                                    </p>
                                                </>
                                            ) : (
                                                <p className="textCard_Header">${variantPrice.toFixed(2)}</p>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <>
                                <p className="alternative_noWishlist">No hay artículos en la lista de deseos.</p>
                                <div className="submit-buttonProfile">
                                    <button onClick={handleNavigateToProducts}>Ir a tienda</button>
                                </div>
                            </>
                        )}

                        <div className="wishlist-container">
                            <div className="wishlist-items">
                                {visibleItems.map((item, index) => (
                                    <div key={index} className="wishlist-item-summary">
                                        <p>{item.name}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {wishlistItems.length > 0 && (
                            <div className="submit-buttonProfile">
                                <button onClick={handleNavigateToWishlist}>
                                    {wishlistItems.length < 3 ? 'Ir a wish-list' : `Ver ${remainingCount} productos restantes`}
                                </button>
                            </div>
                        )}

                    </div>

                    <div className="logOut_Container">
                        <div className="logOut_blockSeparation">
                            <div className="logOut_blockContent">
                                <span>Log out</span>
                            </div>
                        </div>
                        <div className="buttonBlock">
                            <button onClick={handleLogout} className="logout-button">Cerrar sesión</button>
                        </div>
                    </div>
                    {isAdmin && (
                        <div className="admin_Container">
                            <div className="admin_blockSeparation">
                                <div className="admin_blockContent">
                                    <span>Admin</span>
                                </div>
                            </div>
                            <div className="buttonBlock">
                                <button onClick={handleNavigateToAdmin} className="logout-button">Admin panel</button>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </section>
    );
};

export default Profile;


