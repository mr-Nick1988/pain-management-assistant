import { listenerMiddleware } from "./listenerMiddleware";
import { apiDoctorSlice } from "../api/api/apiDoctorSlice";
import { apiNurseSlice } from "../api/api/apiNurseSlice";

// Когда доктор утверждает рекомендацию
listenerMiddleware.startListening({
    matcher: apiDoctorSlice.endpoints.approveRecommendation.matchFulfilled,
    effect: async (_, { dispatch }) => {
        console.log(" Doctor approved recommendation — invalidating nurse cache...");
        dispatch(apiNurseSlice.util.invalidateTags(["Recommendation"]));
    },
});

// Когда доктор отклоняет рекомендацию
listenerMiddleware.startListening({
    matcher: apiDoctorSlice.endpoints.rejectRecommendation.matchFulfilled,
    effect: async (_, { dispatch }) => {
        console.log(" Doctor rejected recommendation — invalidating nurse cache...");
        dispatch(apiNurseSlice.util.invalidateTags(["Recommendation"]));
    },
});

// (опционально) когда медсестра создаёт новую рекомендацию — инвалидируем pending у доктора
listenerMiddleware.startListening({
    matcher: apiNurseSlice.endpoints.createRecommendation.matchFulfilled,
    effect: async (_, { dispatch }) => {
        console.log(" Nurse created recommendation — invalidating doctor cache...");
        dispatch(apiDoctorSlice.util.invalidateTags(["Recommendation"]));
    },
});