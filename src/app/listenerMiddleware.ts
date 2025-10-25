import {createListenerMiddleware} from "@reduxjs/toolkit";

// Создаём единый экземпляр listenerMiddleware,
// который потом подключается к store и используется другими файлами
export const listenerMiddleware = createListenerMiddleware();
