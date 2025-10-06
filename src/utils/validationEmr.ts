import type {EMR} from "../types/common/types.ts";

export const validateEmr = (form: EMR): Record<string, string> => {
    const errors: Record<string, string> = {};

    if (form.height < 50 || form.height > 250) {
        errors.height = "Height must be between 50 and 250 cm";
    }
    if (form.weight < 2 || form.weight > 300) {
        errors.weight = "Weight must be between 2 and 300 kg";
    }

    if (!["A", "B", "C"].includes(form.childPughScore.trim().toUpperCase())) {
        errors.childPughScore = "Child-Pugh score must be A, B, or C";
    }

    const gfrVal = form.gfr.trim().toUpperCase();
    if (!gfrVal.match(/^(A|B|C|D|E|\d{1,3})$/)) {
        errors.gfr = "Enter GFR as A–E or a number (0–120)";
    }

    if (form.plt < 10 || form.plt > 600) {
        errors.plt = "PLT must be between 10 and 600 (×10³/µL)";
    }
    if (form.wbc < 1 || form.wbc > 50) {
        errors.wbc = "WBC must be between 1 and 50 (×10³/µL)";
    }
    if (form.sat < 85 || form.sat > 100) {
        errors.sat = "Oxygen saturation must be between 85% and 100%";
    }
    if (form.sodium < 100 || form.sodium > 160) {
        errors.sodium = "Sodium must be between 100 and 160 mmol/L";
    }

    return errors;
};
