from app.models.user import User

def test_user_model(test_db):
    # Crear un usuario de prueba
    user = User(
        username="testuser",
        email="test@example.com",
        password="hashedpassword123",
        role="user"
    )
    
    # Agregar a la sesión y guardar en la base de datos
    test_db.add(user)
    test_db.commit()
    
    # Recuperar el usuario de la base de datos
    retrieved_user = test_db.query(User).filter(User.username == "testuser").first()
    
    # Verificar que el usuario se haya guardado correctamente
    assert retrieved_user is not None
    assert retrieved_user.username == "testuser"
    assert retrieved_user.email == "test@example.com"
    assert retrieved_user.password == "hashedpassword123"
    assert retrieved_user.role == "user"
    assert retrieved_user.id is not None  # Verificar que se haya asignado un ID