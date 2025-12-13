import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Header = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    setIsLoggedIn(!!token);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    setIsLoggedIn(false);
    alert("로그아웃 되었습니다.");
    navigate("/");
  };

  return (
    <div className="navbar bg-base-100 shadow-md px-4">
      <div className="flex-1">
        <Link to="/" className="btn btn-ghost text-xl font-bold text-blue-600">
          Open Insight
        </Link>
      </div>
      <div className="flex-none">
        <ul className="menu menu-horizontal px-1 font-medium">
          <li><Link to="/analysis">상권분석</Link></li>
          <li><Link to="/ranking">창업순위</Link></li>
        </ul>

        {/* 로그인 상태에 따른 버튼 변경 */}
        <div className="flex gap-2">
          {isLoggedIn ? (
            <button 
              onClick={handleLogout} 
              className="btn btn-sm btn-outline btn-error"
            >
              로그아웃
            </button>
          ) : (
            <>
              <Link to="/login" className="btn btn-sm btn-ghost">
                로그인
              </Link>
              <Link to="/signup" className="btn btn-sm btn-primary text-white">
                회원가입
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Header;