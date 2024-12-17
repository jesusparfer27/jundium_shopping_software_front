import React, { useEffect, useState, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/pages/profile.css';
import ProfileImage from '../components/profile-header/ProfileHeader';
import { HeaderContext } from '../context/HeaderContext';
import { useUser } from '../hooks/useUser';

export const Profile = () => {
    const [wishlistItems, setWishlistItems] = useState([]);
    const [orderItems, setOrderItems] = useState([]);
    const [isAccordionOpen, setIsAccordionOpen] = useState(false);
    const { openMenu } = useContext(HeaderContext);
    const navigate = useNavigate();
    const { user, setUser, loading, error, fetchUserDetails } = useUser();
    const [isUserLoaded, setIsUserLoaded] = useState(false);
    const { VITE_API_BACKEND, VITE_IMAGES_BASE_URL, VITE_BACKEND_ENDPOINT, VITE_IMAGE } = import.meta.env;
    const [isDirty, setIsDirty] = useState(false);
    const [saveStatus, setSaveStatus] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            navigate('/error');
        }
    }, [navigate]);

    useEffect(() => {
        const loadUser = async () => {
            const token = localStorage.getItem('authToken');
            if (!token || user) return;

            try {
                await fetchUserDetails();
                setIsUserLoaded(true);
            } catch (err) {
                console.error('Error fetching user data:', err);
                openMenu('login');
            }
        };

        loadUser();
    }, [user, fetchUserDetails, openMenu]);

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

    useEffect(() => {
        fetchWishlistItems();
    }, [fetchWishlistItems]);

    const handleNavigateToWishlist = () => {
        navigate('/wish-list');
    };

    const handleNavigateToProducts = () => {
        navigate('/products');
    };

    const visibleItems = wishlistItems.slice(0, 2);
    const remainingCount = wishlistItems.length - 2;

    useEffect(() => {
        const fetchOrderItems = async () => {
            const token = localStorage.getItem('authToken');
            if (!token) return;

            try {
                const response = await fetch(`${VITE_API_BACKEND}${VITE_BACKEND_ENDPOINT}/orders`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                const data = await response.json();
                setOrderItems(data);
                console.log("Datos de los pedidos del usuario logueado:", data);
            } catch (err) {
                console.error('Error al cargar los pedidos:', err);
            }
        };

        fetchOrderItems();
    }, [VITE_API_BACKEND, VITE_BACKEND_ENDPOINT]);

    useEffect(() => {
        if (error) {
            console.error('Error fetching user data:', error);
            openMenu('login');
        }
    }, [error, openMenu]);

    const handleUserInfoChange = (e) => {
        const { name, value, checked, type } = e.target;
        setIsDirty(true);

        console.log(`Cambio en el campo: ${name} -> Valor: ${type === 'checkbox' ? checked : value}`);

        setUser((prevUser) => {
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

            return {
                ...prevUser,
                [name]: value
            };
        });
    };

    const handleSaveChanges = async () => {
        const token = localStorage.getItem('authToken');
        if (!token || loading || !isDirty) return;
 
        console.log("Guardando cambios con los siguientes datos del usuario:", user);

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

            localStorage.setItem('user', JSON.stringify(updatedUser));

            setUser(updatedUser);
            setIsDirty(false);
            setSaveStatus({ success: true, message: 'Cambios guardados exitosamente' });
            await fetchUserDetails();
        } catch (err) {
            console.error('Error al guardar cambios:', err);
            setSaveStatus({ success: false, message: 'Hubo un error al guardar los cambios' });
        }
    };



    const handleLogout = () => {
        localStorage.removeItem("user");
        localStorage.removeItem('authToken');
        console.log("Sesión eliminada correctamente de localStorage.");
        navigate('/');
    };

    console.log("Usuario logeado:", user);
    console.log("Nombre del usuario logeado:", user?.first_name);


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
                                        className='inputProfile'
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
                                    const imageUrl = selectedVariant?.image ? selectedVariant.image[0] : null;
                                    const fullImageUrl = imageUrl ? `${VITE_IMAGES_BASE_URL}${VITE_IMAGE}${imageUrl}` : null;

                                    return (
                                        <div key={item._id} className="wishlist-item">
                                            {fullImageUrl ? (
                                                <img src={fullImageUrl} alt={name} />
                                            ) : (
                                                <p>Imagen no disponible</p>
                                            )}
                                            <p>{name}</p>
                                            <p>{selectedVariant?.price} $</p>
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
                </div>
            </div>
        </section>
    );
};

export default Profile;
