import { useState } from "react";
import { useNavigate } from "react-router-dom"
import { authApi } from "../api/authApi";

const Signup = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({email: "", password: "", nickname: ""});
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({...formData, [e.target.name]: e.target.value});
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await authApi.signup(formData);
            alert("회원가입 완료");
            navigate("/login");
            
        } catch(err) {
            console.error(err);
            alert("회원가입 중 오류가 발생했습니다.");
        }
    };

    return (
        <div className="flex justify-center items-center min-h-[80vh]">
        <div className="card w-96 bg-base-100 shadow-xl border border-gray-200">
            <div className="card-body">
            <h2 className="card-title justify-center mb-4">회원가입</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                <label className="label"><span className="label-text">이메일</span></label>
                <input
                    type="email"
                    name="email"
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
                    className="input input-bordered w-full"
                    value={formData.password}
                    onChange={handleChange}
                    required
                />
                </div>
                <div>
                <label className="label"><span className="label-text">닉네임</span></label>
                <input
                    type="text"
                    name="nickname"
                    className="input input-bordered w-full"
                    value={formData.nickname}
                    onChange={handleChange}
                    required
                />
                </div>
                <div className="card-actions justify-end mt-4">
                <button type="submit" className="btn btn-primary w-full text-white">가입하기</button>
                </div>
            </form>
            </div>
        </div>
        </div>
    );
};

export default Signup;