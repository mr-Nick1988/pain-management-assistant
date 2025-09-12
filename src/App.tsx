import './App.css';
import {AdminPanel, ChangeCredentials, Login} from "./exports/exports.ts";


function App() {
    return (
        <div>
            <Login/>
            <ChangeCredentials/>
            <AdminPanel/>
        </div>
    );
}

export default App;
