import {BrowserRouter} from "react-router-dom";
import AppRoutes from "./routes/AppRoutes.tsx";
import {Navigation} from "./exports/exports.ts";
import {ToastProvider} from "./contexts/ToastContext.tsx";


function App() {
    return (
        <ToastProvider>
            <BrowserRouter>
                <div className="app">
                    <Navigation/>
                    <main className="content">
                        <AppRoutes/>
                    </main>
                </div>
            </BrowserRouter>
        </ToastProvider>
    );
}

export default App;
