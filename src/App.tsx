import {BrowserRouter} from "react-router-dom";
import AppRoutes from "./routes/AppRoutes.tsx";
import {Navigation} from "./exports/exports.ts";


function App() {
    return (
        <BrowserRouter>
            <div className="app">
                <Navigation/>
                <main className="content">
                    <AppRoutes/>
                </main>
            </div>
        </BrowserRouter>
    );
}

export default App;
