import { useState } from "react";
import { Link, useNavigate } from "react-router-dom"
import { authApi } from "../api/authApi";

const Login = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({email: "", password: ""});
    const [error, setError] = useState<string | null>(null);
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({...formData, [e.target.name]: e.target.value});
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await authApi.login(formData);
            localStorage.setItem("accessToken", response.accessToken);
            alert("로그인되었습니다.");
            navigate("/")
            window.location.reload(); // 헤더 상태 갱신
        } catch(err) {
            console.error(err);
            setError("이메일 또는 비밀번호를 확인해주세요");
        }
    };

    return (
    <div className="flex justify-center items-center min-h-[80vh]">
      <div className="card w-96 bg-base-100 shadow-xl border border-gray-200">
        <div className="card-body">
          <h2 className="card-title justify-center mb-4">로그인</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label"><span className="label-text">이메일</span></label>
              <input
                type="email"
                name="email"
                placeholder="example@email.com"
                className="input input-bordered w-full"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="label"><span className="label-text">비밀번호</span></label>
              <input
                type="password"
                name="password"
                placeholder="비밀번호 입력"
                className="input input-bordered w-full"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            <div className="card-actions justify-end mt-4">
              <button type="submit" className="btn btn-primary w-full text-white">로그인</button>
            </div>
          </form>
          <div className="text-center mt-2 text-sm text-gray-500">
            계정이 없으신가요? 
            <Link to="/signup" className="text-blue-500 font-bold">회원가입</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;