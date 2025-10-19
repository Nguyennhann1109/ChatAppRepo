import { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Thêm dòng này
import { useAuth } from '../../context/AuthContext';
import oauth2Api from '../../api/oauth2Api';
import './Login.css';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate(); // Thêm dòng này

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await login(username, password);
      navigate('/chat'); // Chuyển trang sau khi đăng nhập thành công
    } catch (error) {
      console.error('Đăng nhập thất bại:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = oauth2Api.getGoogleLoginUrl();
  };

  const handleFacebookLogin = () => {
    window.location.href = oauth2Api.getFacebookLoginUrl();
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit} className="login-form">
        <h2>Đăng nhập Chat App</h2>
        
        <input
          type="text"
          placeholder="Tên đăng nhập"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          disabled={loading}
        />
        
        <input
          type="password"
          placeholder="Mật khẩu"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={loading}
        />
        
        <button type="submit" disabled={loading}>
          {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </button>
        
        <div className="oauth-buttons">
          <button type="button" onClick={handleGoogleLogin} className="google-btn">
            Đăng nhập với Google
          </button>
          <button type="button" onClick={handleFacebookLogin} className="facebook-btn">
            Đăng nhập với Facebook
          </button>
        </div>
        
        <p>Chưa có tài khoản? <a href="/register">Đăng ký</a></p>
      </form>
    </div>
  );
}

export default Login;