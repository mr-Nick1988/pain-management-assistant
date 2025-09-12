// import React, {useState} from "react";
//
// import {useRegisterMutation} from "../features/api/apiSlice.js";
// import type {UserRegister} from "../types/userRegister.ts";
//
// const Register: React.FC = () => {
//     const [formData, setFormData] = useState < UserRegister > ({
//         firstName: "",
//         lastName: "",
//         email: "",
//         password: "",
//     });
//
//     const [register, {isLoading, error}] = useRegisterMutation();
//
//     const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//         setFormData({...formData, [e.target.name]: e.target.value});
//     };
//
//     const handleSubmit = async (e: React.FormEvent) => {
//         e.preventDefault();
//         await register(formData);
//     };
//
//     return (
//         <div>
//             <h2>Registration</h2>
//             <form onSubmit={handleSubmit}>
//                 <input
//                     name="firstName"
//                     placeholder="First Name"
//                     value={formData.firstName}
//                     onChange={handleChange}
//                     required
//                 />
//                 <input
//                     name="lastName"
//                     placeholder="Last Name"
//                     value={formData.lastName}
//                     onChange={handleChange}
//                     required
//                 />
//                 <input
//                     name="password"
//                     placeholder="Password"
//                     value={formData.password}
//                     onChange={handleChange}
//                     required
//                 />
//                 <input
//                     name="email"
//                     placeholder="Email"
//                     value={formData.email}
//                     onChange={handleChange}
//                     required
//                 />
//                 <button type="submit" disabled={isLoading}>
//                     {isLoading ? "Loading..." : "Register"}
//                 </button>
//             </form>
//             {error && <p>Error :{JSON.stringify(error)}</p>}
//         </div>
//     );
// };
//export default Register;