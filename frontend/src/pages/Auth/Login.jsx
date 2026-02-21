import React from 'react'
import {useState} from "react";
import {login} from "../../api/auth.api.js";
import {useNavigate} from "react-router-dom";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    // const [loading, setLoading] = useState(true);
    // const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try{
            const res = await login({email, password});
            console.log(res);
            // console.log(res.data.data.token);
            localStorage.setItem("token", res.data.data.token);
            navigate("/login");
        } catch (error) {
            console.log(error.response.data.message);
        }
    }

    return (
        <>
            <div>Login</div>
            <form onSubmit={handleSubmit}>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                <input type="password" value={password} onChange={(e)=>setPassword(e.target.value)}/>
                <button type="submit">Login</button>
            </form>
        </>
    )
}
