import React from 'react';
import '../../css/components/profile-header/profileheader.css';
import pictureProfile from '../../assets/profile-picture/example-profile-picture.jpg'

const ProfileImage = ({ initials, userName, isAdmin }) => {
    // Componente que muestra la imagen de perfil del usuario con un contenedor decorativo.
    // Si el usuario es administrador, muestra 'ADMIN' en lugar de las iniciales.
    
    const displayInitials = isAdmin ? 'ADMIN' : initials;
    // Determina si mostrar 'ADMIN' o las iniciales del usuario basado en el rol.

    return (
        <div className="profile-image">
            <img className='imgHeader_Profile' src={pictureProfile} alt="Perfil" />
            <div className="containerPadding_Image"></div>
            <div className="backgroundPadding_imageContainer">
                <div className="backgroundPadding_Image">
                    <div className="profile-initials">{displayInitials}</div>
                </div>
            </div>
        </div>
    );
};

export default ProfileImage;
